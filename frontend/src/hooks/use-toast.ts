import { toast as sonnerToast, type ToastT } from 'sonner';

type ToasterToast = Omit<ToastT, 'id'>;

interface UseToastReturn {
  toast: (props: ToasterToast) => {
    id: string;
    dismiss: () => void;
  };
}

export function useToast(): UseToastReturn {
  const toast = ({ ...props }: ToasterToast) => {
    const id = sonnerToast(props);
    return {
      id,
      dismiss: () => sonnerToast.dismiss(id),
    };
  };

  return { toast };
}
