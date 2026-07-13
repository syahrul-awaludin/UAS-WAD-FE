import { useState, useEffect } from "react";
import { Modal } from "./common/Modal";

export function ProjectForm({ onSubmit, onCancel, initialData = null }) {
  const isEdit = !!initialData;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        status: initialData.status || "ACTIVE",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Nama project wajib diisi!");
      return;
    }
    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <Modal title={isEdit ? "Edit Project" : "Project Baru"}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Project *</label>
            <input 
              required
              value={formData.name} 
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div className="form-group">
            <label>Deskripsi</label>
            <textarea 
              rows={3} 
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="ACTIVE">Aktif</option>
                <option value="COMPLETED">Selesai</option>
                <option value="ARCHIVED">Diarsipkan</option>
              </select>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Batal
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Buat Project"}
            </button>
          </div>
        </form>
    </Modal>
  );
}
