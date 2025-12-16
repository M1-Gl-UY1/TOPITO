import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Activity, Lock, Loader2, FileText, Pill, Beaker, User, Calendar, Clock, Thermometer, Scale, Droplets, Heart, Stethoscope, Microscope, Zap, History, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { RecordType, MedicalRecord } from '../types';
import { api } from '../services/api';

interface Patient {
  id: number;
  user_id: number;
  gender: string;
  date_of_birth: string;
  blood_type: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface DoctorProps {
  token: string;
}

export const DoctorPatientList: React.FC<DoctorProps> = ({ token }) => {
  const [viewState, setViewState] = useState<'list' | 'consultation'>('list');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    loadPatients();
  }, [token]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await api.doctor.getMyPatients(token);
      setPatients(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Error loading patients:', error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(patient =>
    `${patient.user.first_name} ${patient.user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (viewState === 'consultation' && selectedPatient) {
    return (
      <DoctorConsultation
        token={token}
        patient={selectedPatient}
        onBack={() => {
          setViewState('list');
          setSelectedPatient(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <User className="text-white/90" size={24} />
          Mes Patients
        </h2>
        <p className="text-white/80 text-sm">Gérez vos patients et consultations</p>
        <div className="mt-3 bg-white/20 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
          <span className="text-white text-xs font-medium">{patients.length} patients</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Rechercher un patient (nom, email)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-slate-400 dark:text-slate-500">Chargement des patients...</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-700">
          <Activity className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={56} />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Aucun patient trouvé</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {searchQuery ? 'Aucun patient ne correspond à votre recherche' : 'Commencez par ajouter des patients'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPatients.map((patient, index) => {
            const initials = `${patient.user.first_name.charAt(0)}${patient.user.last_name.charAt(0)}`;
            const age = patient.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : 'N/A';
            
            return (
              <div
                key={patient.id}
                onClick={() => {
                  setSelectedPatient(patient);
                  setViewState('consultation');
                }}
                className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-between transform hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-center space-x-4">
                  <div className={`relative p-1 rounded-2xl bg-gradient-to-br ${
                    index % 3 === 0 ? 'from-indigo-400 to-purple-500' :
                    index % 3 === 1 ? 'from-emerald-400 to-teal-500' :
                    'from-amber-400 to-orange-500'
                  }`}>
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
                      {initials}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {patient.user.first_name} {patient.user.last_name}
                    </h4>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Calendar size={12} />
                        {age} ans
                      </span>
                      {patient.blood_type && (
                        <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Droplets size={12} />
                          {patient.blood_type}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{patient.user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                    Consulter
                  </div>
                  <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors" size={20} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface ConsultationProps {
  token: string;
  patient: Patient;
  onBack?: () => void;
}

export const DoctorConsultation: React.FC<ConsultationProps> = ({ token, patient, onBack }) => {
  const [activeAction, setActiveAction] = useState<'note' | 'prescription' | 'lab'>('note');
  const [loading, setLoading] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);

  // Medical Record Form
  const [recordTitle, setRecordTitle] = useState('');
  const [recordDescription, setRecordDescription] = useState('');
  const [recordType, setRecordType] = useState<string>('consultation');
  const [vitals, setVitals] = useState({ bloodPressure: '', weight: '', temperature: '' });

  // Prescription Form
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [duration, setDuration] = useState('');
  const [instructions, setInstructions] = useState('');

  // Lab Test Form
  const [testName, setTestName] = useState('');

  useEffect(() => {
    loadPatientRecords();
  }, [patient.id]);

  const loadPatientRecords = async () => {
    try {
      const response = await fetch(`https://tohpitoh-api.onrender.com/api/v1/doctors/patients/${patient.id}/medical-records`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMedicalRecords(Array.isArray(data) ? data : data.data || []);
      }
    } catch (error) {
      console.error('Error loading patient records:', error);
    }
  };

  const getAge = (birthDate: string) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const dob = new Date(birthDate);
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  const handleSaveMedicalRecord = async () => {
    if (!recordTitle.trim() || !recordDescription.trim()) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        patient_id: patient.id,
        record_type: recordType,
        title: recordTitle,
        description: recordDescription,
        date: new Date().toISOString()
      };

      await fetch(`https://tohpitoh-api.onrender.com/api/v1/doctors/patients/${patient.id}/medical-records`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      alert('Note clinique enregistrée avec succès');
      setRecordTitle('');
      setRecordDescription('');
      setVitals({ bloodPressure: '', weight: '', temperature: '' });
      await loadPatientRecords();
    } catch (error) {
      console.error('Error saving medical record:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrescription = async () => {
    if (!medication.trim() || !dosage.trim()) {
      alert('Veuillez remplir au moins le médicament et la posologie');
      return;
    }

    setLoading(true);
    try {
      await api.doctor.createPrescription(token, {
        patient_id: patient.id,
        medication_name: medication,
        dosage,
        frequency,
        duration,
        instructions,
        prescribed_date: new Date().toISOString()
      });

      alert('Ordonnance créée avec succès');
      setMedication('');
      setDosage('');
      setFrequency('');
      setDuration('');
      setInstructions('');
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert('Erreur lors de la création de l\'ordonnance');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderLabTest = async () => {
    if (!testName.trim()) {
      alert('Veuillez saisir le nom de l\'examen');
      return;
    }

    setLoading(true);
    try {
      await api.doctor.orderLabTest(token, {
        patient_id: patient.id,
        test_name: testName,
        ordered_date: new Date().toISOString()
      });

      alert('Examen de laboratoire prescrit avec succès');
      setTestName('');
    } catch (error) {
      console.error('Error ordering lab test:', error);
      alert('Erreur lors de la prescription de l\'examen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back Button */}
      {onBack && (
        <button 
          onClick={onBack} 
          className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 transition-colors group"
        >
          <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={20} />
          <span className="ml-1 text-sm font-medium">Retour à la liste</span>
        </button>
      )}

      {/* Patient Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <User className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {patient.user.first_name} {patient.user.last_name}
                </h2>
                <p className="text-white/80 text-sm">{patient.user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                <div className="text-lg font-bold">{getAge(patient.date_of_birth)} ans</div>
                <div className="text-white/70 text-xs">Âge</div>
              </div>
              {patient.blood_type && (
                <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <div className="text-lg font-bold">{patient.blood_type}</div>
                  <div className="text-white/70 text-xs">Groupe Sanguin</div>
                </div>
              )}
              <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                <div className="text-lg font-bold">{medicalRecords.length}</div>
                <div className="text-white/70 text-xs">Dossiers</div>
              </div>
            </div>
          </div>
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Activity className="text-white" size={24} />
          </div>
        </div>
      </div>

      {/* Action Tabs */}
      <div className="grid grid-cols-3 gap-3">
        <button
          onClick={() => setActiveAction('note')}
          className={`p-4 rounded-2xl font-medium shadow-lg transition-all transform hover:scale-105 flex flex-col items-center gap-2 ${
            activeAction === 'note'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-indigo-500/30'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className={`p-3 rounded-xl ${
            activeAction === 'note' ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
          }`}>
            <FileText size={24} />
          </div>
          <span className="text-sm font-bold">Note</span>
        </button>
        
        <button
          onClick={() => setActiveAction('prescription')}
          className={`p-4 rounded-2xl font-medium shadow-lg transition-all transform hover:scale-105 flex flex-col items-center gap-2 ${
            activeAction === 'prescription'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/30'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className={`p-3 rounded-xl ${
            activeAction === 'prescription' ? 'bg-white/20' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
          }`}>
            <Pill size={24} />
          </div>
          <span className="text-sm font-bold">Ordonnance</span>
        </button>
        
        <button
          onClick={() => setActiveAction('lab')}
          className={`p-4 rounded-2xl font-medium shadow-lg transition-all transform hover:scale-105 flex flex-col items-center gap-2 ${
            activeAction === 'lab'
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-amber-500/30'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <div className={`p-3 rounded-xl ${
            activeAction === 'lab' ? 'bg-white/20' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
          }`}>
            <Beaker size={24} />
          </div>
          <span className="text-sm font-bold">Laboratoire</span>
        </button>
      </div>

      {/* Medical Record Form */}
      {activeAction === 'note' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <FileText className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Note Clinique</h3>
          </div>

          <div className="space-y-4">
            <select
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-white"
            >
              <option value="consultation">🩺 Consultation</option>
              <option value="diagonosis">📋 Diagnostic</option>
              <option value="vaccination">💉 Vaccination</option>
              <option value="other">📝 Autre</option>
            </select>

            <input
              type="text"
              placeholder="Titre de la note"
              value={recordTitle}
              onChange={(e) => setRecordTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />

            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tension"
                  value={vitals.bloodPressure}
                  onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-white"
                />
                <Heart className="absolute left-3 top-3.5 text-slate-400" size={16} />
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Poids (kg)"
                  value={vitals.weight}
                  onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-white"
                />
                <Scale className="absolute left-3 top-3.5 text-slate-400" size={16} />
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Temp. (°C)"
                  value={vitals.temperature}
                  onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-white"
                />
                <Thermometer className="absolute left-3 top-3.5 text-slate-400" size={16} />
              </div>
            </div>

            <textarea
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-slate-800 dark:text-white h-40 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Observations, diagnostic, traitement proposé..."
              value={recordDescription}
              onChange={(e) => setRecordDescription(e.target.value)}
            ></textarea>

            <button
              onClick={handleSaveMedicalRecord}
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Enregistrer au DEP
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Prescription Form */}
      {activeAction === 'prescription' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Pill className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Nouvelle Ordonnance</h3>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nom du médicament"
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Posologie (ex: 500mg)"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Fréquence (ex: 2x/jour)"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800 dark:text-white"
              />
            </div>

            <input
              type="text"
              placeholder="Durée (ex: 7 jours)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800 dark:text-white"
            />

            <textarea
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800 dark:text-white h-32 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
              placeholder="Instructions particulières, précautions, contre-indications..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            ></textarea>

            <button
              onClick={handleSavePrescription}
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Création...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Créer l'ordonnance
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Lab Test Form */}
      {activeAction === 'lab' && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Beaker className="text-amber-600 dark:text-amber-400" size={20} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Prescrire un Examen</h3>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Nom de l'examen (ex: Hémogramme complet, Glycémie, CRP...)"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />

            <button
              onClick={handleOrderLabTest}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Prescription...
                </>
              ) : (
                <>
                  <Microscope size={20} />
                  Prescrire l'examen
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Recent History */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-5 border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <History className="text-purple-600 dark:text-purple-400" size={20} />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">Historique Récent</h3>
        </div>

        {medicalRecords.length === 0 ? (
          <div className="text-center py-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
            <Clock className="mx-auto mb-3 text-slate-300 dark:text-slate-600" size={32} />
            <p className="text-slate-400 dark:text-slate-500 text-sm">Aucun historique disponible</p>
          </div>
        ) : (
          <div className="space-y-3">
            {medicalRecords.slice(0, 3).map((record, index) => (
              <div 
                key={record.id} 
                className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 transform hover:scale-[1.01] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      record.record_type === 'consultation' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                      record.record_type === 'prescription' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                    }`}>
                      <FileText size={16} />
                    </div>
                    <span className="font-semibold text-slate-800 dark:text-white text-sm">{record.title}</span>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">{record.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};