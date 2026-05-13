/**
 * Toast Helpers - Sonner
 * Helper functions để hiển thị toast notifications
 */

import { toast } from "sonner";

/**
 * Toast types
 */
export type ToastType = "success" | "error" | "info" | "warning";

/**
 * Show success toast
 */
export function toastSuccess(message: string, description?: string) {
  return toast.success(message, description ? { description } : undefined);
}

/**
 * Show error toast
 */
export function toastError(message: string, description?: string) {
  return toast.error(message, description ? { description } : undefined);
}

/**
 * Show info toast
 */
export function toastInfo(message: string, description?: string) {
  return toast(message, description ? { description } : undefined);
}

/**
 * Show warning toast
 */
export function toastWarning(message: string, description?: string) {
  return toast.warning(message, description ? { description } : undefined);
}

/**
 * Show promise toast (cho async actions)
 */
export function toastPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) {
  return toast.promise(promise, messages);
}

/**
 * Toast API object
 */
export const toastApi = {
  success: toastSuccess,
  error: toastError,
  info: toastInfo,
  warning: toastWarning,
  promise: toastPromise,
};
