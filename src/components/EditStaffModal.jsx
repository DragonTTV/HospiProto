import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, Save, Loader } from 'lucide-react';

const EditStaffModal = ({ isOpen, onClose, userToEdit, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    role: '',
    department: '',
    status: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        full_name: userToEdit.full_name || '',
        role: userToEdit.role || 'receptionist',
        department: userToEdit.department || '',
        status: userToEdit.status || 'Active'
      });
    }
  }, [userToEdit]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. UPDATE UI INSTANTLY (Optimistic)
    // We assume the database update will succeed, so we close the modal NOW.
    onUserUpdated({ ...userToEdit, ...formData }); 
    onClose();

    // 2. Perform Database Update in Background
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role.toLowerCase(),
          department: formData.department,
          status: formData.status
        })
        .eq('id', userToEdit.id);

      if (error) {
        // If it fails, alert the user (and ideally revert the change, but this is rare)
        console.error("Update failed:", error);
        alert("Failed to save changes. Please refresh.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            <Save size={20} /> Edit Staff Member
          </h2>
          <button onClick={onClose} className="text-blue-100 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input 
              name="full_name" required 
              value={formData.full_name} onChange={handleChange}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <select 
                name="role" 
                value={formData.role} onChange={handleChange}
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="doctor">Doctor</option>
                <option value="receptionist">Receptionist</option>
                <option value="hr">HR Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select 
                name="status" 
                value={formData.status} onChange={handleChange}
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <input 
              name="department" required 
              value={formData.department} onChange={handleChange}
              className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:bg-blue-300 flex justify-center items-center gap-2"
          >
            {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditStaffModal;