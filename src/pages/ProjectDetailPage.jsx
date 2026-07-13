import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { TaskCard } from "../components/TaskCard";
import { TaskForm } from "../components/TaskForm";
import { projectService } from "../services/project.service";
import { useTasks } from "../hooks/useTasks";

export function ProjectDetailPage() {
  const { id } = useParams();
  const projectId = parseInt(id, 10);

  const [project, setProject] = useState(null);
  
  // Clean Architecture: Custom Hook handles Task state and Real-Time WebSocket binding
  const { tasks, loading, error, createTask, updateTask, deleteTask } = useTasks({ projectId });

  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await projectService.getById(projectId);
        setProject(res.data);
      } catch (err) {
        console.error("Gagal memuat project", err);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleCreateTask = async (formData) => {
    const success = await createTask(formData);
    if (success) setShowForm(false);
  };

  const handleEditClick = (task) => {
    setEditTarget(task);
    setShowForm(true);
  };

  const handleUpdateTask = async (formData) => {
    const success = await updateTask(editTarget.id, formData);
    if (success) {
      setShowForm(false);
      setEditTarget(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    await deleteTask(taskId);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditTarget(null);
  };

  return (
    <div>
      <Navbar />
      <main className="main-content">
        <div style={{ marginBottom: "1rem" }}>
          <Link to="/projects" style={{ color: "#2563eb", textDecoration: "none", fontWeight: "bold" }}>
            &larr; Kembali ke Board
          </Link>
        </div>

        {loading && <p className="state-msg">Memuat detail...</p>}
        {error && <p className="state-msg error">{error}</p>}
        
        {project && (
          <div className="task-card" style={{ marginBottom: "2rem", borderLeft: "5px solid #2563eb" }}>
            <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem", color: "#111827" }}>
              {project.name}
            </h1>
            <p className="task-description" style={{ fontSize: "1rem", color: "#4b5563" }}>
              {project.description || "Tidak ada deskripsi."}
            </p>
          </div>
        )}

        <div className="page-header">
          <h2>Task Project</h2>
          <button 
            className="btn-primary" 
            onClick={() => setShowForm(true)}
            disabled={!project}
          >
            + Task Baru
          </button>
        </div>

        {!loading && !error && tasks.length === 0 && (
          <p className="state-msg">Tambahkan task untuk project ini.</p>
        )}

        <div className="task-grid">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={handleEditClick} onDelete={handleDeleteTask} />
          ))}
        </div>

        {showForm && (
          <TaskForm
            onSubmit={editTarget ? handleUpdateTask : handleCreateTask}
            onCancel={handleCloseForm}
            initialData={editTarget}
          />
        )}
      </main>
    </div>
  );
}
