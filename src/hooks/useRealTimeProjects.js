import { useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useNotif } from "../contexts/NotifContext";
import { useAuth } from "../contexts/AuthContext";

export function useRealTimeProjects(setProjects) {
  const { socket, isConnected } = useSocket();
  const { addToast } = useNotif();
  const { user } = useAuth();

  const notifiedProjects = useRef(new Set());

  useEffect(() => {
    if (!socket || !isConnected) return;

    const onProjectCreated = ({ project, senderId }) => {
      setProjects((prev) => {
        const exists = prev.some((p) => String(p.id) === String(project.id));
        if (exists) return prev;
        return [project, ...prev];
      });
      if (user && String(senderId) !== String(user.id)) {
        addToast({
          type: "INFO",
          title: "Project Baru",
          message: `Project "${project.name}" telah ditambahkan.`,
        });
      }
    };

    const onProjectUpdated = ({ project, senderId }) => {
      setProjects((prev) => prev.map((p) => (String(p.id) === String(project.id) ? project : p)));
      if (user && String(senderId) !== String(user.id)) {
        addToast({
          type: "INFO",
          title: "Project Diperbarui",
          message: `Project "${project.name}" telah diperbarui.`,
        });
      }
    };

    const onProjectDeleted = ({ projectId, senderId }) => {
      setProjects((prev) => prev.filter((p) => String(p.id) !== String(projectId)));
      if (user && String(senderId) !== String(user.id)) {
        addToast({
          type: "WARNING",
          title: "Project Dihapus",
          message: `Sebuah project telah dihapus.`,
        });
      }
    };

    socket.on("project:created", onProjectCreated);
    socket.on("project:updated", onProjectUpdated);
    socket.on("project:deleted", onProjectDeleted);

    return () => {
      socket.off("project:created", onProjectCreated);
      socket.off("project:updated", onProjectUpdated);
      socket.off("project:deleted", onProjectDeleted);
    };
  }, [socket, isConnected, setProjects, addToast, user]);
}
