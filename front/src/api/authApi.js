import apiClient from "./client";

export const login = async (user_id, password) => {
  const response = await apiClient.post("/auth/login", {
    user_id,
    password
  });
  return response.data;
};

export const checkId = async (user_id) => {
    const response = await apiClient.get(`/auth/check-id?user_id=${user_id}`);
    return response.data;
};

export const register = async (user_id, password, username) => {
    const response = await apiClient.post("/auth/register", {
        user_id,
        password,
        username
    });
    return response.data;
};

export const logout = async () => {
    const response = await apiClient.post("/auth/logout");
    return response.data;
}
