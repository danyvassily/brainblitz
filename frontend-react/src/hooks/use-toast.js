import { useEffect, useState } from "react";

const TOAST_TIMEOUT = 5000;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setToasts((toasts) => toasts.filter((toast) => toast.open));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  function toast({ title, description, action, variant = "default" }) {
    const id = Math.random().toString(36).slice(2);
    const newToast = {
      id,
      title,
      description,
      action,
      variant,
      open: true,
    };

    setToasts((toasts) => [...toasts, newToast]);

    setTimeout(() => {
      setToasts((toasts) =>
        toasts.map((t) => (t.id === id ? { ...t, open: false } : t))
      );
    }, TOAST_TIMEOUT);

    return id;
  }

  function dismissToast(id) {
    setToasts((toasts) =>
      toasts.map((t) => (t.id === id ? { ...t, open: false } : t))
    );
  }

  return {
    toast,
    dismissToast,
    toasts,
  };
}
