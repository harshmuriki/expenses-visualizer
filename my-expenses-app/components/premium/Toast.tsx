"use client";

import React, { useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiInfo, FiAlertCircle } from "react-icons/fi";

export type ToastType = "success" | "error" | "info" | "warning";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = {
    success: {
      icon: FiCheckCircle,
      bg: "bg-emerald-500",
      border: "border-emerald-400",
    },
    error: {
      icon: FiXCircle,
      bg: "bg-red-500",
      border: "border-red-400",
    },
    info: {
      icon: FiInfo,
      bg: "bg-blue-500",
      border: "border-blue-400",
    },
    warning: {
      icon: FiAlertCircle,
      bg: "bg-amber-500",
      border: "border-amber-400",
    },
  };

  const { icon: Icon, bg, border } = config[type];

  return (
    <div
      className={`${bg} ${border} border-2 text-white rounded-xl p-4 shadow-2xl flex items-center gap-3 min-w-[300px] animate-slide-up`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 font-medium">{message}</p>
      <button
        onClick={onClose}
        className="p-1 hover:bg-white/20 rounded transition-colors"
      >
        <FiXCircle className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type: ToastType }>;
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-3">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
};

// Hook for managing toasts
export const useToast = () => {
  const [toasts, setToasts] = React.useState<
    Array<{ id: string; message: string; type: ToastType }>
  >([]);

  const addToast = (message: string, type: ToastType = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return { toasts, addToast, removeToast };
};

export default Toast;
