export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
}
