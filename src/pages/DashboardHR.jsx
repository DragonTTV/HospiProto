import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, UserPlus } from 'lucide-react';
import StaffList from '../components/StaffList';
import AddStaffModal from '../components/AddStaffModal'; // Import the Modal

const DashboardHR = () => {
  const { logout, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // A trick to force-reload the list

  // This function is passed to the modal. When a user is added, we increment this key.
  // The StaffList component will see the key change and re-fetch the data.
  const handleUserAdded = () => {
    setRefreshKey(old => old + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Activity className="text-blue-600 h-6 w-6" />
          <span className="text-xl font-bold text-gray-800">Hospiverse <span className="text-blue-600">HR</span></span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 hidden md:block">Welcome, {user?.full_name}</span>
          <button onClick={logout} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition">
            Logout
          </button>
        </div>
      </nav>
      
      <div className="p-8 max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
            <p className="text-gray-500 mt-1">Onboard, manage, and track hospital staff.</p>
          </div>
          
          {/* THE ONBOARD BUTTON */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md flex items-center gap-2 transition"
          >
            <UserPlus size={20} />
            Onboard Staff
          </button>
        </header>

        {/* Pass the refreshKey to StaffList so it knows when to update */}
        <StaffList key={refreshKey} />
      </div>

      {/* The Modal Component */}
      <AddStaffModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUserAdded={handleUserAdded}
      />
    </div>
  );
};

export default DashboardHR;