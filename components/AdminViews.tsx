import React, { useEffect, useState } from 'react';
import { AdminStats, User } from '../types';
import { api } from '../services/api';
import { Users, UserCheck, Activity, Search, AlertTriangle, CheckCircle, XCircle, Loader2, Shield, BarChart3, Building, Clock, Mail, Phone, Key, Crown, Stethoscope, User as UserIcon, Filter, TrendingUp, Calendar, Zap, Eye, EyeOff } from 'lucide-react';

interface ViewProps {
  token: string;
}

// --- ADMIN DASHBOARD ---
export const AdminDashboard: React.FC<ViewProps> = ({ token }) => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.admin.getStats(token);
        setStats(data);
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-4"></div>
      <p className="text-slate-400 dark:text-slate-500">Chargement des statistiques...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-5 shadow-xl">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <BarChart3 className="text-white/90" size={24} />
          Vue d'ensemble
        </h2>
        <p className="text-white/80 text-sm">Statistiques globales de la plateforme</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total Users Card */}
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-5 shadow-xl transform hover:scale-[1.02] transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Users className="text-white" size={24} />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</div>
              <div className="text-white/70 text-xs">Total</div>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium">Utilisateurs</p>
          <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white w-3/4 rounded-full"></div>
          </div>
        </div>

        {/* Validations Pending Card */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-5 shadow-xl transform hover:scale-[1.02] transition-all relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <AlertTriangle className="text-white" size={24} />
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">{stats?.pendingValidations || 0}</div>
                <div className="text-white/70 text-xs">En attente</div>
              </div>
            </div>
            <p className="text-white/90 text-sm font-medium">Validations</p>
            <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white w-1/3 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Doctors Stats */}
        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-5 shadow-xl transform hover:scale-[1.02] transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Stethoscope className="text-white" size={24} />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{stats?.totalDoctors || 0}</div>
              <div className="text-white/70 text-xs">Actifs</div>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium">Médecins</p>
          <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white w-2/3 rounded-full"></div>
          </div>
        </div>

        {/* Patients Stats */}
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-5 shadow-xl transform hover:scale-[1.02] transition-all">
          <div className="flex items-start justify-between mb-3">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <UserIcon className="text-white" size={24} />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{stats?.totalPatients || 0}</div>
              <div className="text-white/70 text-xs">Patients</div>
            </div>
          </div>
          <p className="text-white/90 text-sm font-medium">Patients</p>
          <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
            <div className="h-full bg-white w-4/5 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-xl border border-slate-100 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <TrendingUp className="text-purple-500" size={20} />
            Activité Récente
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">24 dernières heures</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            <div className="text-xl font-bold text-slate-800 dark:text-white">12</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nouvelles consults</div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            <div className="text-xl font-bold text-slate-800 dark:text-white">8</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Examens prescrits</div>
          </div>
          <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
            <div className="text-xl font-bold text-slate-800 dark:text-white">3</div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Nouveaux inscrits</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- VALIDATION INTERFACE ---
