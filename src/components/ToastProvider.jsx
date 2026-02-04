import React, { createContext, useContext, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = (message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto remove after 3 seconds
        setTimeout(() => {
            removeToast(id);
        }, 3000);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const notify = {
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
    };

    return (
        <ToastContext.Provider value={notify}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-center min-w-[300px] p-4 rounded-xl shadow-2xl animate-in slide-in-from-right duration-300 relative overflow-hidden ${toast.type === 'success' ? 'bg-white text-gray-800 border-l-4 border-schoolGreen' :
                                toast.type === 'error' ? 'bg-white text-gray-800 border-l-4 border-red-500' :
                                    'bg-white text-gray-800 border-l-4 border-blue-500'
                            }`}
                    >
                        <div className={`mr-3 ${toast.type === 'success' ? 'text-schoolGreen' :
                                toast.type === 'error' ? 'text-red-500' : 'text-blue-500'
                            }`}>
                            {toast.type === 'success' && <CheckCircle size={20} />}
                            {toast.type === 'error' && <AlertCircle size={20} />}
                            {toast.type === 'info' && <Info size={20} />}
                        </div>

                        <p className="font-bold text-sm flex-1">{toast.message}</p>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="ml-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
