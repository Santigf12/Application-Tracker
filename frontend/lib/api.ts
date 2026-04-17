import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.response?.data?.detail || error.message || "Request failed";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An error occurred";
};
