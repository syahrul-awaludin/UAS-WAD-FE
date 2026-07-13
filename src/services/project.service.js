import api from "../lib/axios";

export const projectService = {
  getAll: async (params) => {
    const response = await api.get("/projects", { params });
    return response.data; // { data: [...], pagination: {...} }
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data; // { data: {...} }
  },

  create: async (data) => {
    const response = await api.post("/projects", data);
    return response.data.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data.data;
  },

  remove: async (id) => {
    await api.delete(`/projects/${id}`);
  },

  addMember: async (id, email) => {
    const response = await api.post(`/projects/${id}/members`, { email });
    return response.data;
  },
};
