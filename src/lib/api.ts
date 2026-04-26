import { Priority, Task, TaskStatus, User } from "@/types/task";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.message || "Request failed");
  }

  return response.json();
}

export const api = {
  login: (payload: { email: string; password: string; role: string }) =>
    request<User>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getUsers: () => request<User[]>("/users"),
  getTasks: () => request<Task[]>("/tasks"),
  createTask: (task: Task) =>
    request<Task>("/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    }),
  deleteTask: (taskId: string) =>
    request<void>(`/tasks/${taskId}`, {
      method: "DELETE",
    }),
  updateTaskStatus: (taskId: string, payload: { status: TaskStatus; userId: string; userName: string }) =>
    request<Task>(`/tasks/${taskId}/status`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  addComment: (taskId: string, payload: { userId: string; userName: string; content: string }) =>
    request<Task>(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  addSubTask: (
    taskId: string,
    payload: {
      title: string;
      description: string;
      assignedTo: string;
      assignedToName: string;
      priority: Priority;
      deadline: string;
      createdBy: string;
      createdByName: string;
      comments: [];
      files: [];
      logs: { id: string; userId: string; userName: string; action: string; timestamp: string }[];
      status: "pending";
      createdAt: string;
    }
  ) =>
    request<Task>(`/tasks/${taskId}/subtasks`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  addFile: (taskId: string, payload: { name: string; size: number; uploadedBy: string; userId: string }) =>
    request<Task>(`/tasks/${taskId}/files`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
