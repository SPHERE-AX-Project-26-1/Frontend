import apiClient from "./client";

export const getTotalDetected = async (startDate, endDate) => {
    const response = await apiClient.get("/stats/total-detected?startDate=" + startDate + "&endDate=" + endDate);
    return response.data;
};

export const getTotalVideos = async (startDate, endDate) => {
    const response = await apiClient.get("/stats/total-videos?startDate=" + startDate + "&endDate=" + endDate);
    return response.data;
}

export const getTopRegion= async (startDate, endDate) => {
    const response = await apiClient.get("/stats/top-region?startDate=" + startDate + "&endDate=" + endDate);
    return response.data;
}

export const getTopWeather= async (startDate, endDate) => {
    const response = await apiClient.get("/stats/top-weather?startDate=" + startDate + "&endDate=" + endDate);
    return response.data;
}

export const getMonthlyStats = async (startDate, endDate) => {
    const response = await apiClient.get("/stats/monthly?startDate=" + startDate + "&endDate=" + endDate);
    return response.data;
}

export const getByRegion = async (startDate, endDate) => {
    const response = await apiClient.get("/stats/by-region?startDate=" + startDate + "&endDate=" + endDate);
    return response.data;
}

export const getByWeather = async (startDate, endDate) => {
    const response = await apiClient.get("/stats/by-weather?startDate=" + startDate + "&endDate=" + endDate);
    return response.data;
}
