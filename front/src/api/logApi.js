import apiClient from "./client";

export const getSystemLogs = async () => {
    const response = await apiClient.get("/logs");
    return response.data;
}
