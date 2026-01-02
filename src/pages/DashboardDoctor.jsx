import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Stethoscope, LogOut, User } from 'lucide-react';
import DoctorAppointments from '../components/DoctorAppointments';

const DashboardDoctor = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* --- Navbar --- */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <Activity className="text-emerald-600 h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">
              Hospiverse <span className="text-emerald-600">MD</span>
            </span>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-gray-800">
                Dr. {user?.full_name || 'Unknown'}
              </span>
              <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wide">
                {user?.department || 'General'}
              </span>
            </div>
            
            <button 
              onClick={logout} 
              className="flex items-center gap-2 bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition duration-200"
              title="Sign Out"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* --- Main Content --- */}
      <main className="p-6 md:p-10 max-w-6xl mx-auto">
        
        {/* Welcome Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center gap-4">
          <div className="p-4 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <Stethoscope className="text-emerald-600 h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Medical Workspace</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, Doctor. You have full access to patient records and consultation tools today.
            </p>
          </div>
        </header>

        {/* The Smart Component */}
        <section>
          <DoctorAppointments />
        </section>
        
      </main>
    </div>
  );
};

export default DashboardDoctor;