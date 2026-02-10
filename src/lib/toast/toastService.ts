import { toast } from "react-toastify";
import type { ToastOptions } from "react-toastify";
import { HttpRequestError } from "../api/httpClient";

const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const toastService = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, { ...defaultOptions, ...options }),

  error: (message: string, options?: ToastOptions) =>
    toast.error(message, { ...defaultOptions, ...options }),

  info: (message: string, options?: ToastOptions) =>
    toast.info(message, { ...defaultOptions, ...options }),

  warning: (message: string, options?: ToastOptions) =>
    toast.warning(message, { ...defaultOptions, ...options }),

  loading: (message: string, options?: ToastOptions) =>
    toast.loading(message, { ...defaultOptions, ...options }),
};

type ApiFeedbackPayload = {
  message?: unknown;
  error?: unknown;
  statusCode?: unknown;
  [key: string]: unknown;
};

function parseMessage(value: unknown): string | null {
  if (Array.isArray(value)) {
    const list = value.filter((item) => typeof item === "string");
    return list.length > 0 ? list.join(", ") : null;
  }

  if (typeof value === "string" && value.trim()) {
    return value;
  }

  return null;
}

function parseStatusCode(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function formatToastFeedback(params: {
  title: string;
  statusCode?: number | null;
  message: string;
}): string {
  const statusSuffix =
    typeof params.statusCode === "number" ? ` ${params.statusCode}` : "";

  return `${params.title}${statusSuffix}: ${params.message}`;
}

function asApiPayload(value: unknown): ApiFeedbackPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as ApiFeedbackPayload;
}

export function getApiSuccessToastMessage(
  payload: unknown,
  fallbackMessage: string,
): string {
  const parsedPayload = asApiPayload(payload);
  const message = parseMessage(parsedPayload?.message) ?? fallbackMessage;

  return message;
}

export function getApiErrorToastMessage(
  error: unknown,
  fallbackMessage: string,
): string {
  const payload =
    error instanceof HttpRequestError
      ? asApiPayload(error.payload)
      : asApiPayload(error);

  const errorTitleRaw =
    parseMessage(payload?.error) ??
    (error instanceof HttpRequestError ? "Erro" : null) ??
    "Erro";
  const message =
    parseMessage(payload?.message) ??
    (error instanceof Error ? error.message : null) ??
    fallbackMessage;
  const statusCode =
    parseStatusCode(payload?.statusCode) ??
    (error instanceof HttpRequestError ? error.statusCode : null);

  return formatToastFeedback({
    title: errorTitleRaw,
    statusCode,
    message,
  });
}
