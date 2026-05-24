/**
 * Axios Instance with API Gateway Pattern
 */

import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { API_CONFIG, type RequestConfig } from "@/types/api.types";
import { getAuthState } from "@/stores/auth.store";

interface AuthAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
  skipRefresh?: boolean;
}

const createAxiosInstance = (): AxiosInstance => {
  return axios.create({
    baseURL: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });
};

export const axiosInstance = createAxiosInstance();

// Request interceptor
axiosInstance.interceptors.request.use(
  (config: AuthAxiosRequestConfig) => {
    if (config.skipAuth) return config;
    const token = getAuthState().accessToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor with token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: unknown) => void; reject: (reason?: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve(token)));
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AuthAxiosRequestConfig & { _retry?: boolean };

    if (originalRequest?.skipRefresh || originalRequest?._retry) {
      return Promise.reject(error);
    }

    // 401 handling with token refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Skip refresh if this is a refresh request itself
      if (originalRequest.url?.includes("/refresh")) {
        if (typeof window !== "undefined") {
          getAuthState().logout();
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // Already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint
        const response = await axiosInstance.post("/api/v1/refresh", {}, {
          headers: {} as any,  // Override to skip auth
        } as any);

        // Backend returns: { data: { access_token, ... } }
        const access_token = response.data?.data?.access_token || response.data?.access_token;

        if (!access_token) {
          throw new Error("No access token in refresh response");
        }

        if (typeof window !== "undefined") {
          // Update tokens in store
          getAuthState().setTokens(access_token, getAuthState().refreshToken || "");
        }

        processQueue(null, access_token);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== "undefined") {
          getAuthState().logout();
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Extract error message from backend response
    // Backend format: { error: { code, message } }
    let errorMessage = "Có lỗi xảy ra";

    if (axios.isAxiosError(error)) {
      const backendError = (error.response?.data as { error?: { code?: string; message?: string } })?.error;

      if (backendError?.message) {
        errorMessage = backendError.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    return Promise.reject({ message: errorMessage, originalError: error });
  }
);

// API Gateway class
export class ApiGateway {
  constructor(private client: AxiosInstance = axiosInstance) { }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.get<{ data: T }>(url, config);
    return response.data.data;
  }

  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.client.post<{ data: T }>(url, data, config);
    return response.data.data;
  }

  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.client.put<{ data: T }>(url, data, config);
    return response.data.data;
  }

  async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.client.patch<{ data: T }>(url, data, config);
    return response.data.data;
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.client.delete<{ data: T }>(url, config);
    return response.data.data;
  }
}

export const apiGateway = new ApiGateway();
