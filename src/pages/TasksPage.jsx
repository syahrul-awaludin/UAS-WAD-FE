import { useState, useEffect, useCallback } from "react";
import { Navbar } from "../components/Navbar";
import { TaskCard } from "../components/TaskCard";
import { TaskForm } from "../components/TaskForm";
import { taskService } from "../services/task.service";

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [filter, setFilter] = useState("ALL");

  // Fetch semua task
  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = filter !== "ALL" ? { status: filter.toLowerCase() } : {};
      const res = await taskService.getAll(params);
      setTasks(res.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Gagal memuat task");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // CREATE
  const handleCreate = async (formData) => {
    const payload = { ...formData };
    payload.status = payload.status.toLowerCase();
    payload.priority = payload.priority.toLowerCase();
    if (!payload.dueDate) {
      delete payload.dueDate;
    } else {
      const d = new Date(payload.dueDate);
      d.setHours(23, 59, 59, 999);
      payload.dueDate = d.toISOString();
    }
    
    try {
      const newTask = await taskService.create(payload);
      setTasks(prev => [newTask, ...prev]);
      setShowForm(false);
    } catch (err) {
      if (err.response?.data?.error?.details) {
        const msgs = err.response.data.error.details.map(d => d.message).join('\\n');
        alert('Gagal membuat task:\\n' + msgs);
      } else {
        alert('Gagal membuat task: ' + (err.response?.data?.error?.message || err.message));
      }
      console.error('Create Error Payload:', payload);
    }
  };

  // EDIT — buka form dengan data task yang ada
  const handleEditClick = (task) => {
    setEditTarget(task);
    setShowForm(true);
  };

  // UPDATE
  const handleUpdate = async (formData) => {
    const payload = { ...formData };
    payload.status = payload.status.toLowerCase();
    payload.priority = payload.priority.toLowerCase();
    if (!payload.dueDate) {
      delete payload.dueDate;
    } else {
      const d = new Date(payload.dueDate);
      d.setHours(23, 59, 59, 999);
      payload.dueDate = d.toISOString();
    }

    try {
      const updated = await taskService.update(editTarget.id, payload);
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      setShowForm(false);
      setEditTarget(null);
    } catch (err) {
      if (err.response?.data?.error?.details) {
        const msgs = err.response.data.error.details.map(d => d.message).join('\\n');
        alert('Gagal mengupdate:\\n' + msgs);
      } else {
        alert('Gagal mengupdate task: ' + (err.response?.data?.error?.message || err.message));
      }
      console.error('Update Error Payload:', payload);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus task ini?")) return;
    await taskService.remove(id);
    setTasks(prev => prev.filter(t => t.id !== id));
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
        
        {/* Filter Status */}
        <div className="filter-bar">
          {["ALL","TODO","IN_PROGRESS","DONE"].map(s => (
            <button
              key={s}
              className={`filter-btn ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s === "ALL" ? "Semua" : s === "TODO" ? "Belum Dimulai" : s === "IN_PROGRESS" ? "Sedang Dikerjakan" : "Selesai"}
            </button>
          ))}
        </div>
        
        {/* Konten */}
        {loading && <p className="state-msg">Memuat task...</p>}
        {error && <p className="state-msg error">{error}</p>}
        {!loading && !error && tasks.length === 0 && (
          <p className="state-msg">Belum ada task. Buat task pertamamu!</p>
        )}
        
        <div className="task-grid">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          ))}
        </div>
        
        {/* Modal Form */}
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
