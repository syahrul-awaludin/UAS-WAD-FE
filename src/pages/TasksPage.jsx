import { useState, useEffect, useCallback } from "react";
import { Navbar } from "../components/Navbar";
import { TaskCard } from "../components/TaskCard";
import { TaskForm } from "../components/TaskForm";
import { taskService } from "../services/task.service";
import { useRealTimeTasks } from "../hooks/useRealTimeTasks"; // ← TAMBAH

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [filter, setFilter] = useState("ALL");

  // ── REAL-TIME: satu baris ini menangani semua update live ──
  useRealTimeTasks(setTasks); // ← TAMBAH

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== "ALL" ? { status: filter } : {};
      const res = await taskService.getAll(params);
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Gagal memuat task");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async (formData) => {
    try {
      const newTask = await taskService.create(formData);
      // Tambahkan ke list lokal jika belum ada (mencegah duplikat dengan event Socket.IO)
      setTasks((prev) => {
        const exists = prev.some((t) => t.id === newTask.id);
        if (exists) return prev;
        return [newTask, ...prev];
      });
      setShowForm(false);
    } catch (err) {
      if (err.response?.data?.error?.details) {
        const msgs = err.response.data.error.details.map(d => `${d.field}: ${d.message}`).join('\\n');
        alert(`Gagal membuat task:\\n${msgs}`);
      } else {
        alert("Gagal membuat task: " + (err.response?.data?.error?.message || err.message));
      }
    }
  };

  const handleEditClick = (task) => {
    setEditTarget(task);
    setShowForm(true);
  };

  const handleUpdate = async (formData) => {
    try {
      const updatedTask = await taskService.update(editTarget.id, formData);
      // Update state lokal langsung (fallback jika Socket.IO offline)
      setTasks((prev) =>
        prev.map((t) => (t.id === editTarget.id ? updatedTask : t))
      );
      setShowForm(false);
      setEditTarget(null);
    } catch (err) {
      if (err.response?.data?.error?.details) {
        const msgs = err.response.data.error.details.map(d => `${d.field}: ${d.message}`).join('\\n');
        alert(`Gagal menyimpan perubahan:\\n${msgs}`);
      } else {
        alert("Gagal menyimpan perubahan: " + (err.response?.data?.error?.message || err.message));
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus task ini?")) return;
    try {
      await taskService.remove(id);
      // Update state lokal langsung (fallback jika Socket.IO offline)
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert("Gagal menghapus task: " + (err.response?.data?.error?.message || err.message));
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditTarget(null);
  };

  return (
    <div>
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <h1>Daftar Task</h1>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Task Baru
          </button>
        </div>

        <div className="filter-bar">
          {["ALL", "todo", "in_progress", "done"].map((s) => (
            <button
              key={s}
              className={`filter-btn ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s === "ALL" ? "Semua" : s === "todo" ? "Belum Dimulai" : s === "in_progress" ? "Sedang" : "Selesai"}
            </button>
          ))}
        </div>

        {loading && <p className="state-msg">Memuat task...</p>}
        {error && <p className="state-msg error">{error}</p>}
        {!loading && !error && tasks.length === 0 && (
          <p className="state-msg">Belum ada task.</p>
        )}

        <div className="task-grid">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={handleEditClick} onDelete={handleDelete} />
          ))}
        </div>

        {showForm && (
          <TaskForm
            onSubmit={editTarget ? handleUpdate : handleCreate}
            onCancel={handleCloseForm}
            initialData={editTarget}
          />
        )}
      </main>
    </div>
  );
}
