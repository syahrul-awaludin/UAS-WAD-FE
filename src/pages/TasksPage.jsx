import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { TaskCard } from "../components/TaskCard";
import { TaskForm } from "../components/TaskForm";
import { useTasks } from "../hooks/useTasks";

export function TasksPage() {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks({ filter, search });
  
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const handleCreate = async (formData) => {
    const success = await createTask(formData);
    if (success) setShowForm(false);
  };

  const handleEditClick = (task) => {
    setEditTarget(task);
    setShowForm(true);
  };

  const handleUpdate = async (formData) => {
    const success = await updateTask(editTarget.id, formData);
    if (success) {
      setShowForm(false);
      setEditTarget(null);
    }
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
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
          <input 
            type="text" 
            placeholder="Cari judul task..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="search-input"
          />
          {["ALL", "TODO", "IN_PROGRESS", "DONE"].map((s) => (
            <button
              key={s}
              className={`filter-btn ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s === "ALL" ? "Semua" : s === "TODO" ? "Belum Dimulai" : s === "IN_PROGRESS" ? "Sedang" : "Selesai"}
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
