import React from 'react';
import { X } from 'lucide-react';

/**
 * Custom Modal Component for Add/Edit forms and confirmation messages.
 */
const Modal = ({ title, children, onClose }) => (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 z-50 flex justify-center items-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all duration-300 scale-100">
            <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h3>
                <button 
                    onClick={onClose} 
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full transition"
                >
                    <X size={20} />
                </button>
            </div>
            {children}
        </div>
    </div>
);

export default Modal;
