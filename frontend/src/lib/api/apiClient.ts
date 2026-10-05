import { ApiResponse, ApiError, ApiErrorPayload } from "./types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  token?: string | null;
}

/**
 * Core centralized HTTP request function for all PROVANA backend communications.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, token: explicitToken, headers: customHeaders, ...fetchOptions } = options;

  // 1. Resolve full URL
  let url = endpoint.startsWith("http://") || endpoint.startsWith("https://")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  // 2. Prepare Headers
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...((customHeaders as Record<string, string>) || {}),
  };

  // Add JSON Content-Type if body is string or plain object and not FormData
  if (fetchOptions.body && !(fetchOptions.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // 3. Attach JWT Bearer Token
  let token = explicitToken;
  if (!token && typeof window !== "undefined") {
    try {
      token = localStorage.getItem("provana_auth_token");
    } catch {
      // localStorage unavailable in SSR / restricted iframe
    }
  }

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token.trim()}`;
  }

  // 4. Execute Fetch
  let res: Response;
  try {
    res = await fetch(url, {
      ...fetchOptions,
      headers,
    });
  } catch (networkErr: any) {
    throw new ApiError(
      0,
      `Cannot connect to PROVANA backend at ${API_BASE_URL}. Ensure the Spring Boot server is running on port 8081.`
    );
  }

  // 5. Handle Response
  let responseData: any = null;
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      responseData = await res.json();
    } catch {
      responseData = null;
    }
  } else {
    try {
      responseData = await res.text();
    } catch {
      responseData = null;
    }
  }

  // Handle Error Codes (non-2xx)
  if (!res.ok) {
    const errorPayload = typeof responseData === "object" ? (responseData as ApiErrorPayload) : null;
    let message = errorPayload?.message || res.statusText;

    if (!message || message.trim() === "") {
      switch (res.status) {
        case 400:
          message = "Bad Request: Invalid parameters or payload.";
          break;
        case 401:
          message = "Unauthorized: Please log in with a valid account.";
          break;
        case 403:
          message = "Forbidden: You do not have permissions for this action.";
          break;
        case 404:
          message = "Resource not found.";
          break;
        case 409:
          message = "Conflict: Resource already exists or version mismatch.";
          break;
        case 422:
          message = "Unprocessable Entity: Validation failed.";
          break;
        case 500:
          message = "Internal Server Error: Backend operation failed.";
          break;
        default:
          message = `HTTP Error ${res.status}`;
      }
    }

    throw new ApiError(res.status, message, errorPayload || undefined);
  }

  // Unwrap ApiResponse<T> if wrapped
  if (responseData && typeof responseData === "object" && "success" in responseData && "data" in responseData) {
    return (responseData as ApiResponse<T>).data;
  }

  return responseData as T;
}

export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
