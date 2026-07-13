import { useEffect } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useNotif } from "../contexts/NotifContext";

export function useRealTimeProjectTasks(projectId, setTasks) {
  const { socket } = useSocket();
  const { addToast } = useNotif();

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
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
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
