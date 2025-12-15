import { MedicalRecord, FullProfile, AdminStats, User, RegistrationPayload } from '../types';

const BASE_URL = 'https://tohpitoh-api.onrender.com/api/v1';

// Helper for headers
const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Error handling helper
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorBody = await response.text();
    // Try to parse JSON error if possible
    try {
        const jsonError = JSON.parse(errorBody);
        throw new Error(jsonError.message || `Erreur HTTP: ${response.status}`);
    } catch (e) {
        throw new Error(errorBody || `Erreur HTTP: ${response.status}`);
    }
  }
  return response.json();
};

export const api = {
  // --- AUTHENTICATION ---
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${BASE_URL}/jwt/auth`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Login Error:', error);
      throw error;
    }
  },

  register: async (payload: RegistrationPayload) => {
    try {
      const response = await fetch(`${BASE_URL}/jwt/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API Register Error:', error);
      throw error;
    }
  },

  // --- USER DATA ---
  // --- USER DATA ---
getProfile: async (token: string): Promise<FullProfile> => {
  try {
    // ÉTAPE 1: Déterminer le type d'utilisateur en testant différents endpoints
    let userRole = 'user';
    let userData: any = {};
    let patientData: any = undefined;

    // Testez les endpoints dans l'ordre (admin -> doctor -> laboratory -> patient)
    const endpointsToTest = [
      { 
        url: `${BASE_URL}/admin/statistics`, 
        role: 'admin',
        profileUrl: null // Admins n'ont pas de profil spécifique dans ce système
      },
      { 
        url: `${BASE_URL}/doctors/profile/me`, 
        role: 'doctor',
        profileUrl: `${BASE_URL}/doctors/profile/me`
      },
      { 
        url: `${BASE_URL}/laboratories/profile/me`, 
        role: 'laboratory', 
        profileUrl: `${BASE_URL}/laboratories/profile/me`
      },
      { 
        url: `${BASE_URL}/patients/profile`, 
        role: 'patient',
        profileUrl: `${BASE_URL}/patients/profile`
      }
    ];

    // Testez chaque endpoint pour déterminer le rôle
    for (const endpoint of endpointsToTest) {
      try {
        const testResponse = await fetch(endpoint.url, {
          method: 'GET',
          headers: getHeaders(token),
        });

        // Si la réponse est OK (200) ou même 403 (accès mais interdit), 
        // c'est qu'on a trouvé le bon "type" d'utilisateur
        if (testResponse.status === 200 || testResponse.status === 403) {
          userRole = endpoint.role;
          
          // Récupérer les données du profil si l'endpoint existe
          if (endpoint.profileUrl) {
            const profileResponse = await fetch(endpoint.profileUrl, {
              headers: getHeaders(token),
            });
            
            if (profileResponse.ok) {
              const rawProfileData = await profileResponse.json();
              userData = rawProfileData.user || rawProfileData.data || rawProfileData;
              
              // Si c'est un patient, stocker aussi dans patientData
              if (userRole === 'patient') {
                patientData = userData;
              }
            }
          } else if (userRole === 'admin') {
            // Pour admin, on peut récupérer des infos basiques
            // Essayez de décoder le token pour obtenir l'email
            try {
              const tokenPayload = JSON.parse(atob(token.split('.')[1]));
              userData = {
                id: tokenPayload.userId || tokenPayload.sub,
                email: tokenPayload.email,
                role: 'admin'
              };
            } catch (e) {
              userData = { role: 'admin', email: 'admin@system' };
            }
          }
          break; // On a trouvé le rôle, on arrête
        }
      } catch (error) {
        console.warn(`Test endpoint ${endpoint.url} failed:`, error);
        continue;
      }
    }

    // Si on n'a pas trouvé de rôle, essayer de décoder le token
    if (!userData.id && token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        userData = {
          id: tokenPayload.userId || tokenPayload.sub,
          email: tokenPayload.email || 'unknown@user',
          role: userRole
        };
      } catch (e) {
        userData = { role: userRole, email: 'unknown@user' };
      }
    }

    // Assurez-vous que le rôle est défini
    userData.role = userRole;

    return {
      user: userData,
      patient: patientData
    };

  } catch (error) {
    console.error('API Profile Error:', error);
    // Retourner un profil minimal plutôt que de lancer une erreur
    return {
      user: {
        id: 0,
        email: 'error@user',
        role: 'user',
        error: true
      },
      patient: undefined
    };
  }
},

  getMedicalRecords: async (token: string, role?: string): Promise<MedicalRecord[]> => {
  // Ne pas appeler si l'utilisateur n'est pas patient
  if (role && role !== 'patient') {
    return [];
  }
  
  try {
    const response = await fetch(`${BASE_URL}/patients/medical-records`, {
      headers: getHeaders(token),
    });
    
    // Si 403, c'est normal (pas patient), retourner tableau vide
    if (response.status === 403) {
      return [];
    }
    
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : (data.records || data.data || []);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    return [];
  }
},

  updateProfile: async (token: string, profileData: any) => {
    const response = await fetch(`${BASE_URL}/jwt/profile`, {
      method: 'PUT',
      headers: getHeaders(token),
      body: JSON.stringify(profileData),
    });
    return handleResponse(response);
  },

  // --- PATIENT SPECIFIC ---
  patient: {
    updatePatientInfo: async (token: string, patientData: any) => {
      const response = await fetch(`${BASE_URL}/patients/profile/me`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(patientData),
      });
      return handleResponse(response);
    },

    getAccessPermissions: async (token: string) => {
      try {
        const response = await fetch(`${BASE_URL}/patients/granted-accesses`, {
          headers: getHeaders(token),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
      } catch (error) {
        console.error('Error fetching permissions:', error);
        return [];
      }
    },

    grantPermission: async (token: string, permissionData: any) => {
      const response = await fetch(`${BASE_URL}/patients/grant`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(permissionData),
      });
      return handleResponse(response);
    },

    revokePermission: async (token: string, permissionId: number) => {
      const response = await fetch(`${BASE_URL}/patients/revoke/${permissionId}`, {
        method: 'DELETE',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    getAllDoctors: async (token: string) => {
      try {
        const response = await fetch(`${BASE_URL}/doctors`, {
          headers: getHeaders(token),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
      } catch (error) {
        console.error('Error fetching doctors:', error);
        return [];
      }
    },
  },

  // --- DOCTOR SPECIFIC ---
  doctor: {
    getMyPatients: async (token: string) => {
      try {
        const response = await fetch(`${BASE_URL}/doctors`, {
          headers: getHeaders(token),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
      } catch (error) {
        console.error('Error fetching doctor patients:', error);
        return [];
      }
    },

    createMedicalRecord: async (token: string, recordData: any) => {
      const response = await fetch(`${BASE_URL}/doctors/patients/${recordData.patient_id}/medical-records`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(recordData),
      });
      return handleResponse(response);
    },

    createPrescription: async (token: string, prescriptionData: any) => {
      const response = await fetch(`${BASE_URL}/doctors/prescriptions`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(prescriptionData),
      });
      return handleResponse(response);
    },

    orderLabTest: async (token: string, labTestData: any) => {
      const response = await fetch(`${BASE_URL}/doctors/lab-tests`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(labTestData),
      });
      return handleResponse(response);
    },
  },

  // --- LABORATORY SPECIFIC ---
  laboratory: {
    getPendingTests: async (token: string) => {
      try {
        const response = await fetch(`${BASE_URL}/laboratories/tests`, {
          headers: getHeaders(token),
        });
        if (!response.ok) return [];
        const data = await response.json();
        return Array.isArray(data) ? data : data.data || [];
      } catch (error) {
        console.error('Error fetching pending tests:', error);
        return [];
      }
    },

    startTest: async (token: string, testId: number) => {
      const response = await fetch(`${BASE_URL}/laboratories/update-exam-status`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ testId, status: 'in_progress' }),
      });
      return handleResponse(response);
    },

    completeTest: async (token: string, testId: number, results: any) => {
      const response = await fetch(`${BASE_URL}/laboratories/tests/${testId}/results`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify(results),
      });
      return handleResponse(response);
    },
  },

  // --- ADMIN NAMESPACE ---
  admin: {
    getStats: async (token: string): Promise<AdminStats> => {
      // Calling the real endpoint based on swagger
      const response = await fetch(`${BASE_URL}/admin/statistics`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    getAllUsers: async (token: string): Promise<User[]> => {
      const response = await fetch(`${BASE_URL}/admin/all-users`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    getPendingValidations: async (token: string) => {
      const response = await fetch(`${BASE_URL}/admin/pending-validations`, {
        headers: getHeaders(token),
      });
      return handleResponse(response);
    },

    validateProfessional: async (token: string, id: number, type: 'doctor' | 'laboratory', action: 'approve' | 'reject') => {
      // Constructing endpoint based on Swagger: /api/v1/admin/doctors/{id}/approve
      const endpoint = type === 'doctor' 
        ? `${BASE_URL}/admin/doctors/${id}/${action}`
        : `${BASE_URL}/admin/laboratories/${id}/${action}`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: getHeaders(token),
      });
      return handleResponse(response);
    }
  }
};