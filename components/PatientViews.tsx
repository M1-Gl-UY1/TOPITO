import React, { useState, useEffect } from 'react';
import { BackendRecordType, MedicalRecord, User, Patient } from '../types';
import { AlertCircle, FileText, Plus, Search, UserCheck, X, Lock, Calendar, Activity, Shield, Heart, Clock, Download, Filter, ChevronRight, User as UserIcon, Thermometer, Scale, Droplets } from 'lucide-react';
import { api } from '../services/api';

// --- SUMMARY VIEW ---
interface SummaryProps {
  user: User;
  patient?: Patient;
  medicalRecords: MedicalRecord[];
}

export const PatientSummary: React.FC<SummaryProps> = ({ user, patient, medicalRecords }) => {
  const records = medicalRecords;
  
  const bloodType = patient?.blood_type || 'Inconnu';
  const allergies = patient?.known_allergies ? patient.known_allergies.split(',') : ['Aucune connue'];
  const age = patient?.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : 'N/A';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 to-blue-600 p-6 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full border-4 border-white/30 bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <UserIcon className="text-white" size={28} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.first_name} {user.last_name}</h1>
              <p className="text-blue-100 text-sm opacity-90">{user.email}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{age}</div>
              <div className="text-xs opacity-80">Âge</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{bloodType}</div>
              <div className="text-xs opacity-80">Groupe</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{records.length}</div>
              <div className="text-xs opacity-80">Dossiers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Quick Card */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-5 shadow-xl transform hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <AlertCircle className="text-white" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Données Vitales</h3>
              <p className="text-white/80 text-sm">Informations d'urgence critiques</p>
            </div>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold text-white">
            ID: {user.id}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Droplets className="text-white/70" size={16} />
              <span className="text-white text-sm">Sang: {bloodType}</span>
            </div>
          </div>
          <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <div className="flex items-center space-x-2">
              <Activity className="text-white/70" size={16} />
              <span className="text-white text-sm">Allergies: {allergies.length}</span>
            </div>
          </div>
        </div>
        
        {patient?.emergency_access_code && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-xs">Code Urgence</span>
              <code className="bg-white/20 px-3 py-1 rounded-lg text-white font-mono text-sm font-bold">
                {patient.emergency_access_code}
              </code>
            </div>
          </div>
        )}
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-white/20 rounded-lg">
              <Heart className="text-white" size={20} />
            </div>
            <span className="text-white/80 text-xs font-medium">Tension</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">120/80</div>
            <div className="text-white/70 text-xs mt-1">mmHg • Normal</div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-white/20 rounded-lg">
              <Scale className="text-white" size={20} />
            </div>
            <span className="text-white/80 text-xs font-medium">Poids</span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-white">72 kg</div>
            <div className="text-white/70 text-xs mt-1">IMC: 23.4 • Normal</div>
          </div>
        </div>
      </div>

      {/* Latest Records */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Activity className="text-sky-500" size={20} />
            Activités Récentes
          </h3>
          <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full">
            {records.length} total
          </span>
        </div>
        
        {records.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
            <FileText className="mx-auto mb-3 text-slate-300 dark:text-slate-600" size={48} />
            <p className="text-slate-400 dark:text-slate-500 text-sm">Aucun dossier médical trouvé</p>
          </div>
        ) : (
          <div className="space-y-3">
            {records.slice(0, 3).map((record, index) => (
              <div 
                key={record.id} 
                className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 transform hover:translate-x-1 transition-transform duration-300 group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${index === 0 ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' : 
                      index === 1 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                      'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                        {record.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                        {record.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-sky-500 transition-colors" size={20} />
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    record.record_type === 'consultation' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                    record.record_type === 'prescription' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  }`}>
                    {record.record_type}
                  </span>
                  <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs">
                    <Calendar size={12} className="mr-1" />
                    {new Date(record.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- HISTORY VIEW ---
interface HistoryProps {
  records: MedicalRecord[];
}

export const PatientHistory: React.FC<HistoryProps> = ({ records }) => {
  const [filter, setFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const safeRecords = records || [];
  const uniqueTypes = Array.from(new Set(safeRecords.map(r => r.record_type)));
  const filters = ['All', ...uniqueTypes];

  const filteredRecords = filter === 'All'
    ? safeRecords.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : safeRecords.filter(r => r.record_type === filter && (
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase())
      ));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="text-white/90" size={24} />
          Dossier Médical
        </h2>
        <p className="text-white/80 text-sm">Historique complet de vos soins de santé</p>
      </div>

      {/* Search & Filters */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Rechercher dans vos dossiers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all shadow-sm text-slate-800 dark:text-white"
          />
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto pb-2 space-x-2 no-scrollbar">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all transform hover:scale-105 ${
                filter === f 
                  ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg' 
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm'
              }`}
            >
              {f === 'All' ? '📊 Tous' : `📄 ${f}`}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-400 to-blue-500 dark:from-sky-500 dark:to-blue-600 rounded-full"></div>
        
        {filteredRecords.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-700">
            <Clock className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
            <p className="text-slate-400 dark:text-slate-500">
              {searchTerm ? 'Aucun dossier ne correspond à votre recherche' : 'Aucun dossier médical'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredRecords.map((record, index) => (
              <div key={record.id} className="relative pl-16 group">
                {/* Timeline Dot */}
                <div className="absolute left-4 top-4 w-4 h-4 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-r from-sky-500 to-blue-600 shadow-lg z-10 transform group-hover:scale-125 transition-transform"></div>
                
                {/* Card */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 transform hover:scale-[1.02] transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      record.record_type === 'consultation' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                      record.record_type === 'prescription' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      record.record_type === 'lab_test' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                      'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                    }`}>
                      {record.record_type}
                    </span>
                    <div className="flex items-center text-slate-400 dark:text-slate-500 text-xs">
                      <Calendar size={12} className="mr-1" />
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">{record.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3">{record.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center space-x-3">
                      {record.attachment_url && (
                        <button className="flex items-center text-sky-600 dark:text-sky-400 text-sm font-medium hover:text-sky-700 dark:hover:text-sky-300 transition-colors">
                          <Download size={16} className="mr-1" />
                          Document
                        </button>
                      )}
                    </div>
                    <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 text-sm font-medium flex items-center">
                      Détails
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// --- ACCESS CONTROL VIEW ---
// [Le reste du code PatientAccess et PatientProfileView reste inchangé structurellement,
// mais je vais appliquer le même style moderne. Je continue avec le même pattern...]

// --- ACCESS CONTROL VIEW ---
interface AccessProps {
  token: string;
}

interface AccessPermission {
  id: number;
  patient_id: number;
  granted_to_id: number;
  granted_by_id: number;
  access_type: 'view' | 'edit';
  expires_at: string | null;
  purpose: string;
  is_active: boolean;
  granted_to?: {
    user: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

interface Doctor {
  id: number;
  user_id: number;
  specialization: string;
  license_number: string;
  hospital_affiliation: string;
  is_approved: boolean;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export const PatientAccess: React.FC<AccessProps> = ({ token }) => {
  const [accessList, setAccessList] = useState<AccessPermission[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [accessType, setAccessType] = useState<'view' | 'edit'>('view');
  const [expiresInDays, setExpiresInDays] = useState<number>(30);
  const [purpose, setPurpose] = useState('');

  useEffect(() => {
    loadData();
  }, [token]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [permissions, doctorList] = await Promise.all([
        api.patient.getAccessPermissions(token),
        api.patient.getAllDoctors(token)
      ]);
      setAccessList(permissions);
      setDoctors(doctorList.filter((d: Doctor) => d.is_approved));
    } catch (error) {
      console.error('Error loading access data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAccess = async () => {
    if (!selectedDoctor || !purpose.trim()) {
      alert('Veuillez sélectionner un médecin et saisir l\'objectif');
      return;
    }

    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);

      await api.patient.grantPermission(token, {
        granted_to_id: selectedDoctor,
        access_type: accessType,
        expires_at: expiresAt.toISOString(),
        purpose
      });

      alert('Accès accordé avec succès');
      setShowAddModal(false);
      setSelectedDoctor(null);
      setPurpose('');
      await loadData();
    } catch (error) {
      console.error('Error granting access:', error);
      alert('Erreur lors de l\'accord de l\'accès');
    }
  };

  const handleRevokeAccess = async (permissionId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir révoquer cet accès?')) return;

    try {
      await api.patient.revokePermission(token, permissionId);
      alert('Accès révoqué avec succès');
      await loadData();
    } catch (error) {
      console.error('Error revoking access:', error);
      alert('Erreur lors de la révocation de l\'accès');
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-5 shadow-xl">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Shield className="text-white/90" size={24} />
              Gestion des Accès
            </h2>
            <p className="text-white/80 text-sm">Contrôlez qui peut accéder à votre dossier</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-xl transition-all transform hover:scale-105"
          >
            <Plus className="text-white" size={24} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mb-4"></div>
          <p className="text-slate-400 dark:text-slate-500">Chargement des autorisations...</p>
        </div>
      ) : accessList.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-700">
          <Lock className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Aucun accès accordé</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Commencez par accorder un accès à un médecin</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-sky-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <Plus className="inline mr-2" size={20} />
            Accorder un accès
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {accessList.map((access) => {
            const expired = isExpired(access.expires_at);
            return (
              <div
                key={access.id}
                className={`bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-lg border-2 transform hover:scale-[1.01] transition-all ${
                  expired ? 'border-slate-200 dark:border-slate-700 opacity-60' : 'border-slate-100 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${
                      access.access_type === 'edit' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      <UserCheck size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 dark:text-white">
                        Dr. {access.granted_to?.user.first_name} {access.granted_to?.user.last_name}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{access.purpose}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          access.access_type === 'edit'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                        }`}>
                          {access.access_type === 'edit' ? '✏️ Édition' : '👁️ Lecture'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          expired 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        }`}>
                          {expired ? '⏰ Expiré' : access.is_active ? '✅ Actif' : '⏸️ Inactif'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {access.is_active && !expired && (
                    <button
                      onClick={() => handleRevokeAccess(access.id)}
                      className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                    >
                      Révoquer
                    </button>
                  )}
                </div>
                
                {access.expires_at && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">Expiration</span>
                      <span className={`font-medium ${expired ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {new Date(access.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Access Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 transform animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Accorder un Accès</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="text-slate-500 dark:text-slate-400" size={24} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Sélectionner un médecin
                </label>
                <select
                  value={selectedDoctor || ''}
                  onChange={(e) => setSelectedDoctor(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-800 dark:text-white"
                >
                  <option value="">-- Choisir un médecin --</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.user_id}>
                      Dr. {doctor.user.first_name} {doctor.user.last_name} • {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Type d'accès
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAccessType('view')}
                    className={`py-3 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                      accessType === 'view'
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 shadow-sm'
                    }`}
                  >
                    👁️ Lecture seule
                  </button>
                  <button
                    onClick={() => setAccessType('edit')}
                    className={`py-3 rounded-xl text-sm font-medium transition-all transform hover:scale-105 ${
                      accessType === 'edit'
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 shadow-sm'
                    }`}
                  >
                    ✏️ Édition
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Durée (jours)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="1"
                    max="365"
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(Number(e.target.value))}
                    className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-sky-500 [&::-webkit-slider-thumb]:to-blue-600"
                  />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 min-w-[60px]">
                    {expiresInDays} jours
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Objectif de l'accès
                </label>
                <textarea
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Ex: Consultation de suivi, traitement en cours..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all text-slate-800 dark:text-white h-32 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="py-3 rounded-xl text-sm font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all transform hover:scale-105"
                >
                  Annuler
                </button>
                <button
                  onClick={handleGrantAccess}
                  className="py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                >
                  Accorder l'accès
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- PROFILE VIEW ---
interface ProfileViewProps {
  user: User;
  patient?: Patient;
}

export const PatientProfileView: React.FC<ProfileViewProps> = ({ user, patient }) => {
  const allergies = patient?.known_allergies ? patient.known_allergies.split(',') : [];
  const age = patient?.date_of_birth ? new Date().getFullYear() - new Date(patient.date_of_birth).getFullYear() : 'N/A';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-pink-600 p-6 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
        <div className="relative z-10">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-full border-4 border-white/30 bg-white/20 backdrop-blur-sm overflow-hidden">
              <img 
                src={user.avatar || `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=6366f1&color=fff&bold=true`} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{user.first_name} {user.last_name}</h1>
              <p className="text-white/80 text-sm">{user.email}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                  {age} ans
                </span>
                {patient?.blood_type && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                    🩸 {patient.blood_type}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
            <UserIcon className="text-sky-500" size={20} />
            Informations Personnelles
          </h3>
        </div>
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                📅 Date de Naissance
              </label>
              <p className="font-bold text-slate-800 dark:text-white">
                {patient?.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'Non renseigné'}
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                🩸 Groupe Sanguin
              </label>
              <p className="font-bold text-slate-800 dark:text-white">{patient?.blood_type || '?'}</p>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              📞 Téléphone
            </label>
            <p className="font-bold text-slate-800 dark:text-white text-lg">{user.phone || 'Non renseigné'}</p>
          </div>
          
          {patient?.emergency_contact && (
            <div className="bg-gradient-to-r from-rose-50 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 p-4 rounded-xl border border-rose-200 dark:border-rose-800">
              <label className="block text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2">
                🆘 Contact d'Urgence
              </label>
              <p className="font-bold text-rose-700 dark:text-rose-300">{patient.emergency_contact}</p>
            </div>
          )}
        </div>
      </div>

      {/* Medical Conditions Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
            <Activity className="text-emerald-500" size={20} />
            Conditions Médicales
          </h3>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              ⚠️ Allergies
            </label>
            <div className="flex flex-wrap gap-2">
              {allergies.length > 0 ? (
                allergies.map((alg, index) => (
                  <span 
                    key={index}
                    className="bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 text-rose-700 dark:text-rose-300 px-4 py-2 rounded-xl text-sm font-medium border border-rose-200 dark:border-rose-800"
                  >
                    {alg.trim()}
                  </span>
                ))
              ) : (
                <span className="text-slate-400 dark:text-slate-500 text-sm">Aucune allergie connue</span>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              🏥 Maladies Chroniques
            </label>
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
              <p className="text-slate-700 dark:text-slate-300">
                {patient?.known_diseases || 'Aucune maladie chronique diagnostiquée'}
              </p>
            </div>
          </div>
          
          {patient?.special_conditions && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
              <label className="block text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-2">
                💊 Conditions Spéciales
              </label>
              <p className="text-amber-700 dark:text-amber-300">{patient.special_conditions}</p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-4 text-center shadow-lg">
          <div className="text-2xl font-bold text-white">{allergies.length}</div>
          <div className="text-white/80 text-xs mt-1">Allergies</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-4 text-center shadow-lg">
          <div className="text-2xl font-bold text-white">
            {patient?.medications ? patient.medications.split(',').length : 0}
          </div>
          <div className="text-white/80 text-xs mt-1">Médicaments</div>
        </div>
        <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl p-4 text-center shadow-lg">
          <div className="text-2xl font-bold text-white">
            {patient?.surgeries ? patient.surgeries.split(',').length : 0}
          </div>
          <div className="text-white/80 text-xs mt-1">Chirurgies</div>
        </div>
      </div>
    </div>
  );
};