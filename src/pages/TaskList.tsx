import { useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { Task, TaskStatus, Priority, Comment, SubTask } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { facultyUsers } from "@/data/mockData";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { MessageSquare, Paperclip, History, Plus, ChevronRight, Calendar, Flag, User } from "lucide-react";

const statusBadgeClass: Record<TaskStatus, string> = {
  completed: "bg-success/10 text-success border-success/20",
  "in-progress": "bg-primary/10 text-primary border-primary/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  overdue: "bg-danger/10 text-danger border-danger/20",
};

const priorityBadgeClass: Record<Priority, string> = {
  critical: "bg-danger/10 text-danger",
  high: "bg-warning/10 text-warning",
  medium: "bg-primary/10 text-primary",
  low: "bg-muted text-muted-foreground",
};

const TaskList = () => {
  const { tasks, setTasks, currentRole, currentUser } = useAppContext();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showSubTaskForm, setShowSubTaskForm] = useState(false);
  const [commentText, setCommentText] = useState("");

  // Sub-task form
  const [subTitle, setSubTitle] = useState("");
  const [subDesc, setSubDesc] = useState("");
  const [subAssignee, setSubAssignee] = useState("");
  const [subPriority, setSubPriority] = useState<Priority>("medium");
  const [subDeadline, setSubDeadline] = useState("");

  const filteredTasks = (() => {
    if (currentRole === "hod") return tasks;
    if (currentRole === "pillar") return tasks.filter((t) => t.assignedTo.includes(currentUser?.id || ""));
    return tasks.filter(
      (t) => t.assignedTo.includes(currentUser?.id || "") || t.subTasks.some((s) => s.assignedTo === currentUser?.id)
    );
  })();

  const addComment = (taskId: string) => {
    if (!commentText.trim()) return;
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: currentUser?.id || "",
      userName: currentUser?.name || "",
      content: commentText,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              comments: [...t.comments, comment],
              logs: [...t.logs, { id: `log-${Date.now()}`, userId: currentUser?.id || "", userName: currentUser?.name || "", action: "Added a comment", timestamp: new Date().toISOString() }],
            }
          : t
      )
    );
    setCommentText("");
    setSelectedTask((prev) => prev ? { ...prev, comments: [...prev.comments, comment] } : prev);
    toast.success("Comment added");
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              logs: [...t.logs, { id: `log-${Date.now()}`, userId: currentUser?.id || "", userName: currentUser?.name || "", action: `Changed status to ${status}`, timestamp: new Date().toISOString() }],
            }
          : t
      )
    );
    setSelectedTask((prev) => prev ? { ...prev, status } : prev);
    toast.success(`Status updated to ${status}`);
  };

  const addSubTask = (taskId: string) => {
    if (!subTitle || !subAssignee || !subDeadline) {
      toast.error("Fill all required fields");
      return;
    }
    const newSub: SubTask = {
      id: `sub-${Date.now()}`,
      parentTaskId: taskId,
      title: subTitle,
      description: subDesc,
      assignedTo: subAssignee,
      assignedToName: facultyUsers.find((u) => u.id === subAssignee)?.name || "",
      priority: subPriority,
      status: "pending",
      deadline: new Date(subDeadline).toISOString(),
      createdBy: currentUser?.id || "",
      comments: [],
      files: [],
      logs: [{ id: `log-${Date.now()}`, userId: currentUser?.id || "", userName: currentUser?.name || "", action: "Created sub-task", timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, subTasks: [...t.subTasks, newSub] } : t
      )
    );
    setSelectedTask((prev) => prev ? { ...prev, subTasks: [...prev.subTasks, newSub] } : prev);
    setShowSubTaskForm(false);
    setSubTitle("");
    setSubDesc("");
    setSubAssignee("");
    setSubDeadline("");
    toast.success("Sub-task created");
  };

  const handleFileUpload = (taskId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const attachment = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: file.size,
        uploadedBy: currentUser?.name || "",
        uploadedAt: new Date().toISOString(),
      };
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? {
                ...t,
                files: [...t.files, attachment],
                logs: [...t.logs, { id: `log-${Date.now()}`, userId: currentUser?.id || "", userName: currentUser?.name || "", action: `Uploaded file: ${file.name}`, timestamp: new Date().toISOString() }],
              }
            : t
        )
      );
      setSelectedTask((prev) => prev ? { ...prev, files: [...prev.files, attachment] } : prev);
      toast.success("File attached");
    };
    input.click();
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
        <span className="text-sm text-muted-foreground">{filteredTasks.length} task(s)</span>
      </div>

      <div className="space-y-3">
        {filteredTasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedTask(task)}
            className="bg-card rounded-xl border border-border p-5 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">{task.workspaceName}</p>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{task.title}</h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(task.deadline).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><User className="w-3 h-3" />{task.assignedToNames.join(", ")}</span>
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{task.comments.length}</span>
                  {task.subTasks.length > 0 && <span>{task.subTasks.length} sub-task(s)</span>}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`text-xs px-2.5 py-1 rounded-full border ${statusBadgeClass[task.status]}`}>{task.status}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${priorityBadgeClass[task.priority]}`}>{task.priority}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Task Detail Modal */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedTask && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span>{selectedTask.workspaceName}</span>
                  <ChevronRight className="w-3 h-3" />
                  <span>{selectedTask.title}</span>
                </div>
                <DialogTitle className="text-xl">{selectedTask.title}</DialogTitle>
              </DialogHeader>

              <div className="flex flex-wrap gap-2 my-3">
                <span className={`text-xs px-2.5 py-1 rounded-full border ${statusBadgeClass[selectedTask.status]}`}>{selectedTask.status}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${priorityBadgeClass[selectedTask.priority]}`}>
                  <Flag className="w-3 h-3 inline mr-1" />{selectedTask.priority}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  Due: {new Date(selectedTask.deadline).toLocaleDateString()}
                </span>
              </div>

              <p className="text-sm text-muted-foreground">{selectedTask.description}</p>

              {/* Status change */}
              <div className="flex items-center gap-2 mt-4">
                <Label className="text-xs">Update Status:</Label>
                <Select value={selectedTask.status} onValueChange={(v: TaskStatus) => updateTaskStatus(selectedTask.id, v)}>
                  <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Tabs defaultValue="subtasks" className="mt-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="subtasks">Sub-Tasks ({selectedTask.subTasks.length})</TabsTrigger>
                  <TabsTrigger value="comments"><MessageSquare className="w-3 h-3 mr-1" />Comments</TabsTrigger>
                  <TabsTrigger value="files"><Paperclip className="w-3 h-3 mr-1" />Files</TabsTrigger>
                  <TabsTrigger value="logs"><History className="w-3 h-3 mr-1" />Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="subtasks" className="space-y-3 mt-3">
                  {currentRole === "pillar" && (
                    <Button size="sm" variant="outline" onClick={() => setShowSubTaskForm(!showSubTaskForm)}>
                      <Plus className="w-3 h-3 mr-1" /> Add Sub-Task
                    </Button>
                  )}
                  {showSubTaskForm && (
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3 border border-border">
                      <Input placeholder="Sub-task title" value={subTitle} onChange={(e) => setSubTitle(e.target.value)} />
                      <Textarea placeholder="Description" value={subDesc} onChange={(e) => setSubDesc(e.target.value)} rows={2} />
                      <div className="grid grid-cols-3 gap-3">
                        <Select value={subAssignee} onValueChange={setSubAssignee}>
                          <SelectTrigger><SelectValue placeholder="Assign to" /></SelectTrigger>
                          <SelectContent>
                            {facultyUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Select value={subPriority} onValueChange={(v: Priority) => setSubPriority(v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input type="date" value={subDeadline} onChange={(e) => setSubDeadline(e.target.value)} />
                      </div>
                      <Button size="sm" onClick={() => addSubTask(selectedTask.id)}>Create Sub-Task</Button>
                    </div>
                  )}
                  {selectedTask.subTasks.map((sub) => (
                    <div key={sub.id} className="p-3 rounded-lg border border-border bg-muted/30">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-foreground">{sub.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{sub.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">Assigned to: {sub.assignedToName} · Due: {new Date(sub.deadline).toLocaleDateString()}</p>
                        </div>
                        <div className="flex gap-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadgeClass[sub.status]}`}>{sub.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedTask.subTasks.length === 0 && !showSubTaskForm && (
                    <p className="text-sm text-muted-foreground text-center py-4">No sub-tasks yet</p>
                  )}
                </TabsContent>

                <TabsContent value="comments" className="mt-3">
                  <div className="space-y-3 max-h-48 overflow-y-auto mb-3">
                    {selectedTask.comments.map((c) => (
                      <div key={c.id} className="flex gap-3">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary shrink-0">
                          {c.userName[0]}
                        </div>
                        <div>
                          <p className="text-xs"><span className="font-medium text-foreground">{c.userName}</span> <span className="text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</span></p>
                          <p className="text-sm text-foreground mt-0.5">{c.content}</p>
                        </div>
                      </div>
                    ))}
                    {selectedTask.comments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No comments yet</p>}
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Write a comment..." value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addComment(selectedTask.id)} />
                    <Button size="sm" onClick={() => addComment(selectedTask.id)}>Send</Button>
                  </div>
                </TabsContent>

                <TabsContent value="files" className="mt-3">
                  <Button size="sm" variant="outline" className="mb-3" onClick={() => handleFileUpload(selectedTask.id)}>
                    <Paperclip className="w-3 h-3 mr-1" /> Upload File
                  </Button>
                  <div className="space-y-2">
                    {selectedTask.files.map((f) => (
                      <div key={f.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-foreground">{f.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                    {selectedTask.files.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No files attached</p>}
                  </div>
                </TabsContent>

                <TabsContent value="logs" className="mt-3">
                  <div className="space-y-2">
                    {selectedTask.logs.map((log) => (
                      <div key={log.id} className="flex items-center gap-3 text-xs py-1.5">
                        <span className="text-muted-foreground w-36 shrink-0">{new Date(log.timestamp).toLocaleString()}</span>
                        <span className="font-medium text-foreground">{log.userName}</span>
                        <span className="text-muted-foreground">{log.action}</span>
                      </div>
                    ))}
                    {selectedTask.logs.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No activity yet</p>}
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
