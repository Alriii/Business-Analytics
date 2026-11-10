import axios from "axios";

type ApiErrorResponse = {
  message?: string;
  error?: string;
  details?: {
    fieldErrors?: Record<string, string[]>;
    formErrors?: string[];
  };
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7000/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof document === "undefined" || ["get", "head", "options"].includes(config.method?.toLowerCase() ?? "get")) {
    return config;
  }

  const requestUrl = new URL(config.url ?? "", config.baseURL ?? apiBaseUrl);
  const configuredApiUrl = new URL(apiBaseUrl, window.location.href);
  if (requestUrl.origin !== configuredApiUrl.origin) {
    return config;
  }

  const csrfCookie = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrfToken="))
    ?.slice("csrfToken=".length);
  const csrfToken = csrfCookie
    ? decodeURIComponent(csrfCookie)
    : window.sessionStorage.getItem("csrfToken");

  if (csrfToken) {
    config.headers.set("X-CSRF-Token", csrfToken);
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    if (typeof window !== "undefined") {
      const csrfToken = response.data?.data?.csrfToken;
      if (typeof csrfToken === "string") {
        window.sessionStorage.setItem("csrfToken", csrfToken);
      } else if (response.config.url?.endsWith("/auth/logout")) {
        window.sessionStorage.removeItem("csrfToken");
      }
    }

    return response;
  },
  (error: unknown) => {
    if (!axios.isAxiosError<ApiErrorResponse>(error)) {
      return Promise.reject(error);
    }

    const responseData = error.response?.data;
    const message = responseData?.message || responseData?.error;
    if (message) {
      const details = responseData?.details;
      const fieldErrors = Object.entries(details?.fieldErrors ?? {})
        .flatMap(([field, messages]) => messages.map((detail) => `${field}: ${detail}`))
        .join("; ");
      const formErrors = details?.formErrors?.join("; ");
      const validationDetails = [fieldErrors, formErrors].filter(Boolean).join("; ");

      if (validationDetails) {
        return Promise.reject(new Error(`${message}: ${validationDetails}`));
      }

      return Promise.reject(new Error(message));
    }

    if (!error.response) {
      return Promise.reject(
        new Error(`Cannot reach the FarmyTrack API at ${apiBaseUrl}. Make sure the backend is running and try again.`),
      );
    }

    return Promise.reject(new Error("The request failed. Please try again."));
  },
);

export const unwrapApiResponse = <T>(payload: { success?: boolean; data?: T; message?: string }): T => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data as T;
  }

  return payload as T;
};