export const AdminValidations: React.FC<ViewProps> = ({ token }) => {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getPendingValidations(token);
      setPending(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [token]);

  const handleValidation = async (id: number, type: 'doctor' | 'laboratory', action: 'approve' | 'reject') => {
    if(!window.confirm(`Êtes-vous sûr de vouloir ${action === 'approve' ? 'approuver' : 'rejeter'} ce professionnel ?`)) return;
    
    try {
      await api.admin.validateProfessional(token, id, type, action);
      fetchPending();
    } catch (e) {
      alert("Erreur lors de l'action");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-4"></div>
      <p className="text-slate-400 dark:text-slate-500">Chargement des demandes...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Shield className="text-white/90" size={24} />
              Validations en attente
            </h2>
            <p className="text-white/80 text-sm">Approbation des professionnels de santé</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
            <span className="text-white text-lg font-bold">{pending.length}</span>
          </div>
        </div>
      </div>

      {pending.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-700">
          <CheckCircle className="mx-auto mb-4 text-emerald-400" size={56} />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Aucune demande en attente</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Toutes les validations sont à jour</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map((item) => (
            <div key={`${item.type}-${item.id}`} className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-5 border border-slate-100 dark:border-slate-700 transform hover:scale-[1.01] transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    item.type === 'doctor' 
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {item.type === 'doctor' ? <Stethoscope size={24} /> : <Building size={24} />}
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.type === 'doctor' 
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                    }`}>
                      {item.type === 'doctor' ? '👨‍⚕️ Médecin' : '🔬 Laboratoire'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-2">{item.name || 'Nom Inconnu'}</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                  <Mail size={16} />
                  {item.email}
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm">
                  <Key size={16} />
                  Licence: {item.license_number || 'N/A'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleValidation(item.id, item.type, 'reject')}
                  className="flex items-center justify-center gap-2 py-3 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all transform hover:scale-[1.02]"
                >
                  <XCircle size={18} />
                  Rejeter
                </button>
                <button
                  onClick={() => handleValidation(item.id, item.type, 'approve')}
                  className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02]"
                >
                  <CheckCircle size={18} />
                  Approuver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- USER LIST INTERFACE ---
export const AdminUsersList: React.FC<ViewProps> = ({ token }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.admin.getAllUsers(token);
        setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [token]);

  const filteredUsers = users.filter(u => 
    u.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'admin': return 'from-purple-500 to-pink-600';
      case 'doctor': return 'from-blue-500 to-cyan-600';
      case 'patient': return 'from-sky-500 to-blue-600';
      default: return 'from-slate-500 to-gray-600';
    }
  };

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return <Crown size={16} />;
      case 'doctor': return <Stethoscope size={16} />;
      case 'patient': return <UserIcon size={16} />;
      default: return <UserIcon size={16} />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-500 to-gray-600 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Users className="text-white/90" size={24} />
              Gestion des Utilisateurs
            </h2>
            <p className="text-white/80 text-sm">Administrez tous les comptes de la plateforme</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
            <span className="text-white text-lg font-bold">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-purple-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Rechercher un utilisateur (nom, email, rôle)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-slate-400 dark:text-slate-500">Chargement des utilisateurs...</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-4 text-center">
              <div className="text-xl font-bold text-white">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-white/80 text-xs mt-1">Admins</div>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-4 text-center">
              <div className="text-xl font-bold text-white">
                {users.filter(u => u.role === 'doctor').length}
              </div>
              <div className="text-white/80 text-xs mt-1">Médecins</div>
            </div>
            <div className="bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl p-4 text-center">
              <div className="text-xl font-bold text-white">
                {users.filter(u => u.role === 'patient').length}
              </div>
              <div className="text-white/80 text-xs mt-1">Patients</div>
            </div>
          </div>

          {/* Users List */}
          {filteredUsers.length === 0 ? (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-700">
              <Search className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={48} />
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                {searchTerm ? 'Aucun utilisateur ne correspond à votre recherche' : 'Aucun utilisateur dans le système'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const initials = `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase();
                return (
                  <div key={user.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 border border-slate-100 dark:border-slate-700 transform hover:scale-[1.01] transition-all">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`relative p-1 rounded-2xl bg-gradient-to-br ${getRoleColor(user.role || 'user')}`}>
                          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
                            {initials || 'U'}
                          </div>
                          <div className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full">
                            <div className={`p-1 rounded-full bg-gradient-to-br ${getRoleColor(user.role || 'user')} text-white text-xs`}>
                              {getRoleIcon(user.role || 'user')}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 dark:text-white">
                            {user.first_name} {user.last_name}
                          </h4>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Mail size={12} />
                              {user.email}
                            </span>
                            {user.phone && (
                              <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Phone size={12} />
                                {user.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r ${getRoleColor(user.role || 'user')} text-white`}>
                          {user.role === 'admin' ? '👑 Admin' : 
                           user.role === 'doctor' ? '👨‍⚕️ Médecin' : 
                           user.role === 'patient' ? '👤 Patient' : '👤 Utilisateur'}
                        </span>
                        <div className="mt-2 flex items-center justify-end gap-2">
                          {user.is_active ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                              <Eye size={12} />
                              Actif
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                              <EyeOff size={12} />
                              Inactif
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Membre depuis</span>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};