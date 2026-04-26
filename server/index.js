import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { TaskModel, UserModel } from "./models.js";
import { tasks as seedTasks, users as seedUsers } from "./seedData.js";

const app = express();
const PORT = Number(process.env.PORT || 5000);
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/department-taskflow";

app.use(cors());
app.use(express.json());

const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function seedDatabase() {
  const [userCount, taskCount] = await Promise.all([UserModel.countDocuments(), TaskModel.countDocuments()]);

  if (userCount === 0) {
    await UserModel.insertMany(seedUsers);
  }

  if (taskCount === 0) {
    await TaskModel.insertMany(seedTasks);
  }
}

async function start() {
  await mongoose.connect(MONGODB_URI);
  await seedDatabase();

  app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/users", async (_req, res) => {
  const users = await UserModel.find().sort({ role: 1, name: 1 }).lean();
  res.json(users.map(({ _id, password, ...user }) => user));
});

app.post("/api/auth/login", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const role = String(req.body.role || "");

  const user = await UserModel.findOne({ email, password, role }).lean();

  if (!user) {
    return res.status(401).json({ message: "Invalid email, password, or role" });
  }

  const { _id, password: _password, ...safeUser } = user;
  res.json(safeUser);
});

app.get("/api/tasks", async (_req, res) => {
  const tasks = await TaskModel.find().sort({ createdAt: -1 }).lean();
  res.json(tasks.map(({ _id, ...task }) => task));
});

app.post("/api/tasks", async (req, res) => {
  const task = await TaskModel.create({
    ...req.body,
    id: req.body.id || makeId("task"),
    completedByUsers: req.body.completedByUsers || [],
  });
  const { _id, ...createdTask } = task.toObject();
  res.status(201).json(createdTask);
});

app.patch("/api/tasks/:taskId/status", async (req, res) => {
  const { taskId } = req.params;
  const { status, userId, userName } = req.body;
  const timestamp = new Date().toISOString();
  const task = await TaskModel.findOne({ id: taskId });

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  let nextStatus = status;
  let nextCompletedByUsers = [...(task.completedByUsers || [])];
  const isMultiFacultyTask = task.assigneeType === "faculty" && task.assignedTo.includes(userId) && task.assignedTo.length > 1;

  if (isMultiFacultyTask) {
    nextCompletedByUsers = nextCompletedByUsers.filter((entry) => entry.userId !== userId);

    if (status === "completed") {
      nextCompletedByUsers.push({
        userId,
        userName,
        completedAt: timestamp,
      });
    }

    if (nextCompletedByUsers.length === 0) {
      nextStatus = status === "completed" ? "pending" : status;
    } else if (nextCompletedByUsers.length < task.assignedTo.length) {
      nextStatus = "in-progress";
    } else {
      nextStatus = "completed";
    }
  } else if (status !== "completed") {
    nextCompletedByUsers = [];
  } else if (task.assigneeType === "faculty" && task.assignedTo.includes(userId)) {
    nextCompletedByUsers = [
      {
        userId,
        userName,
        completedAt: timestamp,
      },
    ];
  }

  task.status = nextStatus;
  task.completedByUsers = nextCompletedByUsers;
  task.logs.push({
    id: makeId("log"),
    userId,
    userName,
    action:
      isMultiFacultyTask && status === "completed" && nextStatus === "in-progress"
        ? `Completed part of task (${nextCompletedByUsers.length}/${task.assignedTo.length})`
        : `Changed status to ${nextStatus}`,
    timestamp,
  });

  await task.save();
  const updatedTask = task.toObject();

  if (!updatedTask) {
    return res.status(404).json({ message: "Task not found" });
  }

  const { _id, ...taskResponse } = updatedTask;
  res.json(taskResponse);
});

app.delete("/api/tasks/:taskId", async (req, res) => {
  const deletedTask = await TaskModel.findOneAndDelete({ id: req.params.taskId }).lean();

  if (!deletedTask) {
    return res.status(404).json({ message: "Task not found" });
  }

  res.status(204).send();
});

app.post("/api/tasks/:taskId/comments", async (req, res) => {
  const { taskId } = req.params;
  const comment = {
    id: makeId("comment"),
    userId: req.body.userId,
    userName: req.body.userName,
    content: req.body.content,
    createdAt: new Date().toISOString(),
  };

  const updatedTask = await TaskModel.findOneAndUpdate(
    { id: taskId },
    {
      $push: {
        comments: comment,
        logs: {
          id: makeId("log"),
          userId: req.body.userId,
          userName: req.body.userName,
          action: "Added a comment",
          timestamp: comment.createdAt,
        },
      },
    },
    { new: true }
  ).lean();

  if (!updatedTask) {
    return res.status(404).json({ message: "Task not found" });
  }

  const { _id, ...task } = updatedTask;
  res.json(task);
});

app.post("/api/tasks/:taskId/subtasks", async (req, res) => {
  const { taskId } = req.params;
  const subTask = {
    ...req.body,
    id: req.body.id || makeId("sub"),
    parentTaskId: taskId,
  };

  const updatedTask = await TaskModel.findOneAndUpdate(
    { id: taskId },
    {
      $push: {
        subTasks: subTask,
        logs: {
          id: makeId("log"),
          userId: req.body.createdBy,
          userName: req.body.createdByName,
          action: `Created sub-task: ${req.body.title}`,
          timestamp: subTask.createdAt,
        },
      },
    },
    { new: true }
  ).lean();

  if (!updatedTask) {
    return res.status(404).json({ message: "Task not found" });
  }

  const { _id, ...task } = updatedTask;
  res.json(task);
});

app.post("/api/tasks/:taskId/files", async (req, res) => {
  const { taskId } = req.params;
  const attachment = {
    id: makeId("file"),
    name: req.body.name,
    size: req.body.size,
    uploadedBy: req.body.uploadedBy,
    uploadedAt: new Date().toISOString(),
  };

  const updatedTask = await TaskModel.findOneAndUpdate(
    { id: taskId },
    {
      $push: {
        files: attachment,
        logs: {
          id: makeId("log"),
          userId: req.body.userId,
          userName: req.body.uploadedBy,
          action: `Uploaded file: ${req.body.name}`,
          timestamp: attachment.uploadedAt,
        },
      },
    },
    { new: true }
  ).lean();

  if (!updatedTask) {
    return res.status(404).json({ message: "Task not found" });
  }

  const { _id, ...task } = updatedTask;
  res.json(task);
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || "Internal server error" });
});

start().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
