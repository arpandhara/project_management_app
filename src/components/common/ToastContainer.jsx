import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, X } from "lucide-react";

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const handleShowToast = (event) => {
      const { message, link } = event.detail;
      const id = Date.now();
      
      setToasts((prev) => [...prev, { id, message, link }]);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        removeToast(id);
      }, 5000);
    };

    window.addEventListener("show-toast", handleShowToast);
    return () => window.removeEventListener("show-toast", handleShowToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClick = (link, id) => {
    if (link) navigate(link);
    removeToast(id);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => handleClick(toast.link, toast.id)}
          className="bg-neutral-900 border border-neutral-800 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-4 cursor-pointer hover:bg-neutral-800 transition-all animate-in slide-in-from-right duration-300 w-80"
        >
          <div className="bg-blue-600/20 p-2 rounded-full text-blue-500">
            <Bell size={20} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium line-clamp-2">{toast.message}</p>
            <p className="text-xs text-neutral-500 mt-1">Click to view</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            className="text-neutral-500 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;