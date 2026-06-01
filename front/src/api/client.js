import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.BACKEND_BASE_URL || "http://localhost:8001/api",
  timeout: 10000,
});

const PUBLIC_ENDPOINTS = [
  "/auth/login",
  "/auth/register",
  "/auth/check-username",
];

apiClient.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    const isPublicEndpoint = PUBLIC_ENDPOINTS.some((endpoint) =>
      url.includes(endpoint)
    );

    if (!isPublicEndpoint) {
      const token = localStorage.getItem("accessToken");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
