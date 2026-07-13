import { Link } from "react-router-dom";

export function ProjectCard({ project, onEdit, onDelete }) {
  const statusConfig = {
    ACTIVE: { label: "Aktif", color: "#2563eb" },
    COMPLETED: { label: "Selesai", color: "#16a34a" },
    ARCHIVED: { label: "Arsip", color: "#6b7280" },
  };

  const s = statusConfig[project.status] || statusConfig.ACTIVE;

  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3 className="task-title">{project.name}</h3>
        <div className="task-actions">
          <button onClick={() => onEdit(project)} className="btn-icon" title="Edit">✏</button>
          <button onClick={() => onDelete(project.id)} className="btn-icon" title="Hapus">🗑</button>
        </div>
      </div>
      
      <p className="task-description">
        {project.description || "Tidak ada deskripsi."}
      </p>
      
      <div className="task-card-footer" style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="badge" style={{ backgroundColor: s.color }}>{s.label}</span>
        
        <Link 
          to={`/projects/${project.id}`} 
          style={{ color: "#2563eb", fontWeight: "bold", textDecoration: "none" }}
        >
          Lihat Task &rarr;
        </Link>
      </div>
    </div>
  );
}
