import * as React from 'react';

export type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: 'default' | 'destructive';
};

export function useToast() {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([]);

  const toast = React.useCallback(({ ...props }: Omit<ToasterToast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...props, id };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);

    return {
      id,
      dismiss: () => setToasts(prev => prev.filter(t => t.id !== id)),
    };
  }, []);

  const dismiss = React.useCallback((toastId?: string) => {
    if (toastId) {
      setToasts(prev => prev.filter(t => t.id !== toastId));
    } else {
      setToasts([]);
    }
  }, []);

  return {
    toast,
    toasts,
    dismiss,
  };
}
