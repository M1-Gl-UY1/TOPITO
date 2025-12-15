import React, { useState, useEffect } from 'react';
import { UserRole, FullProfile, MedicalRecord, RegistrationPayload } from './types';
import { Layout } from './components/Layout';
import { PatientSummary, PatientHistory, PatientAccess, PatientProfileView } from './components/PatientViews';
import { DoctorPatientList, DoctorConsultation } from './components/DoctorViews';
import { AdminDashboard, AdminUsersList, AdminValidations } from './components/AdminViews';
import { LabTestRequests, LabTestResults } from './components/LabViews';
import { Activity, ShieldCheck, User as UserIcon, Lock, Loader2, Stethoscope, ChevronLeft, ArrowRight, ShieldAlert, Mail, Phone, Calendar, Hash, Building } from 'lucide-react';
import { api } from './services/api';

const App: React.FC = () => {
  // Authentication State
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userProfile, setUserProfile] = useState<FullProfile | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  // Login/Register Flow State
  const [authStep, setAuthStep] = useState<'role-selection' | 'login' | 'register'>('role-selection');
  const [targetRole, setTargetRole] = useState<UserRole | null>(null);

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Navigation State
  const [activeTab, setActiveTab] = useState('summary');
  const [viewState, setViewState] = useState('list');

  // Theme State
  const [themeMode, setThemeMode] = useState<'cosmic' | 'neon' | 'vintage'>(() => {
    const saved = localStorage.getItem('themeMode');
    return saved === 'neon' ? 'neon' : saved === 'vintage' ? 'vintage' : 'cosmic';
  });

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register Form State
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dob: '',
    gender: 'M',
    licenseNumber: '',
    specialty: '',
    hospital: '',
  });

  // Theme Effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  // Initial Data Load
  useEffect(() => {
    if (token) {
      loadUserData(token);
    }
  }, [token]);

  const loadUserData = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    navigate('/login');
    return;
  }

  try {
    // 1. Récupérer le profil
    const profileData = await api.getProfile(token);
    
    if (profileData.user.error) {
      console.error('Erreur de profil, déconnexion...');
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }
    
    // Stocker les données
    setUser(profileData.user);
    if (profileData.patient) {
      setPatient(profileData.patient);
    }
    
    // 2. Récupérer les dossiers médicaux SEULEMENT si patient
    if (profileData.user.role === 'patient') {
      const records = await api.getMedicalRecords(token, 'patient');
      setMedicalRecords(records);
    }
    
    // 3. Récupérer les stats admin SEULEMENT si admin
    if (profileData.user.role === 'admin') {
      try {
        const stats = await api.admin.getStats(token);
        setAdminStats(stats);
      } catch (adminError) {
        console.warn('Admin stats not accessible:', adminError);
      }
    }
    
    setIsLoading(false);
    
  } catch (error) {
    console.error('Failed to load user data:', error);
    
    // Gestion d'erreur plus robuste
    if (error.message.includes('401') || error.message.includes('403')) {
      // Token invalide ou expiré
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      // Autre erreur, continuer avec des données minimales
      setUser({
        id: 0,
        email: 'unknown@user',
        role: 'user'
      });
      setIsLoading(false);
    }
  }
};

  const selectRole = (role: UserRole) => {
    setTargetRole(role);
    setAuthStep('login');
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const data = await api.login(email, password);
      const authToken = data.token || data.accessToken || data.access || data.key;
      
      if (authToken) {
        let profile: FullProfile;
        const authUser = data.user || data.data || (data.role ? data : null);

        if (authUser) {
             if (!authUser.role) {
                if (authUser.is_superuser || authUser.is_staff) authUser.role = 'admin';
                else if (authUser.user_type) authUser.role = authUser.user_type;
                else authUser.role = 'user';
             }
             profile = { user: authUser };
        } else {
             profile = await api.getProfile(authToken);
        }

        const userRole = profile.user.role;
        let roleValid = false;
        
        if (userRole === 'admin' && targetRole === UserRole.ADMIN) roleValid = true;
        else if (targetRole === UserRole.PATIENT && (userRole === 'patient' || userRole === 'user')) roleValid = true;
        else if (targetRole === UserRole.DOCTOR && userRole === 'doctor') roleValid = true;
        else if (targetRole === UserRole.LAB && userRole === 'laboratory') roleValid = true;

        if (!roleValid) {
          throw new Error(`Ce compte n'est pas autorisé dans l'espace ${targetRole}. Rôle actuel: ${userRole}`);
        }

        localStorage.setItem('token', authToken);
        setToken(authToken);
        setUserProfile(profile);
        
        if (userRole === 'admin') setActiveTab('dashboard');
        else if (userRole === 'patient' || userRole === 'user') {
           const records = await api.getMedicalRecords(authToken);
           setMedicalRecords(records);
           setActiveTab('summary');
        } else if (userRole === 'doctor') {
            setActiveTab('patients');
        } else if (userRole === 'laboratory') {
            setActiveTab('requests');
        }

      } else {
        throw new Error("Jeton d'authentification manquant dans la réponse.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Email ou mot de passe incorrect");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload: RegistrationPayload = {
        email,
        password,
        first_name: regData.firstName,
        last_name: regData.lastName,
        phone: regData.phone,
        role: targetRole === UserRole.LAB ? 'laboratory' : targetRole === UserRole.DOCTOR ? 'doctor' : 'patient',
      };

      if (targetRole === UserRole.PATIENT) {
        payload.date_of_birth = regData.dob;
        payload.gender = regData.gender;
      } else if (targetRole === UserRole.DOCTOR) {
        payload.license_number = regData.licenseNumber;
        payload.specialty = regData.specialty;
        payload.hospital = regData.hospital;
      } else if (targetRole === UserRole.LAB) {
        payload.license_number = regData.licenseNumber;
      }

      await api.register(payload);
      setSuccessMsg("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      setAuthStep('login');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erreur lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUserProfile(null);
    setMedicalRecords([]);
    setViewState('list');
    setEmail('');
    setPassword('');
    setAuthStep('role-selection');
    setTargetRole(null);
  };

  const cycleTheme = () => {
    setThemeMode(prev => 
      prev === 'cosmic' ? 'neon' : prev === 'neon' ? 'vintage' : 'cosmic'
    );
  };

  // --- RENDER UNAUTHENTICATED SCREENS ---
  if (!token) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-500 ${
        themeMode === 'cosmic' ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' :
        themeMode === 'neon' ? 'bg-gradient-to-br from-black via-blue-900 to-cyan-900' :
        'bg-gradient-to-br from-amber-50 via-orange-100 to-yellow-100'
      }`}>
        
        {/* Theme Toggle */}
        <button
          onClick={cycleTheme}
          className="absolute top-6 right-6 p-3 rounded-full backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl hover:scale-110 transition-all z-20 group"
          aria-label="Cycle theme"
        >
          <div className={`w-6 h-6 transition-all duration-500 ${
            themeMode === 'cosmic' ? 'text-purple-300' :
            themeMode === 'neon' ? 'text-cyan-300' :
            'text-amber-600'
          }`}>
            {themeMode === 'cosmic' ? '✨' : themeMode === 'neon' ? '⚡' : '🍂'}
          </div>
        </button>

        {/* Background Effects */}
        {themeMode === 'cosmic' && (
          <>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full mix-blend-screen filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full mix-blend-screen filter blur-3xl animate-pulse delay-1000"></div>
          </>
        )}
        
        {themeMode === 'neon' && (
          <>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-shimmer"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,255,0.1),transparent_50%)]"></div>
          </>
        )}

        <div className="w-full max-w-2xl z-10">

          {/* HEADER */}
          <div className="text-center mb-10 animate-float">
            <div className={`p-5 w-24 h-24 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-5 backdrop-blur-lg border-2 ${
              themeMode === 'cosmic' ? 'bg-white/5 border-purple-400/30' :
              themeMode === 'neon' ? 'bg-black/20 border-cyan-400/40 neon-glow' :
              'bg-amber-50/80 border-amber-400/50'
            }`}>
              <Activity className={`${
                themeMode === 'cosmic' ? 'text-purple-300' :
                themeMode === 'neon' ? 'text-cyan-300' :
                'text-amber-600'
              }`} size={48} />
            </div>
            <h1 className={`text-4xl font-black tracking-wider mb-2 ${
              themeMode === 'cosmic' ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300' :
              themeMode === 'neon' ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-300 neon-text' :
              'text-amber-900'
            }`}>
              TOHPITOH
            </h1>
            <p className={`text-sm font-medium tracking-widest ${
              themeMode === 'cosmic' ? 'text-purple-200/70' :
              themeMode === 'neon' ? 'text-cyan-200/70' :
              'text-amber-700/70'
            }`}>
              DOSSIER ÉLECTRONIQUE DU PATIENT
            </p>
          </div>

          {/* STEP 1: ROLE SELECTION */}
          {authStep === 'role-selection' && (
            <div className="grid grid-cols-2 gap-4 animate-fade-in max-w-xl mx-auto">
              <button
                onClick={() => selectRole(UserRole.PATIENT)}
                className={`p-6 rounded-2xl backdrop-blur-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl group ${
                  themeMode === 'cosmic' ? 'bg-white/5 border-purple-400/20 hover:border-purple-400/60' :
                  themeMode === 'neon' ? 'bg-black/20 border-cyan-400/30 hover:border-cyan-400 neon-border' :
                  'bg-amber-50/50 border-amber-300/50 hover:border-amber-500'
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className={`p-4 rounded-xl transition-all duration-300 group-hover:rotate-12 ${
                    themeMode === 'cosmic' ? 'bg-purple-500/20' :
                    themeMode === 'neon' ? 'bg-cyan-500/20' :
                    'bg-amber-200'
                  }`}>
                    <UserIcon className={`${
                      themeMode === 'cosmic' ? 'text-purple-300' :
                      themeMode === 'neon' ? 'text-cyan-300' :
                      'text-amber-600'
                    }`} size={28} />
                  </div>
                  <div className="text-center">
                    <h3 className={`font-bold text-lg mb-1 ${
                      themeMode === 'cosmic' ? 'text-white' :
                      themeMode === 'neon' ? 'text-white' :
                      'text-amber-900'
                    }`}>
                      Patient
                    </h3>
                    <p className={`text-xs ${
                      themeMode === 'cosmic' ? 'text-purple-200/60' :
                      themeMode === 'neon' ? 'text-cyan-200/60' :
                      'text-amber-700/70'
                    }`}>
                      Accéder à mon dossier médical
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => selectRole(UserRole.DOCTOR)}
                className={`p-6 rounded-2xl backdrop-blur-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl group ${
                  themeMode === 'cosmic' ? 'bg-white/5 border-emerald-400/20 hover:border-emerald-400/60' :
                  themeMode === 'neon' ? 'bg-black/20 border-green-400/30 hover:border-green-400 neon-border' :
                  'bg-emerald-50/50 border-emerald-300/50 hover:border-emerald-500'
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className={`p-4 rounded-xl transition-all duration-300 group-hover:-rotate-12 ${
                    themeMode === 'cosmic' ? 'bg-emerald-500/20' :
                    themeMode === 'neon' ? 'bg-green-500/20' :
                    'bg-emerald-200'
                  }`}>
                    <Stethoscope className={`${
                      themeMode === 'cosmic' ? 'text-emerald-300' :
                      themeMode === 'neon' ? 'text-green-300' :
                      'text-emerald-600'
                    }`} size={28} />
                  </div>
                  <div className="text-center">
                    <h3 className={`font-bold text-lg mb-1 ${
                      themeMode === 'cosmic' ? 'text-white' :
                      themeMode === 'neon' ? 'text-white' :
                      'text-emerald-900'
                    }`}>
                      Médecin
                    </h3>
                    <p className={`text-xs ${
                      themeMode === 'cosmic' ? 'text-emerald-200/60' :
                      themeMode === 'neon' ? 'text-green-200/60' :
                      'text-emerald-700/70'
                    }`}>
                      Gestion des patients et soins
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => selectRole(UserRole.LAB)}
                className={`p-6 rounded-2xl backdrop-blur-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl group ${
                  themeMode === 'cosmic' ? 'bg-white/5 border-blue-400/20 hover:border-blue-400/60' :
                  themeMode === 'neon' ? 'bg-black/20 border-blue-400/30 hover:border-blue-400 neon-border' :
                  'bg-blue-50/50 border-blue-300/50 hover:border-blue-500'
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className={`p-4 rounded-xl transition-all duration-300 group-hover:rotate-45 ${
                    themeMode === 'cosmic' ? 'bg-blue-500/20' :
                    themeMode === 'neon' ? 'bg-blue-500/20' :
                    'bg-blue-200'
                  }`}>
                    <ShieldCheck className={`${
                      themeMode === 'cosmic' ? 'text-blue-300' :
                      themeMode === 'neon' ? 'text-blue-300' :
                      'text-blue-600'
                    }`} size={28} />
                  </div>
                  <div className="text-center">
                    <h3 className={`font-bold text-lg mb-1 ${
                      themeMode === 'cosmic' ? 'text-white' :
                      themeMode === 'neon' ? 'text-white' :
                      'text-blue-900'
                    }`}>
                      Laboratoire
                    </h3>
                    <p className={`text-xs ${
                      themeMode === 'cosmic' ? 'text-blue-200/60' :
                      themeMode === 'neon' ? 'text-blue-200/60' :
                      'text-blue-700/70'
                    }`}>
                      Traitement des analyses
                    </p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => selectRole(UserRole.ADMIN)}
                className={`p-6 rounded-2xl backdrop-blur-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl group ${
                  themeMode === 'cosmic' ? 'bg-white/5 border-red-400/20 hover:border-red-400/60' :
                  themeMode === 'neon' ? 'bg-black/20 border-pink-400/30 hover:border-pink-400 neon-border' :
                  'bg-rose-50/50 border-rose-300/50 hover:border-rose-500'
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  <div className={`p-4 rounded-xl transition-all duration-300 group-hover:-rotate-45 ${
                    themeMode === 'cosmic' ? 'bg-red-500/20' :
                    themeMode === 'neon' ? 'bg-pink-500/20' :
                    'bg-rose-200'
                  }`}>
                    <ShieldAlert className={`${
                      themeMode === 'cosmic' ? 'text-red-300' :
                      themeMode === 'neon' ? 'text-pink-300' :
                      'text-rose-600'
                    }`} size={28} />
                  </div>
                  <div className="text-center">
                    <h3 className={`font-bold text-lg mb-1 ${
                      themeMode === 'cosmic' ? 'text-white' :
                      themeMode === 'neon' ? 'text-white' :
                      'text-rose-900'
                    }`}>
                      Admin
                    </h3>
                    <p className={`text-xs ${
                      themeMode === 'cosmic' ? 'text-red-200/60' :
                      themeMode === 'neon' ? 'text-pink-200/60' :
                      'text-rose-700/70'
                    }`}>
                      Administration Système
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* AUTH CONTAINER */}
          {(authStep === 'login' || authStep === 'register') && targetRole && (
            <div className={`max-w-md mx-auto rounded-3xl p-8 backdrop-blur-xl border-2 animate-slide-in ${
              themeMode === 'cosmic' ? 'bg-white/5 border-purple-400/30' :
              themeMode === 'neon' ? 'bg-black/30 border-cyan-400/40 neon-container' :
              'bg-white/90 border-amber-300/50'
            }`}>
              <button
                onClick={() => {
                  setAuthStep('role-selection');
                  setError('');
                  setSuccessMsg('');
                }}
                className={`p-2 rounded-lg mb-6 transition-all hover:scale-110 ${
                  themeMode === 'cosmic' ? 'text-purple-300 hover:bg-purple-500/20' :
                  themeMode === 'neon' ? 'text-cyan-300 hover:bg-cyan-500/20' :
                  'text-amber-600 hover:bg-amber-200'
                }`}
              >
                <ChevronLeft size={28} />
              </button>

              <div className="text-center mb-8">
                <h2 className={`text-2xl font-bold mb-2 ${
                  themeMode === 'cosmic' ? 'text-white' :
                  themeMode === 'neon' ? 'text-white' :
                  'text-amber-900'
                }`}>
                  {targetRole === UserRole.PATIENT ? 'Espace Patient' :
                   targetRole === UserRole.DOCTOR ? 'Espace Médecin' :
                   targetRole === UserRole.LAB ? 'Espace Laboratoire' : 'Espace Admin'}
                </h2>
                <div className={`h-1 w-20 mx-auto rounded-full ${
                  themeMode === 'cosmic' ? 'bg-gradient-to-r from-purple-400 to-pink-400' :
                  themeMode === 'neon' ? 'bg-gradient-to-r from-cyan-400 to-blue-400' :
                  'bg-gradient-to-r from-amber-400 to-orange-400'
                }`}></div>
              </div>

              {error && (
                <div className={`p-4 rounded-xl mb-6 animate-shake ${
                  themeMode === 'cosmic' ? 'bg-red-500/20 border border-red-400/30' :
                  themeMode === 'neon' ? 'bg-red-500/20 border border-red-400/50 neon-alert' :
                  'bg-red-100 border border-red-300'
                }`}>
                  <p className={`text-center font-medium ${
                    themeMode === 'cosmic' ? 'text-red-200' :
                    themeMode === 'neon' ? 'text-red-300' :
                    'text-red-700'
                  }`}>
                    ⚠️ {error}
                  </p>
                </div>
              )}

              {successMsg && (
                <div className={`p-4 rounded-xl mb-6 ${
                  themeMode === 'cosmic' ? 'bg-emerald-500/20 border border-emerald-400/30' :
                  themeMode === 'neon' ? 'bg-green-500/20 border border-green-400/50 neon-success' :
                  'bg-emerald-100 border border-emerald-300'
                }`}>
                  <p className={`text-center font-medium ${
                    themeMode === 'cosmic' ? 'text-emerald-200' :
                    themeMode === 'neon' ? 'text-green-300' :
                    'text-emerald-700'
                  }`}>
                    ✓ {successMsg}
                  </p>
                </div>
              )}

              {/* LOGIN FORM */}
              {authStep === 'login' && (
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <div className="relative group">
                      <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                        themeMode === 'cosmic' ? 'text-purple-300/60' :
                        themeMode === 'neon' ? 'text-cyan-300/60' :
                        'text-amber-500/60'
                      }`} size={20} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl backdrop-blur-lg border-2 focus:outline-none transition-all duration-300 ${
                          themeMode === 'cosmic' ? 
                            'bg-white/5 border-purple-400/20 text-white placeholder-purple-300/40 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20' :
                          themeMode === 'neon' ?
                            'bg-black/20 border-cyan-400/30 text-white placeholder-cyan-300/40 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/30' :
                            'bg-white/80 border-amber-300/50 text-amber-900 placeholder-amber-500/60 focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/20'
                        }`}
                        placeholder="exemple@email.com"
                      />
                    </div>
                    
                    <div className="relative group">
                      <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                        themeMode === 'cosmic' ? 'text-purple-300/60' :
                        themeMode === 'neon' ? 'text-cyan-300/60' :
                        'text-amber-500/60'
                      }`} size={20} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-12 pr-4 py-4 rounded-xl backdrop-blur-lg border-2 focus:outline-none transition-all duration-300 ${
                          themeMode === 'cosmic' ? 
                            'bg-white/5 border-purple-400/20 text-white placeholder-purple-300/40 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20' :
                          themeMode === 'neon' ?
                            'bg-black/20 border-cyan-400/30 text-white placeholder-cyan-300/40 focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-500/30' :
                            'bg-white/80 border-amber-300/50 text-amber-900 placeholder-amber-500/60 focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/20'
                        }`}
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold transition-all duration-300 transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-2xl ${
                      targetRole === UserRole.PATIENT ? (
                        themeMode === 'cosmic' ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' :
                        themeMode === 'neon' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600' :
                        'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                      ) : targetRole === UserRole.DOCTOR ? (
                        themeMode === 'cosmic' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600' :
                        themeMode === 'neon' ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' :
                        'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                      ) : targetRole === UserRole.LAB ? (
                        themeMode === 'cosmic' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' :
                        themeMode === 'neon' ? 'bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600' :
                        'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                      ) : (
                        themeMode === 'cosmic' ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600' :
                        themeMode === 'neon' ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600' :
                        'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600'
                      )
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="animate-spin mx-auto" size={24} />
                    ) : (
                      <span className="text-white tracking-wider">SE CONNECTER</span>
                    )}
                  </button>

                  {targetRole !== UserRole.ADMIN && (
                    <div className="text-center pt-4 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setAuthStep('register')}
                        className={`text-sm font-bold transition-all hover:scale-105 ${
                          themeMode === 'cosmic' ? 'text-purple-300 hover:text-purple-200' :
                          themeMode === 'neon' ? 'text-cyan-300 hover:text-cyan-200' :
                          'text-amber-600 hover:text-amber-700'
                        }`}
                      >
                        CRÉER UN COMPTE →
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* REGISTER FORM */}
              {authStep === 'register' && (
                <form onSubmit={handleRegister} className="space-y-3 max-h-[60vh] overflow-y-auto pr-1 scroll-smooth">
                   {/* Common Fields */}
                   <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Prénom</label>
                        <input 
                            type="text" required value={regData.firstName}
                            onChange={(e) => setRegData({...regData, firstName: e.target.value})}
                            className={`w-full px-3 py-2 rounded-lg border-2 ${
                              themeMode === 'cosmic' ? 'bg-white/5 border-purple-400/20 text-white' :
                              themeMode === 'neon' ? 'bg-black/20 border-cyan-400/30 text-white' :
                              'bg-white/80 border-amber-300/50 text-amber-900'
                            }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Nom</label>
                        <input 
                            type="text" required value={regData.lastName}
                            onChange={(e) => setRegData({...regData, lastName: e.target.value})}
                            className={`w-full px-3 py-2 rounded-lg border-2 ${
                              themeMode === 'cosmic' ? 'bg-white/5 border-purple-400/20 text-white' :
                              themeMode === 'neon' ? 'bg-black/20 border-cyan-400/30 text-white' :
                              'bg-white/80 border-amber-300/50 text-amber-900'
                            }`}
                        />
                      </div>
                   </div>

                   <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Email</label>
                      <input 
                          type="email" required value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border-2 ${
                            themeMode === 'cosmic' ? 'bg-white/5 border-purple-400/20 text-white' :
                            themeMode === 'neon' ? 'bg-black/20 border-cyan-400/30 text-white' :
                            'bg-white/80 border-amber-300/50 text-amber-900'
                          }`}
                      />
                   </div>

                   <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Mot de passe</label>
                      <input 
                          type="password" required value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border-2 ${
                            themeMode === 'cosmic' ? 'bg-white/5 border-purple-400/20 text-white' :
                            themeMode === 'neon' ? 'bg-black/20 border-cyan-400/30 text-white' :
                            'bg-white/80 border-amber-300/50 text-amber-900'
                          }`}
                      />
                   </div>
                   
                   <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Téléphone</label>
                      <div className="relative">
                        <Phone className={`absolute left-3 top-2.5 ${
                          themeMode === 'cosmic' ? 'text-purple-300/60' :
                          themeMode === 'neon' ? 'text-cyan-300/60' :
                          'text-amber-500/60'
                        }`} size={14} />
                        <input 
                            type="tel" required value={regData.phone}
                            onChange={(e) => setRegData({...regData, phone: e.target.value})}
                            className={`w-full pl-8 pr-3 py-2 rounded-lg border-2 ${
                              themeMode === 'cosmic' ? 'bg-white/5 border-purple-400/20 text-white' :
                              themeMode === 'neon' ? 'bg-black/20 border-cyan-400/30 text-white' :
                              'bg-white/80 border-amber-300/50 text-amber-900'
                            }`}
                        />
                      </div>
                   </div>

                   {/* PATIENT SPECIFIC */}
                   {targetRole === UserRole.PATIENT && (
                       <div className={`p-3 rounded-lg border-2 space-y-3 ${
                         themeMode === 'cosmic' ? 'bg-purple-500/10 border-purple-400/20' :
                         themeMode === 'neon' ? 'bg-cyan-500/10 border-cyan-400/30' :
                         'bg-amber-100 border-amber-300/50'
                       }`}>
                           <p className={`text-[10px] font-bold uppercase ${
                             themeMode === 'cosmic' ? 'text-purple-300' :
                             themeMode === 'neon' ? 'text-cyan-300' :
                             'text-amber-700'
                           }`}>
                             Infos Patient
                           </p>
                           <div>
                              <label className="block text-[10px] mb-1">Date de Naissance</label>
                              <div className="relative">
                                <Calendar className={`absolute left-3 top-2.5 ${
                                  themeMode === 'cosmic' ? 'text-purple-300/60' :
                                  themeMode === 'neon' ? 'text-cyan-300/60' :
                                  'text-amber-500/60'
                                }`} size={14} />
                                <input 
                                    type="date" required value={regData.dob}
                                    onChange={(e) => setRegData({...regData, dob: e.target.value})}
                                    className={`w-full pl-8 pr-3 py-2 rounded-lg border-2 ${
                                      themeMode === 'cosmic' ? 'bg-white/10 border-purple-400/20 text-white' :
                                      themeMode === 'neon' ? 'bg-black/30 border-cyan-400/30 text-white' :
                                      'bg-white border-amber-300/50 text-amber-900'
                                    }`}
                                />
                              </div>
                           </div>
                           <div>
                              <label className="block text-[10px] mb-1">Genre</label>
                              <select 
                                value={regData.gender}
                                onChange={(e) => setRegData({...regData, gender: e.target.value})}
                                className={`w-full px-3 py-2 rounded-lg border-2 ${
                                  themeMode === 'cosmic' ? 'bg-white/10 border-purple-400/20 text-white' :
                                  themeMode === 'neon' ? 'bg-black/30 border-cyan-400/30 text-white' :
                                  'bg-white border-amber-300/50 text-amber-900'
                                }`}
                              >
                                <option value="M">Masculin</option>
                                <option value="F">Féminin</option>
                                <option value="O">Autre</option>
                              </select>
                           </div>
                       </div>
                   )}

                   {/* DOCTOR SPECIFIC */}
                   {targetRole === UserRole.DOCTOR && (
                       <div className={`p-3 rounded-lg border-2 space-y-3 ${
                         themeMode === 'cosmic' ? 'bg-emerald-500/10 border-emerald-400/20' :
                         themeMode === 'neon' ? 'bg-green-500/10 border-green-400/30' :
                         'bg-emerald-100 border-emerald-300/50'
                       }`}>
                           <p className={`text-[10px] font-bold uppercase ${
                             themeMode === 'cosmic' ? 'text-emerald-300' :
                             themeMode === 'neon' ? 'text-green-300' :
                             'text-emerald-700'
                           }`}>
                             Infos Professionnelles
                           </p>
                           <div>
                              <label className="block text-[10px] mb-1">Numéro de Licence</label>
                              <div className="relative">
                                <Hash className={`absolute left-3 top-2.5 ${
                                  themeMode === 'cosmic' ? 'text-emerald-300/60' :
                                  themeMode === 'neon' ? 'text-green-300/60' :
                                  'text-emerald-500/60'
                                }`} size={14} />
                                <input 
                                    type="text" required value={regData.licenseNumber}
                                    onChange={(e) => setRegData({...regData, licenseNumber: e.target.value})}
                                    className={`w-full pl-8 pr-3 py-2 rounded-lg border-2 ${
                                      themeMode === 'cosmic' ? 'bg-white/10 border-emerald-400/20 text-white' :
                                      themeMode === 'neon' ? 'bg-black/30 border-green-400/30 text-white' :
                                      'bg-white border-emerald-300/50 text-emerald-900'
                                    }`}
                                    placeholder="LIC-12345"
                                />
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-2">
                               <div>
                                  <label className="block text-[10px] mb-1">Spécialité</label>
                                  <input 
                                      type="text" required value={regData.specialty}
                                      onChange={(e) => setRegData({...regData, specialty: e.target.value})}
                                      className={`w-full px-3 py-2 rounded-lg border-2 ${
                                        themeMode === 'cosmic' ? 'bg-white/10 border-emerald-400/20 text-white' :
                                        themeMode === 'neon' ? 'bg-black/30 border-green-400/30 text-white' :
                                        'bg-white border-emerald-300/50 text-emerald-900'
                                      }`}
                                  />
                               </div>
                               <div>
                                  <label className="block text-[10px] mb-1">Hôpital/Clinique</label>
                                  <input 
                                      type="text" required value={regData.hospital}
                                      onChange={(e) => setRegData({...regData, hospital: e.target.value})}
                                      className={`w-full px-3 py-2 rounded-lg border-2 ${
                                        themeMode === 'cosmic' ? 'bg-white/10 border-emerald-400/20 text-white' :
                                        themeMode === 'neon' ? 'bg-black/30 border-green-400/30 text-white' :
                                        'bg-white border-emerald-300/50 text-emerald-900'
                                      }`}
                                  />
                               </div>
                           </div>
                       </div>
                   )}

                   {/* LAB SPECIFIC */}
                   {targetRole === UserRole.LAB && (
                       <div className={`p-3 rounded-lg border-2 space-y-3 ${
                         themeMode === 'cosmic' ? 'bg-blue-500/10 border-blue-400/20' :
                         themeMode === 'neon' ? 'bg-blue-500/10 border-blue-400/30' :
                         'bg-blue-100 border-blue-300/50'
                       }`}>
                           <p className={`text-[10px] font-bold uppercase ${
                             themeMode === 'cosmic' ? 'text-blue-300' :
                             themeMode === 'neon' ? 'text-blue-300' :
                             'text-blue-700'
                           }`}>
                             Infos Laboratoire
                           </p>
                           <div>
                              <label className="block text-[10px] mb-1">Numéro d'Accréditation</label>
                              <div className="relative">
                                <Hash className={`absolute left-3 top-2.5 ${
                                  themeMode === 'cosmic' ? 'text-blue-300/60' :
                                  themeMode === 'neon' ? 'text-blue-300/60' :
                                  'text-blue-500/60'
                                }`} size={14} />
                                <input 
                                    type="text" required value={regData.licenseNumber}
                                    onChange={(e) => setRegData({...regData, licenseNumber: e.target.value})}
                                    className={`w-full pl-8 pr-3 py-2 rounded-lg border-2 ${
                                      themeMode === 'cosmic' ? 'bg-white/10 border-blue-400/20 text-white' :
                                      themeMode === 'neon' ? 'bg-black/30 border-blue-400/30 text-white' :
                                      'bg-white border-blue-300/50 text-blue-900'
                                    }`}
                                    placeholder="LAB-98765"
                                />
                              </div>
                           </div>
                       </div>
                   )}

                   <div className="pt-2">
                      <button 
                        type="submit"
                        disabled={loading}
                        className={`w-full flex items-center justify-center p-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-95 shadow-2xl disabled:opacity-70 disabled:scale-100 ${
                          targetRole === UserRole.PATIENT ? (
                            themeMode === 'cosmic' ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' :
                            themeMode === 'neon' ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600' :
                            'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                          ) : targetRole === UserRole.DOCTOR ? (
                            themeMode === 'cosmic' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600' :
                            themeMode === 'neon' ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' :
                            'bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600'
                          ) : (
                            themeMode === 'cosmic' ? 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600' :
                            themeMode === 'neon' ? 'bg-gradient-to-r from-blue-500 to-violet-500 hover:from-blue-600 hover:to-violet-600' :
                            'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                          )
                        }`}
                      >
                        {loading ? <Loader2 className="animate-spin" /> : "S'INSCRIRE"}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setAuthStep('login')}
                        className={`w-full text-center text-xs mt-3 ${
                          themeMode === 'cosmic' ? 'text-purple-300/60 hover:text-purple-200' :
                          themeMode === 'neon' ? 'text-cyan-300/60 hover:text-cyan-200' :
                          'text-amber-600 hover:text-amber-700'
                        }`}
                      >
                        Annuler
                      </button>
                   </div>
                </form>
              )}
            </div>
          )}
          
          <div className="mt-8 text-center">
            <p className={`text-[10px] tracking-widest ${
              themeMode === 'cosmic' ? 'text-purple-300/40' :
              themeMode === 'neon' ? 'text-cyan-300/40' :
              'text-amber-600/40'
            }`}>
              © 2024 TOHPITOH - Plateforme de Santé Numérique
            </p>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER AUTHENTICATED SCREENS ---
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        themeMode === 'cosmic' ? 'bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900' :
        themeMode === 'neon' ? 'bg-gradient-to-br from-black via-blue-900 to-cyan-900' :
        'bg-gradient-to-br from-amber-50 via-orange-100 to-yellow-100'
      }`}>
        <div className="text-center">
          <div className={`p-6 rounded-2xl backdrop-blur-lg border-2 animate-pulse ${
            themeMode === 'cosmic' ? 'border-purple-400/30' :
            themeMode === 'neon' ? 'border-cyan-400/40' :
            'border-amber-300/50'
          }`}>
            <Loader2 className={`animate-spin mx-auto mb-4 ${
              themeMode === 'cosmic' ? 'text-purple-300' :
              themeMode === 'neon' ? 'text-cyan-300' :
              'text-amber-500'
            }`} size={48} />
            <p className={`font-medium ${
              themeMode === 'cosmic' ? 'text-purple-200' :
              themeMode === 'neon' ? 'text-cyan-200' :
              'text-amber-700'
            }`}>
              CHARGEMENT...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const role = userProfile?.user.role;

  return (
    <Layout
      userRole={role as UserRole || null}
      onLogout={handleLogout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      themeMode={themeMode}
      cycleTheme={cycleTheme}
    >
      {/* PATIENT VIEWS */}
      {(role === 'patient' || role === 'user') && (
        <>
          {activeTab === 'summary' && userProfile && (
            <PatientSummary
              user={userProfile.user}
              patient={userProfile.patient}
              medicalRecords={medicalRecords}
            />
          )}
          {activeTab === 'history' && (
            <PatientHistory records={medicalRecords} />
          )}
          {activeTab === 'access' && (
            <PatientAccess token={token || ''} />
          )}
          {activeTab === 'profile' && userProfile && (
            <PatientProfileView
              user={userProfile.user}
              patient={userProfile.patient}
            />
          )}
        </>
      )}

      {/* DOCTOR VIEWS */}
      {role === 'doctor' && (
        <>
          {activeTab === 'patients' && (
            <DoctorPatientList token={token || ''} />
          )}
          {activeTab === 'consultations' && (
            <DoctorConsultation token={token || ''} />
          )}
        </>
      )}

      {/* LAB VIEWS */}
      {role === 'laboratory' && (
        <>
          {activeTab === 'requests' && (
            <LabTestRequests token={token || ''} />
          )}
          {activeTab === 'results' && (
            <LabTestResults token={token || ''} />
          )}
        </>
      )}

      {/* ADMIN VIEWS */}
      {role === 'admin' && (
        <>
          {activeTab === 'dashboard' && (
            <AdminDashboard token={token || ''} />
          )}
          {activeTab === 'validations' && (
            <AdminValidations token={token || ''} />
          )}
          {activeTab === 'users' && (
            <AdminUsersList token={token || ''} />
          )}
        </>
      )}
    </Layout>
  );
};

export default App;