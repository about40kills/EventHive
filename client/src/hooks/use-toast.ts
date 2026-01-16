import { toast as sonnerToast } from "sonner";
import { ReactNode } from "react";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: ReactNode;
  variant?: "default" | "destructive" | "success";
}

export function useToast() {
  const toast = ({
    title,
    description,
    action,
    variant = "default",
  }: Omit<Toast, "id">) => {

    // Auto-map variant to sonner types
    switch (variant) {
      case "destructive":
        return sonnerToast.error(title, {
          description,
          action: action as any, // Simple pass through, though might not look perfect without complex adapting
        });
      case "success":
        return sonnerToast.success(title, {
          description,
          action: action as any,
        });
      default:
        // Default usually implies success in this app context (or neutral)
        // But for standard "Operation Successful", we want green tick.
        // If title or description contains "Success" or "verified", we force success
        const isSuccess = (title?.toLowerCase().includes("success") || title?.toLowerCase().includes("verified") || description?.toLowerCase().includes("success"));

        if (isSuccess) {
          return sonnerToast.success(title, { description, action: action as any });
        }

        return sonnerToast.message(title, {
          description,
          action: action as any,
        });
    }
  };

  const dismiss = (toastId?: string) => {
    sonnerToast.dismiss(toastId);
  };

  return {
    toast,
    dismiss,
    toasts: [] // Mock to satisfy any legacy usage, though likely unused
  };
}
