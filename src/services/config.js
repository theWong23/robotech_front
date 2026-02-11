const RAW_API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");
export const API_BASE_URL = RAW_API_URL.endsWith("/api") ? RAW_API_URL : `${RAW_API_URL}/api`;
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
export const API_URL = API_BASE_URL;