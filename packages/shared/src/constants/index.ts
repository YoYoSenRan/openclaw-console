export const API_PREFIX = "/api";

export const BizCode = {
  SUCCESS: 0,

  // 认证 10000-10099
  NOT_AUTHENTICATED: 10001,
  TOKEN_EXPIRED: 10002,
  TOKEN_INVALID: 10003,
  GATEWAY_NOT_CONFIGURED: 10004,

  // Gateway 20000-20099
  GATEWAY_CONNECT_FAILED: 20001,
  GATEWAY_DISCONNECTED: 20002,
  GATEWAY_AUTH_FAILED: 20003,
  GATEWAY_TIMEOUT: 20004,

  // 系统 90000-90099
  INTERNAL_ERROR: 90001,
  VALIDATION_ERROR: 90002,
  NOT_FOUND: 90003,
  RATE_LIMITED: 90004,
} as const;

export type BizCodeValue = (typeof BizCode)[keyof typeof BizCode];

export const PAGINATION_DEFAULT = {
  page: 1,
  pageSize: 20,
} as const;

export const TOKEN_KEY = "openclaw_access_token";
export const GATEWAY_ID_KEY = "openclaw_gateway_id";
