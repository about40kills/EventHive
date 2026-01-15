import { useState, ReactNode } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  variant?: "default" | "destructive";
}

const toasts: Toast[] = [];
let toastId = 0;

export function useToast() {
  const [, forceUpdate] = useState({});

  const toast = ({
    title,
    description,
    action,
    variant = "default",
  }: Omit<Toast, "id">) => {
    const id = (++toastId).toString();
    const newToast: Toast = { id, title, description, action, variant };

    toasts.push(newToast);
    forceUpdate({});

    // Auto remove after 5 seconds
    setTimeout(() => {
      const index = toasts.findIndex((t) => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        forceUpdate({});
      }
    }, 5000);

    return id;
  };

  const dismiss = (toastId: string) => {
    const index = toasts.findIndex((t) => t.id === toastId);
    if (index > -1) {
      toasts.splice(index, 1);
      forceUpdate({});
    }
  };

  return {
    toast,
    dismiss,
    toasts: [...toasts],
  };
}
