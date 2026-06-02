import { apiClient, analysisClient } from "./client";


export const getVideoList = async (search, name, sortBy, page, pageSize, startDate = '', endDate = '') => {
    const response = await apiClient.get("/videos?search=" + search + "&name=" + name +
        "&sortBy=" + sortBy + "&page=" + page + "&pageSize=" + pageSize +
        "&startDate=" + startDate + "&endDate=" + endDate);
    return response.data;
}


export const getRegionNames = async () => {
    const response = await apiClient.get("/videos/regions");
    return response.data;
}

export const deleteVideos = async (ids) => {
  const response = await apiClient.delete("/videos/", {
    data: { ids },
  });

  return response.data;
};

export const getVideoDetail = async (id) => {
    const response = await apiClient.get(`/videos/${id}`);
    return response.data;
}


export const uploadVideo = async ({ file, riverId, duration, date }) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("riverId", riverId);
  formData.append("duration", duration);
  formData.append("date", date);

  const response = await analysisClient.post("/videos/upload", formData, {
    timeout: 150000,
  });

  return response.data;
};
