import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  CalendarPlus, User, Clock, Stethoscope, 
  CalendarDays, Trash2, CheckCircle, DollarSign 
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import BillingModal from './BillingModal';

const ReceptionDesk = () => {
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  
  // Form State
  const [booking, setBooking] = useState({
    doctorId: '',
    patientName: '',
    age: '',
    condition: '',
    date: new Date().toISOString().split('T')[0], // Defaults to Today
    time: ''
  });
  
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Fetch Data (Doctors + Appointments)
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Get Doctors
      const { data: doctorsData } = await supabase
        .from('profiles')
        .select('id, full_name, department, status')
        .eq('role', 'doctor');

      if (doctorsData) setDoctors(doctorsData);

      // Get Appointments (Ordered by Date, then Time)
      const { data: aptData, error } = await supabase
        .from('appointments')
        .select(`*, doctor:doctor_id ( full_name )`)
        .order('appointment_date', { ascending: true }) // Earliest date first
        .order('time', { ascending: true }); // Earliest time first

      if (error) throw error;
      setAppointments(aptData || []);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Handle Booking Submission
  const handleBook = async (e) => {
    e.preventDefault();
    if (!booking.doctorId) return alert("Please select a doctor");

    try {
      const { error } = await supabase
        .from('appointments')
        .insert([
          {
            doctor_id: booking.doctorId,
            patient_name: booking.patientName,
            age: booking.age,
            condition: booking.condition,
            appointment_date: booking.date,
            time: booking.time,
            status: 'Scheduled',
            payment_status: 'Pending'
          }
        ]);

      if (error) throw error;

      setSuccessMsg(`Booked for ${booking.patientName} on ${booking.date}`);
      
      // Reset form (keep date for convenience)
      setBooking(prev => ({ ...prev, patientName: '', age: '', condition: '', time: '' }));
      
      fetchData(); // Refresh list immediately
      setTimeout(() => setSuccessMsg(''), 3000);

    } catch (error) {
      alert("Booking failed: " + error.message);
    }
  };

  // 3. Cancel Logic
  const promptCancel = (id) => {
    setAppointmentToCancel(id);
  };

  const confirmCancel = async () => {
    if (!appointmentToCancel) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'Cancelled' })
        .eq('id', appointmentToCancel);

      if (error) throw error;
      
      fetchData(); // Refresh List
      setAppointmentToCancel(null); // Close modal
    } catch (error) {
      alert("Error cancelling: " + error.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT COLUMN: Booking Form */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-6">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <CalendarPlus className="text-purple-600" /> Book Appointment
          </h3>

          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center gap-2 text-sm font-medium animate-pulse">
              <CheckCircle size={16} /> {successMsg}
            </div>
          )}

          <form onSubmit={handleBook} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
              <div className="relative">
                <Stethoscope className="absolute left-3 top-3 text-gray-400" size={18} />
                <select 
                  required
                  className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none bg-white"
                  value={booking.doctorId}
                  onChange={(e) => setBooking({...booking, doctorId: e.target.value})}
                >
                  <option value="">-- Choose Specialist --</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.full_name} ({doc.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                  required
                  className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  placeholder="Ex. Jane Doe"
                  value={booking.patientName}
                  onChange={(e) => setBooking({...booking, patientName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input 
                  required type="date"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  value={booking.date}
                  onChange={(e) => setBooking({...booking, date: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    required type="time"
                    className="w-full pl-10 p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    value={booking.time}
                    onChange={(e) => setBooking({...booking, time: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input 
                required type="number"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="25"
                value={booking.age}
                onChange={(e) => setBooking({...booking, age: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <textarea 
                required rows="2"
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Reason for visit..."
                value={booking.condition}
                onChange={(e) => setBooking({...booking, condition: e.target.value})}
              ></textarea>
            </div>

            <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition shadow-md">
              Confirm Booking
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Info Board */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Doctor Status */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Doctor Availability</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {doctors.map(doc => (
              <div key={doc.id} className="p-4 border rounded-lg hover:shadow-md transition bg-gray-50 flex items-center gap-4">
                <div className={`w-3 h-16 rounded-full ${doc.status === 'Active' ? 'bg-green-500' : 'bg-red-400'}`}></div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800">{doc.full_name}</h4>
                  <p className="text-sm text-purple-600 font-medium">{doc.department}</p>
                  <span className={`text-xs mt-1 inline-block px-2 py-0.5 rounded-md ${
                    doc.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {doc.status === 'Active' ? 'Available' : 'On Leave'}
                  </span>
                </div>
                <button 
                  onClick={() => setBooking(prev => ({ ...prev, doctorId: doc.id }))}
                  className="text-sm bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-purple-50 hover:text-purple-700 transition"
                >
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Appointment List */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <CalendarDays className="text-purple-600" /> Upcoming Schedule
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-purple-50 text-purple-900 font-semibold">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Date & Time</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-gray-800">{apt.appointment_date || 'Today'}</div>
                        <div className="text-purple-600 text-xs font-medium">{apt.time}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-gray-800">{apt.patient_name}</div>
                        <div className="text-xs text-gray-500">{apt.condition}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {apt.doctor?.full_name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3">
                        {/* Status Badge */}
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          apt.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          apt.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {apt.status}
                        </span>

                        {/* Payment Badge (Only for Completed) */}
                        {apt.status === 'Completed' && (
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-bold border ${
                            apt.payment_status === 'Paid' 
                              ? 'bg-purple-100 text-purple-700 border-purple-200' 
                              : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                          }`}>
                            {apt.payment_status || 'Pending'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2">
                        {/* Cancel Button (For Scheduled) */}
                        {apt.status === 'Scheduled' && (
                          <button 
                            onClick={() => promptCancel(apt.id)}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition"
                            title="Cancel Appointment"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                        {/* Bill Button (For Completed & Unpaid) */}
                        {apt.status === 'Completed' && apt.payment_status !== 'Paid' && (
                          <button 
                            onClick={() => setSelectedBill(apt)}
                            className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-purple-700 transition shadow-sm"
                          >
                            <DollarSign size={14} /> Bill
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* MODALS */}
      <ConfirmationModal 
        isOpen={!!appointmentToCancel}
        onClose={() => setAppointmentToCancel(null)}
        onConfirm={confirmCancel}
        title="Cancel Appointment?"
        message="Are you sure you want to cancel this appointment? This action cannot be undone."
        isDangerous={true}
      />

      <BillingModal 
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        appointment={selectedBill}
        onPaymentComplete={fetchData} 
      />

    </div>
  );
};

export default ReceptionDesk;