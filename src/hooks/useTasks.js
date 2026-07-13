import { useState, useCallback, useEffect } from "react";
import { taskService } from "../services/task.service";
import { useRealTimeTasks } from "./useRealTimeTasks";
import { useRealTimeProjectTasks } from "./useRealTimeProjectTasks";

export function useTasks({ filter = "ALL", projectId = null } = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pasang Socket.IO listener secara dinamis berdasarkan konteks
  if (projectId) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useRealTimeProjectTasks(projectId, setTasks);
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useRealTimeTasks(setTasks);
  }

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filter !== "ALL") params.status = filter;
      if (projectId) params.projectId = projectId;

      const res = await taskService.getAll(params);
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Gagal memuat task");
    } finally {
      setLoading(false);
    }
  }, [filter, projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (formData) => {
    try {
      const dataWithProject = projectId ? { ...formData, projectId } : formData;
      const newTask = await taskService.create(dataWithProject);
      setTasks((prev) => {
        const exists = prev.some((t) => t.id === newTask.id);
        if (exists) return prev;
        return [newTask, ...prev];
      });
      return true;
    } catch (err) {
      if (err.response?.data?.error?.details) {
        const msgs = err.response.data.error.details.map((d) => `${d.field}: ${d.message}`).join('\n');
        alert(`Gagal membuat task:\n${msgs}`);
      } else {
        alert("Gagal membuat task: " + (err.response?.data?.error?.message || err.message));
      }
      return false;
    }
  };

  const updateTask = async (id, formData) => {
    try {
      const updatedTask = await taskService.update(id, formData);
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updatedTask : t))
      );
      return true;
    } catch (err) {
      if (err.response?.data?.error?.details) {
        const msgs = err.response.data.error.details.map((d) => `${d.field}: ${d.message}`).join('\n');
        alert(`Gagal menyimpan perubahan:\n${msgs}`);
      } else {
        alert("Gagal menyimpan perubahan: " + (err.response?.data?.error?.message || err.message));
      }
      return false;
    }
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Yakin ingin menghapus task ini?")) return false;
    try {
      await taskService.remove(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      return true;
    } catch (err) {
      alert("Gagal menghapus task: " + (err.response?.data?.error?.message || err.message));
      return false;
    }
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
  };
}
