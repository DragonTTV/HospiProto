import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, DollarSign, Receipt, CheckCircle, Loader } from 'lucide-react';

const BillingModal = ({ isOpen, onClose, appointment, onPaymentComplete }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && appointment) {
      const fetchBill = async () => {
        // Fetch all items ordered for this appointment
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('appointment_id', appointment.id);
        setOrders(data || []);
        setLoading(false);
      };
      fetchBill();
    }
  }, [isOpen, appointment]);

  if (!isOpen || !appointment) return null;

  const calculateTotal = () => orders.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ payment_status: 'Paid' })
        .eq('id', appointment.id);

      if (error) throw error;
      onPaymentComplete();
      onClose();
    } catch (err) {
      alert("Payment failed: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-purple-600 p-6 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Receipt size={24} /> Payment Details
          </h2>
          <button onClick={onClose} className="text-purple-100 hover:text-white"><X size={24} /></button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-sm text-gray-500">Patient</p>
            <h3 className="text-lg font-bold text-gray-900">{appointment.patient_name}</h3>
            <p className="text-xs text-gray-400">ID: #{appointment.id}</p>
          </div>

          {loading ? (
            <div className="text-center py-8"><Loader className="animate-spin mx-auto text-purple-600" /></div>
          ) : (
            <div className="border rounded-lg overflow-hidden mb-6">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Item</th>
                    <th className="px-4 py-2 text-center">Qty</th>
                    <th className="px-4 py-2 text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((item, i) => (
                    <tr key={i}>
                      <td className="px-4 py-2 text-gray-800">{item.item_name}</td>
                      <td className="px-4 py-2 text-center text-gray-500">{item.quantity}</td>
                      <td className="px-4 py-2 text-right font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between items-center mb-6 pt-4 border-t border-gray-100">
            <span className="text-gray-600 font-medium">Total Payable</span>
            <span className="text-3xl font-bold text-purple-600">${calculateTotal().toFixed(2)}</span>
          </div>

          <button 
            onClick={handlePayment}
            disabled={processing}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg shadow-md transition flex justify-center items-center gap-2"
          >
            {processing ? <Loader className="animate-spin" /> : <><CheckCircle size={20} /> Mark as Paid</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingModal;