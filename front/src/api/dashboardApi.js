import apiClient from "./client";

export const getDashboardSummary = async () => {
    const response = await apiClient.get("/dashboard/summary");
    return response.data;
}

export const getRiverMarkers = async (risk) => {
    const response = await apiClient.get(`/dashboard/rivers?risk=${risk}`);
    return response.data;
}

export const getTopRiversDashboard = async (limit) => {
    const response = await apiClient.get(`/dashboard/top-rivers?limit=${limit}`);
    return response.data;
}
