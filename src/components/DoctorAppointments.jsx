import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Calendar, Clock, XCircle, User, CalendarDays, ClipboardList, Ban } from 'lucide-react';
import ConsultationModal from './ConsultationModal';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today'); // 'today', 'upcoming', 'cancelled'
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', user.id)
        .order('appointment_date', { ascending: true })
        .order('time', { ascending: true });

      const today = new Date().toISOString().split('T')[0];

      if (filter === 'today') {
        query = query.eq('appointment_date', today).neq('status', 'Cancelled');
      } else if (filter === 'upcoming') {
        query = query.gt('appointment_date', today).neq('status', 'Cancelled');
      } else if (filter === 'cancelled') {
        query = query.eq('status', 'Cancelled');
      }

      const { data, error } = await query;
      if (error) throw error;
      setAppointments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, [filter]);

  // Helper to change active tab style
  const TabButton = ({ name, label }) => (
    <button 
      onClick={() => setFilter(name)} 
      className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
        filter === name ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header & Tabs */}
      <div className="px-6 py-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="text-emerald-600" size={20} /> Patient Schedule
        </h3>
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <TabButton name="today" label="Today" />
          <TabButton name="upcoming" label="Upcoming" />
          <TabButton name="cancelled" label="Cancelled" />
        </div>
      </div>

      {/* List Content */}
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading...</div>
        ) : appointments.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="bg-emerald-50 p-4 rounded-full mb-3">
              {filter === 'cancelled' ? <Ban className="text-red-300" size={32} /> : <CalendarDays className="text-emerald-300" size={32} />}
            </div>
            <p className="text-gray-500 font-medium">
              {filter === 'cancelled' ? "No cancelled appointments found." : "No appointments scheduled."}
            </p>
          </div>
        ) : (
          appointments.map((apt) => (
            <div key={apt.id} className="p-6 hover:bg-slate-50 transition flex flex-col md:flex-row justify-between items-start gap-4">
              
              {/* Patient Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-full ${apt.status === 'Cancelled' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                    <User size={18} />
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${apt.status === 'Cancelled' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{apt.patient_name}</h4>
                    <p className="text-xs text-gray-500">Age: {apt.age}</p>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`text-xs px-2 py-1 rounded-full font-bold border ${
                     apt.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' :
                     apt.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                     'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {apt.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm mt-3 ml-11">
                   <div className="flex items-center gap-2 text-gray-600">
                     <Clock size={14} className="text-emerald-500" />
                     <span className="font-semibold text-gray-900">{apt.time}</span>
                     <span className="text-gray-400">on</span>
                     <span>{apt.appointment_date}</span>
                   </div>
                   <div className="text-gray-600">
                     <span className="font-medium text-gray-900">Condition:</span> {apt.condition}
                   </div>
                   {/* If diagnosis exists, show it */}
                   {apt.diagnosis && (
                     <div className="col-span-2 mt-2 text-emerald-700 bg-emerald-50 p-2 rounded text-xs border border-emerald-100">
                       <strong>Dx:</strong> {apt.diagnosis}
                     </div>
                   )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {apt.status === 'Scheduled' && (
                  <>
                    <button 
                      onClick={() => setSelectedPatient(apt)}
                      className="flex items-center gap-1 px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 shadow-sm"
                    >
                      <ClipboardList size={16} /> Start Consultation
                    </button>
                    {/* Cancel logic could go here too if you want doctors to cancel */}
                  </>
                )}
                {apt.status === 'Completed' && (
                  <button disabled className="px-4 py-2 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg border border-gray-200 cursor-default">
                    Billed & Completed
                  </button>
                )}
              </div>

            </div>
          ))
        )}
      </div>

      <ConsultationModal 
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        appointment={selectedPatient}
        onConsultationComplete={fetchAppointments}
      />
    </div>
  );
};

export default DoctorAppointments;