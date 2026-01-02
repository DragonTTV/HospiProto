import React, { useState, useEffect } from 'react';
import { X, Activity, Save, Trash2, DollarSign, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';

const ConsultationModal = ({ isOpen, onClose, appointment, onConsultationComplete }) => {
  const [formData, setFormData] = useState({ diagnosis: '', prescription: '' });
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchItems = async () => {
        const { data } = await supabase.from('items').select('*');
        setItems(data || []);
      };
      fetchItems();
      
      // Default Cart: Always starts with the Base Fee
      setCart([{ 
        name: 'General Consultation', 
        price: 100, 
        type: 'Fee', 
        quantity: 1, 
        isFixed: true // Flag to prevent deletion
      }]);
      setFormData({ diagnosis: '', prescription: '' });
    }
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  const addToBill = (item) => {
    setCart([...cart, { ...item, quantity: 1, dosage: '', isFixed: false }]);
  };

  const removeFromBill = (index) => {
    if (cart[index].isFixed) return;
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newCart = [...cart];
    newCart[index][field] = value;
    setCart(newCart);
  };

  const calculateTotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Save ALL items to Database (Including the Base Fee)
      const orderPromises = cart.map(item => 
        supabase.from('orders').insert({
          appointment_id: appointment.id,
          item_name: item.name,
          price: item.price,
          quantity: item.quantity,
          dosage: item.dosage || null
        })
      );
      
      await Promise.all(orderPromises);

      // 2. Mark Appointment as Completed & Pending Payment
      const { error } = await supabase
        .from('appointments')
        .update({
          diagnosis: formData.diagnosis,
          prescription: formData.prescription,
          status: 'Completed',
          payment_status: 'Pending' // Ready for Reception
        })
        .eq('id', appointment.id);

      if (error) throw error;

      onConsultationComplete();
      onClose();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col md:flex-row max-h-[95vh]">
        
        {/* LEFT COLUMN: Clinical Notes */}
        <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Activity className="text-emerald-600" /> Clinical Assessment
            </h2>
            <button onClick={onClose} className="md:hidden text-gray-400"><X /></button>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
            <span className="text-xs font-bold text-blue-600 uppercase">Patient Complaint</span>
            <p className="text-gray-800 font-medium mt-1">{appointment.condition}</p>
          </div>

          <form id="consultForm" onSubmit={handleSubmit} className="space-y-6 flex-1">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Diagnosis</label>
              <textarea required rows="3" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Medical conclusion..." value={formData.diagnosis} onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">General Advice</label>
              <textarea required rows="4" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="Diet, rest, follow-up..." value={formData.prescription} onChange={(e) => setFormData({...formData, prescription: e.target.value})}></textarea>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Orders & Billing */}
        <div className="w-full md:w-1/2 bg-gray-50 p-6 flex flex-col h-full">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-bold text-gray-800">Pharmacy & Tests</h3>
              <p className="text-xs text-gray-500">Add medicines with dosage</p>
            </div>
            <button onClick={onClose} className="hidden md:block text-gray-400 hover:text-gray-600"><X /></button>
          </div>

          {/* Quick Add Buttons (Filtered) */}
          <div className="mb-4">
            <div className="flex gap-2 flex-wrap">
              {items
                // FIX: Filter out "General Consultation" so it doesn't show in chips
                .filter(item => item.name !== 'General Consultation') 
                .map(item => (
                <button 
                  key={item.id}
                  onClick={() => addToBill(item)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition shadow-sm flex items-center gap-1 ${item.type === 'Medicine' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'}`}
                >
                  <Plus size={12} /> {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Bill List */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-0 overflow-hidden flex flex-col mb-4">
            <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs font-bold text-gray-500 flex">
              <span className="flex-1">Item</span>
              <span className="w-16 text-center">Qty</span>
              <span className="w-20 text-right">Price</span>
              <span className="w-8"></span>
            </div>
            <div className="overflow-y-auto p-2 space-y-2 flex-1">
              {cart.map((item, idx) => (
                <div key={idx} className="border border-gray-100 rounded-lg p-2 hover:bg-gray-50 transition">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-medium text-sm ${item.isFixed ? 'text-gray-800' : 'text-emerald-700'}`}>{item.name}</span>
                    <div className="flex items-center gap-4">
                      {!item.isFixed && (
                         <div className="flex items-center border rounded bg-white">
                           <button type="button" onClick={() => updateItem(idx, 'quantity', Math.max(1, item.quantity - 1))} className="px-2 text-gray-500 hover:bg-gray-100">-</button>
                           <span className="px-2 text-xs font-bold w-6 text-center">{item.quantity}</span>
                           <button type="button" onClick={() => updateItem(idx, 'quantity', item.quantity + 1)} className="px-2 text-gray-500 hover:bg-gray-100">+</button>
                         </div>
                      )}
                      <span className="font-bold text-sm text-gray-700 w-16 text-right">${(item.price * item.quantity).toFixed(2)}</span>
                      <div className="w-6 flex justify-end">
                        {!item.isFixed && (<button onClick={() => removeFromBill(idx)} className="text-gray-300 hover:text-red-500"><Trash2 size={16} /></button>)}
                      </div>
                    </div>
                  </div>
                  {item.type === 'Medicine' && !item.isFixed && (
                    <div className="mt-1"><input type="text" placeholder="Ex. 1-0-1 After Food" className="w-full text-xs p-1.5 border border-gray-200 rounded bg-yellow-50 focus:bg-white focus:ring-1 focus:ring-yellow-400 outline-none" value={item.dosage} onChange={(e) => updateItem(idx, 'dosage', e.target.value)} /></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-500 font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-emerald-600">${calculateTotal().toFixed(2)}</span>
            </div>
            <button type="submit" form="consultForm" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition transform active:scale-[0.98] flex justify-center items-center gap-2">
              {loading ? <Activity className="animate-spin" /> : <><DollarSign size={20} /> Finalize & Bill</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationModal;