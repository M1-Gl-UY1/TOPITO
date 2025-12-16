import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Beaker, FileText, Upload, CheckCircle, Clock, AlertCircle, Microscope, User, Calendar, Download, Zap, Filter, TrendingUp, Eye, TestTube, Shield, Activity, Pill, UserCheck, BarChart3 } from 'lucide-react';
import { api } from '../services/api';

interface LabTest {
  id: number;
  patient_id: number;
  doctor_id?: number;
  test_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  results?: string;
  result_file_url?: string;
  doctor_interpretation?: string;
  ordered_date: string;
  completed_date?: string;
  patient?: {
    user: {
      first_name: string;
      last_name: string;
    }
  };
  doctor?: {
    user: {
      first_name: string;
      last_name: string;
    }
  };
}

interface LabProps {
  token: string;
}

export const LabTestRequests: React.FC<LabProps> = ({ token }) => {
  const [tests, setTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);

  useEffect(() => {
    loadTests();
  }, [token]);

  const loadTests = async () => {
    setLoading(true);
    try {
      const response = await api.laboratory.getPendingTests(token);
      setTests(Array.isArray(response) ? response : response.data || []);
    } catch (error) {
      console.error('Error loading tests:', error);
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId: number) => {
    try {
      await api.laboratory.startTest(token, testId);
      await loadTests();
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Erreur lors du démarrage du test');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { 
        bg: 'bg-gradient-to-r from-amber-400 to-orange-500', 
        text: 'text-white', 
        icon: Clock, 
        label: 'En attente' 
      },
      in_progress: { 
        bg: 'bg-gradient-to-r from-blue-400 to-cyan-500', 
        text: 'text-white', 
        icon: Beaker, 
        label: 'En cours' 
      },
      completed: { 
        bg: 'bg-gradient-to-r from-emerald-400 to-teal-500', 
        text: 'text-white', 
        icon: CheckCircle, 
        label: 'Terminé' 
      },
      cancelled: { 
        bg: 'bg-gradient-to-r from-rose-400 to-pink-500', 
        text: 'text-white', 
        icon: AlertCircle, 
        label: 'Annulé' 
      }
    };
    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${badge.bg} ${badge.text} shadow-sm`}>
        <Icon size={12} />
        {badge.label}
      </span>
    );
  };

  const filteredTests = tests.filter(test =>
    test.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (test.patient?.user?.first_name + ' ' + test.patient?.user?.last_name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedTest) {
    return (
      <TestDetailsView
        test={selectedTest}
        token={token}
        onBack={() => {
          setSelectedTest(null);
          loadTests();
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Microscope className="text-white/90" size={24} />
              Demandes d'Examens
            </h2>
            <p className="text-white/80 text-sm">Gérez les analyses en attente</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
            <span className="text-white text-lg font-bold">{tests.length}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Rechercher un examen (nom, patient)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-center">
          <div className="text-xl font-bold text-white">
            {tests.filter(t => t.status === 'pending').length}
          </div>
          <div className="text-white/80 text-xs mt-1">En attente</div>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-4 text-center">
          <div className="text-xl font-bold text-white">
            {tests.filter(t => t.status === 'in_progress').length}
          </div>
          <div className="text-white/80 text-xs mt-1">En cours</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-4 text-center">
          <div className="text-xl font-bold text-white">
            {tests.filter(t => t.status === 'completed').length}
          </div>
          <div className="text-white/80 text-xs mt-1">Terminés</div>
        </div>
        <div className="bg-gradient-to-br from-rose-400 to-pink-500 rounded-2xl p-4 text-center">
          <div className="text-xl font-bold text-white">
            {tests.filter(t => t.status === 'cancelled').length}
          </div>
          <div className="text-white/80 text-xs mt-1">Annulés</div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-slate-400 dark:text-slate-500">Chargement des examens...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-700">
          <Beaker className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={56} />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Aucune demande d'examen</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {searchQuery ? 'Aucun examen ne correspond à votre recherche' : 'Tous les examens sont traités'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTests.map((test, index) => (
            <div
              key={test.id}
              onClick={() => setSelectedTest(test)}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 border border-slate-100 dark:border-slate-700 transform hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl ${
                    test.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                    test.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                    test.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                    'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                  }`}>
                    <TestTube size={24} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {test.test_name}
                    </h4>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <User size={12} />
                        {test.patient?.user?.first_name} {test.patient?.user?.last_name}
                      </span>
                      <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(test.ordered_date).toLocaleDateString()}
                      </span>
                    </div>
                    {test.doctor && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        👨‍⚕️ Dr. {test.doctor.user.first_name} {test.doctor.user.last_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {getStatusBadge(test.status)}
                  <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" size={20} />
                </div>
              </div>
              
              {test.doctor_interpretation && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                    <span className="font-medium">Note du médecin:</span> {test.doctor_interpretation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface TestDetailsProps {
  test: LabTest;
  token: string;
  onBack: () => void;
}

const TestDetailsView: React.FC<TestDetailsProps> = ({ test, token, onBack }) => {
  const [results, setResults] = useState(test.results || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitResults = async () => {
    if (!results.trim()) {
      alert('Veuillez saisir les résultats');
      return;
    }

    setSubmitting(true);
    try {
      await api.laboratory.completeTest(token, test.id, { results });
      alert('Résultats enregistrés avec succès');
      onBack();
    } catch (error) {
      console.error('Error submitting results:', error);
      alert('Erreur lors de l\'enregistrement des résultats');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartTest = async () => {
    try {
      await api.laboratory.startTest(token, test.id);
      alert('Test démarré avec succès');
      onBack();
    } catch (error) {
      console.error('Error starting test:', error);
      alert('Erreur lors du démarrage du test');
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back Button */}
      <button 
        onClick={onBack} 
        className="flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 transition-colors group"
      >
        <ChevronRight className="rotate-180 group-hover:-translate-x-1 transition-transform" size={20} />
        <span className="ml-1 text-sm font-medium">Retour à la liste</span>
      </button>

      {/* Test Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <TestTube className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{test.test_name}</h2>
                <p className="text-white/80 text-sm">Examen de laboratoire</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                <div className="text-lg font-bold">
                  {test.patient?.user?.first_name} {test.patient?.user?.last_name}
                </div>
                <div className="text-white/70 text-xs">Patient</div>
              </div>
              {test.doctor && (
                <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                  <div className="text-lg font-bold">
                    Dr. {test.doctor.user.first_name} {test.doctor.user.last_name}
                  </div>
                  <div className="text-white/70 text-xs">Médecin</div>
                </div>
              )}
              <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
                <div className="text-lg font-bold">
                  {new Date(test.ordered_date).toLocaleDateString()}
                </div>
                <div className="text-white/70 text-xs">Prescrit le</div>
              </div>
            </div>
          </div>
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Beaker className="text-white" size={24} />
          </div>
        </div>
      </div>

      {/* Status Actions */}
      {test.status === 'pending' && (
        <button
          onClick={handleStartTest}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
        >
          <Zap size={20} />
          Démarrer l'examen
        </button>
      )}

      {/* Results Input */}
      {(test.status === 'in_progress' || test.status === 'completed') && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <FileText className="text-emerald-600 dark:text-emerald-400" size={20} />
            </div>
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Résultats de l'examen</h3>
          </div>

          <textarea
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-800 dark:text-white h-48 resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            placeholder="Saisissez les résultats détaillés de l'examen (valeurs, observations, commentaires)..."
            value={results}
            onChange={(e) => setResults(e.target.value)}
            disabled={test.status === 'completed'}
          ></textarea>

          {test.status === 'in_progress' && (
            <button
              onClick={handleSubmitResults}
              disabled={submitting}
              className="w-full mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Upload size={20} />
                  Déposer les résultats
                </>
              )}
            </button>
          )}

          {test.status === 'completed' && test.completed_date && (
            <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <p className="text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle size={18} />
                <span className="font-bold">Résultats déposés le {new Date(test.completed_date).toLocaleDateString()}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* Doctor Interpretation */}
      {test.doctor_interpretation && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-5 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Eye className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <h3 className="font-bold text-blue-900 dark:text-blue-300 text-lg">Interprétation du médecin</h3>
          </div>
          <div className="bg-white/50 dark:bg-slate-900/30 p-4 rounded-xl">
            <p className="text-blue-800 dark:text-blue-400 text-sm leading-relaxed">
              {test.doctor_interpretation}
            </p>
          </div>
        </div>
      )}

      {/* Test Details */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-5 border border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
            <Shield className="text-slate-600 dark:text-slate-400" size={20} />
          </div>
          <h3 className="font-bold text-slate-800 dark:text-white text-lg">Détails de l'examen</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Statut</div>
            <div className="font-bold text-slate-800 dark:text-white">
              {test.status === 'pending' ? '⏳ En attente' :
               test.status === 'in_progress' ? '🔬 En cours' :
               test.status === 'completed' ? '✅ Terminé' : '❌ Annulé'}
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">ID Examen</div>
            <div className="font-bold text-slate-800 dark:text-white font-mono">LAB-{test.id.toString().padStart(6, '0')}</div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Prescrit le</div>
            <div className="font-bold text-slate-800 dark:text-white">
              {new Date(test.ordered_date).toLocaleDateString()}
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">Type</div>
            <div className="font-bold text-slate-800 dark:text-white">Analyse de laboratoire</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LabTestResults: React.FC<LabProps> = ({ token }) => {
  const [completedTests, setCompletedTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCompletedTests();
  }, [token]);

  const loadCompletedTests = async () => {
    setLoading(true);
    try {
      const response = await api.laboratory.getPendingTests(token);
      const allTests = Array.isArray(response) ? response : response.data || [];
      setCompletedTests(allTests.filter((t: LabTest) => t.status === 'completed'));
    } catch (error) {
      console.error('Error loading completed tests:', error);
      setCompletedTests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTests = completedTests.filter(test =>
    test.test_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (test.patient?.user?.first_name + ' ' + test.patient?.user?.last_name).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <CheckCircle className="text-white/90" size={24} />
              Résultats Complétés
            </h2>
            <p className="text-white/80 text-sm">Historique des analyses terminées</p>
          </div>
          <div className="bg-white/20 px-4 py-2 rounded-xl backdrop-blur-sm">
            <span className="text-white text-lg font-bold">{completedTests.length}</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Rechercher dans les résultats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl p-4 text-center">
          <div className="text-xl font-bold text-white">{completedTests.length}</div>
          <div className="text-white/80 text-xs mt-1">Total terminés</div>
        </div>
        <div className="bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl p-4 text-center">
          <div className="text-xl font-bold text-white">
            {completedTests.filter(t => t.doctor_interpretation).length}
          </div>
          <div className="text-white/80 text-xs mt-1">Avec interprétation</div>
        </div>
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-4 text-center">
          <div className="text-xl font-bold text-white">
            {completedTests.filter(t => t.results && t.results.length > 100).length}
          </div>
          <div className="text-white/80 text-xs mt-1">Résultats détaillés</div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-slate-400 dark:text-slate-500">Chargement des résultats...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-10 text-center border border-slate-200 dark:border-slate-700">
          <CheckCircle className="mx-auto mb-4 text-slate-300 dark:text-slate-600" size={56} />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Aucun résultat complété</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            {searchQuery ? 'Aucun résultat ne correspond à votre recherche' : 'Aucun examen terminé pour le moment'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTests.map((test, index) => (
            <div
              key={test.id}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 border border-slate-100 dark:border-slate-700 transform hover:scale-[1.01] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl text-white">
                    <TestTube size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="text-emerald-500" size={18} />
                      <h4 className="font-bold text-slate-800 dark:text-white">{test.test_name}</h4>
                    </div>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <User size={12} />
                        {test.patient?.user?.first_name} {test.patient?.user?.last_name}
                      </span>
                      {test.completed_date && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                          <Calendar size={12} />
                          Terminé le {new Date(test.completed_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {test.doctor && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        👨‍⚕️ Prescrit par Dr. {test.doctor.user.first_name} {test.doctor.user.last_name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-emerald-400 to-teal-500 text-white">
                    ✅ Terminé
                  </span>
                  {test.result_file_url && (
                    <button className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                      <Download className="text-slate-600 dark:text-slate-400" size={16} />
                    </button>
                  )}
                </div>
              </div>
              
              {test.results && (
                <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <h5 className="font-medium text-slate-700 dark:text-slate-300 text-sm mb-2">Résultats:</h5>
                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3">
                    {test.results}
                  </p>
                  {test.results.length > 150 && (
                    <button className="text-emerald-600 dark:text-emerald-400 text-xs font-medium mt-2 hover:text-emerald-700 dark:hover:text-emerald-300">
                      Voir plus...
                    </button>
                  )}
                </div>
              )}
              
              {test.doctor_interpretation && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <h5 className="font-medium text-blue-600 dark:text-blue-400 text-sm mb-1">Interprétation médicale:</h5>
                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-2">
                    {test.doctor_interpretation}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};