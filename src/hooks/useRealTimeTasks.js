import { useEffect, useRef } from "react";
import { useSocket } from "../contexts/SocketContext";
import { useNotif } from "../contexts/NotifContext";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook ini mendaftarkan listener Socket.IO untuk event task.
 * tasks → state saat ini
 * setTasks → setter untuk update state
 */
export function useRealTimeTasks(setTasks) {
  const { socket } = useSocket();
  const { addToast } = useNotif();
  const { user } = useAuth();
  
  const notifiedTasks = useRef(new Set());

  useEffect(() => {
    if (!socket) return;

    // ── task:created ────────────────────────────────────
    const onTaskCreated = ({ task }) => {
      setTasks((prev) => {
        const exists = prev.some((t) => t.id === task.id);
        if (exists) return prev;
        return [task, ...prev];
      });

      if (user && task.userId !== user.id && !notifiedTasks.current.has(task.id)) {
        notifiedTasks.current.add(task.id);
        addToast({
          type: "INFO",
          title: "Task Baru",
          message: `Task baru ditambahkan: "${task.title}"`,
        });
      }
    };

    // ── task:updated ────────────────────────────────────
    const onTaskUpdated = ({ task }) => {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? task : t)));
      addToast({
        type: "INFO",
        title: "Task Diperbarui",
        message: `"${task.title}" telah diperbarui oleh pengguna lain.`,
      });
    };

    // ── task:deleted ────────────────────────────────────
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
          message: `Sebuah task telah dihapus.`,
        });
      }
    };

    // ── notification ─────────────────────────────────────
    const onNotification = (notif) => {
      addToast(notif);
    };

    // Daftarkan semua listener
    socket.on("task:created", onTaskCreated);
    socket.on("task:updated", onTaskUpdated);
    socket.on("task:deleted", onTaskDeleted);
    socket.on("notification", onNotification);

    // Cleanup: hapus listener saat unmount
    return () => {
      socket.off("task:created", onTaskCreated);
      socket.off("task:updated", onTaskUpdated);
      socket.off("task:deleted", onTaskDeleted);
      socket.off("notification", onNotification);
    };
  }, [socket, setTasks, addToast]);
}
