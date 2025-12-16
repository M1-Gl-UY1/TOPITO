import React from 'react';
import { UserRole } from '../types';
import { LogOut, User, Activity, FileText, Shield, Home, Users, CheckSquare, BarChart3, Moon, Sun, Settings, Bell, Menu, X, ChevronRight, Crown, Stethoscope, Microscope, Zap, Heart, Lock, Database, Calendar } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  userRole: UserRole | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, userRole, onLogout, activeTab, setActiveTab, darkMode, toggleDarkMode }) => {
  
  if (!userRole) return <>{children}</>;

  const getNavItems = () => {
    switch (userRole) {
      case 'patient':
      case 'user':
      case UserRole.PATIENT:
        return [
          { id: 'summary', icon: Home, label: 'Accueil', color: 'from-sky-500 to-blue-600' },
          { id: 'history', icon: FileText, label: 'Dossier', color: 'from-indigo-500 to-purple-600' },
          { id: 'access', icon: Shield, label: 'Accès', color: 'from-emerald-500 to-teal-600' },
          { id: 'profile', icon: User, label: 'Profil', color: 'from-rose-500 to-pink-600' },
        ];
      case 'doctor':
      case UserRole.DOCTOR:
        return [
          { id: 'patients', icon: Users, label: 'Patients', color: 'from-blue-500 to-cyan-600' },
          { id: 'consultations', icon: Activity, label: 'Consults', color: 'from-indigo-500 to-purple-600' },
        ];
      case 'laboratory':
      case UserRole.LAB:
        return [
          { id: 'requests', icon: Microscope, label: 'Demandes', color: 'from-emerald-500 to-teal-600' },
          { id: 'results', icon: FileText, label: 'Résultats', color: 'from-amber-500 to-orange-600' },
        ];
      case 'admin':
      case UserRole.ADMIN:
        return [
          { id: 'dashboard', icon: BarChart3, label: 'Dashboard', color: 'from-purple-500 to-pink-600' },
          { id: 'validations', icon: CheckSquare, label: 'Validations', color: 'from-amber-500 to-orange-600' },
          { id: 'users', icon: Users, label: 'Utilisateurs', color: 'from-slate-500 to-gray-600' },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  
  // Dynamic header color based on role
  const getHeaderGradient = () => {
    if (userRole === 'admin' || userRole === UserRole.ADMIN) return 'from-purple-600 to-pink-700';
    if (userRole === 'doctor' || userRole === UserRole.DOCTOR) return 'from-indigo-600 to-purple-700';
    if (userRole === 'laboratory' || userRole === UserRole.LAB) return 'from-emerald-600 to-teal-700';
    return 'from-sky-600 to-blue-700';
  };

  const getRoleIcon = () => {
    if (userRole === 'admin' || userRole === UserRole.ADMIN) return <Crown size={20} />;
    if (userRole === 'doctor' || userRole === UserRole.DOCTOR) return <Stethoscope size={20} />;
    if (userRole === 'laboratory' || userRole === UserRole.LAB) return <Microscope size={20} />;
    return <User size={20} />;
  };

  const getRoleTitle = () => {
    if (userRole === 'admin' || userRole === UserRole.ADMIN) return 'Administration Système';
    if (userRole === 'doctor' || userRole === UserRole.DOCTOR) return 'Espace Médical';
    if (userRole === 'laboratory' || userRole === UserRole.LAB) return 'Laboratoire d\'Analyses';
    return 'Mon Dossier Médical';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex flex-col max-w-md mx-auto shadow-2xl overflow-hidden relative transition-all duration-500">
      {/* Mobile Header */}
      <header className={`bg-gradient-to-r ${getHeaderGradient()} text-white p-5 sticky top-0 z-50 shadow-2xl transition-all duration-500`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              {getRoleIcon()}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                TOHPITOH
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">PRO</span>
              </h1>
              <p className="text-xs text-white/80 font-medium">
                {getRoleTitle()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all transform hover:scale-105"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-300" />
              ) : (
                <Moon className="w-5 h-5 text-white/90" />
              )}
            </button>
            <button 
              onClick={onLogout}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all transform hover:scale-105"
            >
              <LogOut size={20} className="text-white/90" />
            </button>
          </div>
        </div>
        
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-12 translate-x-12"></div>
      </header>

      {/* Main Content (Scrollable) */}
      <main className="flex-1 overflow-y-auto pb-28 p-5 scroll-smooth bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-900/50 transition-colors duration-500">
        {/* Decorative background pattern */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 dark:opacity-10 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] bg-[length:20px_20px]"></div>
        </div>
        
        <div className="relative z-10">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-white/20 dark:border-slate-700/50 fixed bottom-0 w-full max-w-md pb-safe transition-all duration-500 shadow-2xl">
        <div className="flex justify-around items-center h-20 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 transform ${
                  isActive ? 'scale-110' : 'hover:scale-105'
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-4 w-12 h-1 bg-gradient-to-r from-sky-500 to-blue-600 rounded-b-full"></div>
                )}
                
                {/* Icon container */}
                <div className={`relative p-3 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? `bg-gradient-to-br ${item.color} text-white shadow-lg`
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  
                  {/* Pulse effect for active */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-20 animate-pulse"></div>
                  )}
                </div>
                
                {/* Label */}
                <span className={`text-[10px] font-bold transition-colors ${
                  isActive 
                    ? 'text-slate-800 dark:text-white' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Decorative bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
      </nav>

      {/* Floating Action Button for quick actions */}
      <div className="fixed bottom-24 right-4 z-40">
        <button className="p-4 bg-gradient-to-br from-sky-500 to-blue-600 text-white rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300">
          <Zap size={24} />
        </button>
      </div>
    </div>
  );
};