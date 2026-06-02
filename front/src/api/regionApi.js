import apiClient from "./client";

export const getRiverList = async (search, risk, sortBy) => {
  const response = await apiClient.get("/rivers", {
    params: {
      search,
      risk,
      sortBy,
    },
  });

  return response.data;
};

export const getRiverDetail = async (id) => {
    const response = await apiClient.get(`/rivers/${id}`);
    return response.data;
}

export const createRiver = async (name, region, latitude, longitude, cautionThreshold, dangerThreshold) => {
    const response = await apiClient.post("/rivers", {
        name,
        region,
        latitude,
        longitude,
        cautionThreshold,
        dangerThreshold
    });
    return response.data;
};

export const updateRiver = async (id, name, region, latitude, longitude, cautionThreshold, dangerThreshold) => {
    const response = await apiClient.put(`/rivers/${id}`, {
        name,
        region,
        latitude,
        longitude,
        cautionThreshold,
        dangerThreshold
    });
    return response.data;
};

export const deleteRiver = async (id) => {
    const response = await apiClient.delete(`/rivers/${id}`);
    return response.data;
}

export const createRiverFromFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post("/rivers/upload", formData);
    return response.data;
}
