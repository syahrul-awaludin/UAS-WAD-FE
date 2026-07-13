import { useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useNotif } from "../contexts/NotifContext";
import { useAuth } from "../contexts/AuthContext";

export function useRealTimeProjectTasks(projectId, setTasks) {
  const { socket } = useSocket();
  const { addToast } = useNotif();
  const { user } = useAuth();
  
  const notifiedTasks = useRef(new Set());

  useEffect(() => {
    if (!socket || !projectId) return;

    socket.emit("project:join", projectId);

    const onTaskCreated = ({ task }) => {
      if (task.projectId != projectId) return;
      setTasks((prev) => {
        const exists = prev.some((t) => t.id === task.id);
        if (exists) return prev;
        return [task, ...prev];
      });

      if (user && task.userId !== user.id && !notifiedTasks.current.has(task.id)) {
        notifiedTasks.current.add(task.id);
        addToast({
          type: "INFO",
          title: "Task Baru di Project",
          message: `Anggota tim menambahkan task: "${task.title}"`,
        });
      }
    };

    const onTaskUpdated = ({ task }) => {
      if (task.projectId != projectId) return;
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      addToast({
        type: "INFO",
        title: "Task Project Diperbarui",
        message: `"${task.title}" telah diperbarui.`,
      });
    };

    const onTaskDeleted = ({ taskId }) => {
      setTasks((prev) => {
        const exists = prev.some((t) => t.id === taskId);
        if (!exists) return prev;
        return prev.filter((t) => t.id !== taskId);
      });

      if (!notifiedTasks.current.has(`del-${taskId}`)) {
        notifiedTasks.current.add(`del-${taskId}`);
        addToast({
          type: "WARNING",
          title: "Task Dihapus",
          message: `Seseorang telah menghapus task dari project.`,
        });
      }
    };

    socket.on("task:created", onTaskCreated);
    socket.on("task:updated", onTaskUpdated);
    socket.on("task:deleted", onTaskDeleted);

    return () => {
      socket.off("task:created", onTaskCreated);
      socket.off("task:updated", onTaskUpdated);
      socket.off("task:deleted", onTaskDeleted);
      socket.emit("project:leave", projectId);
    };
  }, [socket, projectId, setTasks, addToast]);
}
