import { Task, TaskStatus } from "@/types/task";

export const getTaskDisplayStatus = (task: Task): TaskStatus => {
  const completedByUsers = task.completedByUsers || [];

  if (task.assigneeType === "faculty" && completedByUsers.length > 0 && completedByUsers.length < task.assignedTo.length) {
    return "in-progress";
  }

  return task.status;
};

export const getTaskCompletionNote = (task: Task): string | null => {
  const completedByUsers = task.completedByUsers || [];

  if (task.assigneeType !== "faculty" || completedByUsers.length === 0) {
    return null;
  }

  const names = completedByUsers.map((entry) => entry.userName);

  if (completedByUsers.length < task.assignedTo.length) {
    return `Completed by ${names.join(", ")}`;
  }

  return `Completed by ${names.join(", ")}`;
};
