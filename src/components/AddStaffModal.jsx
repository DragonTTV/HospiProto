import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { X, UserPlus, Loader } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// FIX: We add a unique 'storageKey' to silence the warning completely.
// This ensures this client never touches the main user's session data.
const tempSupabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storageKey: 'hr-onboarding-temp', // <--- This unique key fixes the warning
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

const AddStaffModal = ({ isOpen, onClose, onUserAdded }) => {
  // ... rest of the component is exactly the same ...
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'receptionist',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data, error: signUpError } = await tempSupabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: formData.role,
            department: formData.department,
            status: 'Active'
          }
        }
      });

      if (signUpError) throw signUpError;

      setSuccess(`User ${formData.fullName} created successfully!`);
      
      setFormData({
        email: '',
        password: '',
        fullName: '',
        role: 'receptionist',
        department: ''
      });

      if (onUserAdded) onUserAdded();

      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
        
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <h2 className="text-white text-lg font-bold flex items-center gap-2">
            <UserPlus size={20} /> Onboard New Staff
          </h2>
          <button onClick={onClose} className="text-blue-100 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm border border-red-200">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm border border-green-200">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input 
                name="fullName" required 
                value={formData.fullName} onChange={handleChange}
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Dr. John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input 
                name="email" type="email" required 
                value={formData.email} onChange={handleChange}
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="john@hospiverse.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Set Password</label>
              <input 
                name="password" type="password" required minLength={6}
                value={formData.password} onChange={handleChange}
                className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="••••••"
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
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input 
                  name="department" required 
                  value={formData.department} onChange={handleChange}
                  className="w-full mt-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="Cardiology"
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition disabled:bg-blue-300 flex justify-center items-center gap-2"
              >
                {loading ? <Loader className="animate-spin h-5 w-5" /> : 'Create Account'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default AddStaffModal;