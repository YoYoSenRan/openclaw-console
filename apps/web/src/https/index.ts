import axios from "axios";
import { TOKEN_KEY } from "@openclaw/shared";
import { useAuthStore } from "@/stores/auth";

// 服务端统一响应结构
interface ApiResponse<T = unknown> {
  ok: boolean;
  code: number;
  message: string;
  data: T;
}

// 业务错误类，携带 bizCode 供调用方判断
export class ApiError extends Error {
  constructor(
    public readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// 开发时走 Vite proxy（/api → SERVER_PORT），生产时用 VITE_API_BASE_URL + VITE_API_PREFIX
const apiPrefix = import.meta.env.VITE_API_PREFIX ?? "/api";
const baseURL =
  import.meta.env.PROD && import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}${apiPrefix}`
    : apiPrefix;

const http = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 请求拦截器：注入 JWT
http.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：解包 data 字段
http.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse;
    if (body && typeof body === "object" && "data" in body) {
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    // 401：清除登录态并跳转
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // 提取服务端返回的 bizCode 和 message
    const body = error.response?.data as ApiResponse | undefined;
    if (body && typeof body === "object" && "code" in body) {
      return Promise.reject(new ApiError(body.code, body.message));
    }

    return Promise.reject(error);
  },
);

export default http;
