import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.BACKEND_BASE_URL || "http://localhost:8001/api",
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {

    // 로그인 시 백엔드로부터 발급받은 액세스 토큰을 로컬 스토리지에 저장했다고 가정
    // 로컬 스토리지에서 액세스 토큰을 가져와서 요청 헤더에 추가
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
