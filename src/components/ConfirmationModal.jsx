import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, isDangerous = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className={`p-4 flex items-center gap-3 ${isDangerous ? 'bg-red-50' : 'bg-gray-50'}`}>
          <div className={`p-2 rounded-full ${isDangerous ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'}`}>
            <AlertTriangle size={24} />
          </div>
          <h3 className={`text-lg font-bold ${isDangerous ? 'text-red-900' : 'text-gray-900'}`}>
            {title}
          </h3>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
          >
            No, Keep it
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`px-4 py-2 text-white text-sm font-bold rounded-lg shadow-sm transition transform active:scale-95 ${
              isDangerous 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            Yes, Cancel Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;