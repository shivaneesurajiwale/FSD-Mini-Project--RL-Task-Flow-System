import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["hod", "pillar", "faculty"], required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: String,
    pillarName: String,
  },
  { versionKey: false }
);

const commentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: String, required: true },
  },
  { _id: false }
);

const fileSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: Number, required: true },
    uploadedBy: { type: String, required: true },
    uploadedAt: { type: String, required: true },
  },
  { _id: false }
);

const logSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    action: { type: String, required: true },
    timestamp: { type: String, required: true },
  },
  { _id: false }
);

const taskCompletionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    completedAt: { type: String, required: true },
  },
  { _id: false }
);

const subTaskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    parentTaskId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    assignedTo: { type: String, required: true },
    assignedToName: { type: String, required: true },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], required: true },
    status: { type: String, enum: ["pending", "in-progress", "completed", "overdue"], required: true },
    deadline: { type: String, required: true },
    createdBy: { type: String, required: true },
    comments: { type: [commentSchema], default: [] },
    files: { type: [fileSchema], default: [] },
    logs: { type: [logSchema], default: [] },
    createdAt: { type: String, required: true },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    workspaceName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    assignedTo: { type: [String], default: [] },
    assignedToNames: { type: [String], default: [] },
    assigneeType: { type: String, enum: ["pillar", "faculty"], required: true },
    priority: { type: String, enum: ["low", "medium", "high", "critical"], required: true },
    status: { type: String, enum: ["pending", "in-progress", "completed", "overdue"], required: true },
    deadline: { type: String, required: true },
    createdBy: { type: String, required: true },
    comments: { type: [commentSchema], default: [] },
    files: { type: [fileSchema], default: [] },
    logs: { type: [logSchema], default: [] },
    completedByUsers: { type: [taskCompletionSchema], default: [] },
    subTasks: { type: [subTaskSchema], default: [] },
    createdAt: { type: String, required: true },
  },
  { versionKey: false }
);

export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);
export const TaskModel = mongoose.models.Task || mongoose.model("Task", taskSchema);
