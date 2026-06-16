import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = sessionStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (username, password) => {
  const res = await api.post("/auth/login", { username, password });
  if (res.data.access_token) {
    sessionStorage.setItem("token", res.data.access_token);
  }
  return res;
};

export const logout = () => {
  sessionStorage.removeItem("token");
};

export const isAuthenticated = () => {
  if (typeof window === "undefined") return false;
  return !!sessionStorage.getItem("token");
};

export const getServices = (category) =>
  api.get("/services", { params: category ? { category } : {} });

export const getNearby = (lat, lng, radius_km, category) =>
  api.get("/services/nearby", {
    params: { lat, lng, radius_km, ...(category ? { category } : {}) },
  });

export const createService = (data) => api.post("/services", data);
export const updateService = (id, data) => api.put(`/services/${id}`, data);
export const deleteService = (id) => api.delete(`/services/${id}`);

export default api;
