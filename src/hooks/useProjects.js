import { useState, useCallback, useEffect } from "react";
import { projectService } from "../services/project.service";
import { useRealTimeProjects } from "./useRealTimeProjects";
import { useNotif } from "../contexts/NotifContext";

export function useProjects({ filter = "ALL", search = "" } = {}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToast } = useNotif();

  useRealTimeProjects(setProjects);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter !== "ALL") params.status = filter;
      if (search) params.search = search;
      const res = await projectService.getAll(params);
      setProjects(res.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Gagal memuat project");
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (formData) => {
    try {
      const newProject = await projectService.create(formData);
      setProjects((prev) => [newProject, ...prev]);
      return true;
    } catch (err) {
      alert("Gagal membuat project: " + (err.response?.data?.error?.message || err.message));
      return false;
    }
  };

  const updateProject = async (id, formData) => {
    try {
      const updatedProject = await projectService.update(id, formData);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? updatedProject : p))
      );
      addToast({ type: "SUCCESS", title: "Berhasil", message: "Project berhasil diperbarui." });
      return true;
    } catch (err) {
      alert("Gagal menyimpan perubahan: " + (err.response?.data?.error?.message || err.message));
      return false;
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Yakin ingin menghapus project ini beserta isinya?")) return false;
    try {
      await projectService.remove(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      addToast({ type: "SUCCESS", title: "Berhasil", message: "Project berhasil dihapus." });
      return true;
    } catch (err) {
      alert("Gagal menghapus project: " + (err.response?.data?.error?.message || err.message));
      return false;
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
  };
}
