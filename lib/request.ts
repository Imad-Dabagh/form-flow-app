import axios, { type AxiosRequestConfig } from "axios";
import type { ApiSuccess } from "./api-contracts";
import { toApiError } from "./api-error";

const baseURL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

if (!baseURL) {
  throw new Error("NEXT_PUBLIC_API_URL must be configured.");
}

const request = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

export async function requestData<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await request.request<ApiSuccess<T>>(config);
    return response.data.data;
  } catch (error) {
    throw toApiError(error);
  }
}

export function apiFetcher<T>(path: string): Promise<T> {
  return requestData<T>({ method: "GET", url: path });
}

export default request;
