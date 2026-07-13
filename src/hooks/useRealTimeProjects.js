import { useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useNotif } from "../contexts/NotifContext";

export function useRealTimeProjects(setProjects) {
  const { socket } = useSocket();
  const { addToast } = useNotif();

  useEffect(() => {
    if (!socket) return;

    const onProjectCreated = ({ project }) => {
      setProjects((prev) => {
        const exists = prev.some((p) => p.id === project.id);
        if (exists) return prev;
        return [project, ...prev];
      });
      addToast({
        type: "INFO",
        title: "Project Baru",
        message: `Project "${project.name}" telah ditambahkan.`,
      });
    };

    const onProjectUpdated = ({ project }) => {
      setProjects((prev) => prev.map((p) => (p.id === project.id ? project : p)));
      addToast({
        type: "INFO",
        title: "Project Diperbarui",
        message: `Project "${project.name}" telah diperbarui.`,
      });
    };

    const onProjectDeleted = ({ projectId }) => {
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      addToast({
        type: "WARNING",
        title: "Project Dihapus",
        message: `Sebuah project telah dihapus.`,
      });
    };

    socket.on("project:created", onProjectCreated);
    socket.on("project:updated", onProjectUpdated);
    socket.on("project:deleted", onProjectDeleted);

    return () => {
      socket.off("project:created", onProjectCreated);
      socket.off("project:updated", onProjectUpdated);
      socket.off("project:deleted", onProjectDeleted);
    };
  }, [socket, setProjects, addToast]);
}
