export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
  path?: string;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiErrorPayload {
  success: boolean;
  message: string;
  timestamp?: string;
  path?: string;
  errors?: ValidationError[];
}

export class ApiError extends Error {
  status: number;
  data?: ApiErrorPayload;
  errors?: ValidationError[];

  constructor(status: number, message: string, data?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.errors = data?.errors;
  }
}
