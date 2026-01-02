import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Pencil } from 'lucide-react';
import EditStaffModal from './EditStaffModal';

const StaffList = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchStaff = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });
        
      if (error) console.error('Error fetching staff:', error);
      else setStaff(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleEditClick = (person) => {
    setEditingUser(person);
    setIsEditModalOpen(true);
  };

  // NEW: Optimistic Update Function
  // We pass this to the modal. It updates the list INSTANTLY.
  const handleLocalUpdate = (updatedUser) => {
    setStaff((prevStaff) => 
      prevStaff.map((person) => 
        person.id === updatedUser.id ? { ...person, ...updatedUser } : person
      )
    );
  };

  if (loading) return <div className="text-center py-4 text-gray-500">Loading directory...</div>;

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Staff Directory</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Department</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{person.full_name || 'No Name'}</td>
                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{person.role}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{person.department || '-'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    (person.status || 'Active') === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {person.status || 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button 
                    onClick={() => handleEditClick(person)}
                    className="text-blue-600 hover:text-blue-900 flex items-center justify-end gap-1 ml-auto"
                  >
                    <Pencil size={16} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EditStaffModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        userToEdit={editingUser}
        onUserUpdated={handleLocalUpdate} // Use the new fast function
      />
    </>
  );
};

export default StaffList;