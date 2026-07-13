import { useState } from "react";
import { Navbar } from "../components/Navbar";
import { ProjectCard } from "../components/ProjectCard";
import { ProjectForm } from "../components/ProjectForm";
import { useProjects } from "../hooks/useProjects";

export function ProjectsPage() {
  const { projects, loading, error, createProject, updateProject, deleteProject } = useProjects();
  
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const handleCreate = async (formData) => {
    const success = await createProject(formData);
    if (success) setShowForm(false);
  };

  const handleEditClick = (project) => {
    setEditTarget(project);
    setShowForm(true);
  };

  const handleUpdate = async (formData) => {
    const success = await updateProject(editTarget.id, formData);
    if (success) {
      setShowForm(false);
      setEditTarget(null);
    }
  };

  const handleDelete = async (id) => {
    await deleteProject(id);
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
          <h1>Board Project</h1>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            + Project Baru
          </button>
        </div>

        {loading && <p className="state-msg">Memuat project...</p>}
        {error && <p className="state-msg error">{error}</p>}
        {!loading && !error && projects.length === 0 && (
          <p className="state-msg">Belum ada project. Mulai dengan membuat project pertamamu.</p>
        )}

        <div className="task-grid">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onEdit={handleEditClick} 
              onDelete={handleDelete} 
            />
          ))}
        </div>

        {showForm && (
          <ProjectForm
            onSubmit={editTarget ? handleUpdate : handleCreate}
            onCancel={handleCloseForm}
            initialData={editTarget}
          />
        )}
      </main>
    </div>
  );
}
