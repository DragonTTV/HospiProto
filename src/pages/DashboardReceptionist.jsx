import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, Bell } from 'lucide-react';
import ReceptionDesk from '../components/ReceptionDesk';

const DashboardReceptionist = () => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Activity className="text-purple-600 h-6 w-6" />
          <span className="text-xl font-bold text-gray-800">Hospiverse <span className="text-purple-600">Front Desk</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="text-gray-400 hover:text-purple-600 cursor-pointer transition" size={20} />
          <span className="text-sm text-gray-600 hidden md:block">Welcome, {user?.full_name || 'Receptionist'}</span>
          <button 
            onClick={logout} 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition"
          >
            Logout
          </button>
        </div>
      </nav>
      
      {/* Content */}
      <div className="p-8 max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reception Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage walk-ins and coordinate with doctors.</p>
        </header>

        {/* The Desk Component */}
        <ReceptionDesk />
      </div>
    </div>
  );
};

export default DashboardReceptionist;