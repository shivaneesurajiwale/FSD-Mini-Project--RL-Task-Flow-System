export type UserRole = "hod" | "pillar" | "faculty";

export type TaskStatus = "pending" | "in-progress" | "completed" | "overdue";
export type Priority = "low" | "medium" | "high" | "critical";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  pillarName?: string; // for pillar users
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface ModificationLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
}

export interface SubTask {
  id: string;
  parentTaskId: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName: string;
  priority: Priority;
  status: TaskStatus;
  deadline: string;
  createdBy: string;
  comments: Comment[];
  files: FileAttachment[];
  logs: ModificationLog[];
  createdAt: string;
}

export interface Task {
  id: string;
  workspaceName: string;
  title: string;
  description: string;
  assignedTo: string[];
  assignedToNames: string[];
  assigneeType: "pillar" | "faculty";
  priority: Priority;
  status: TaskStatus;
  deadline: string;
  createdBy: string;
  comments: Comment[];
  files: FileAttachment[];
  logs: ModificationLog[];
  subTasks: SubTask[];
  createdAt: string;
}
