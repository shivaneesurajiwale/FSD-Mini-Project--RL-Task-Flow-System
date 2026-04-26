import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/AppContext";
import { Task, Priority } from "@/types/task";
import { pillarUsers, facultyUsers } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const CreateTask = () => {
  const { setTasks } = useAppContext();
  const navigate = useNavigate();

  const [workspaceName, setWorkspaceName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeType, setAssigneeType] = useState<"pillar" | "faculty">("pillar");
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [priority, setPriority] = useState<Priority>("medium");
  const [deadline, setDeadline] = useState("");

  const assigneeList = assigneeType === "pillar" ? pillarUsers : facultyUsers;

  const toggleAssignee = (id: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName || !title || !deadline || selectedAssignees.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      workspaceName,
      title,
      description,
      assignedTo: selectedAssignees,
      assignedToNames: selectedAssignees.map(
        (id) => assigneeList.find((u) => u.id === id)?.name || ""
      ),
      assigneeType,
      priority,
      status: "pending",
      deadline: new Date(deadline).toISOString(),
      createdBy: "hod-1",
      comments: [],
      files: [],
      logs: [
        {
          id: `log-${Date.now()}`,
          userId: "hod-1",
          userName: "Dr. Sharma",
          action: "Created task",
          timestamp: new Date().toISOString(),
        },
      ],
      subTasks: [],
      createdAt: new Date().toISOString(),
    };

    setTasks((prev) => [...prev, newTask]);
    toast.success("Task created successfully!");
    navigate("/tasks");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground mb-6">Create New Task</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div>
            <Label>Workspace Name *</Label>
            <Input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} placeholder="e.g., Accreditation Prep" className="mt-1" />
          </div>
          <div>
            <Label>Task Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Prepare NBA Documents" className="mt-1" />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the task..." rows={4} className="mt-1" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div>
            <Label>Assign To</Label>
            <Select value={assigneeType} onValueChange={(v: "pillar" | "faculty") => { setAssigneeType(v); setSelectedAssignees([]); }}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pillar">Pillars</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            {assigneeList.map((user) => (
              <label key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                <Checkbox checked={selectedAssignees.includes(user.id)} onCheckedChange={() => toggleAssignee(user.id)} />
                <span className="text-sm text-foreground">{user.name}</span>
                {user.pillarName && <span className="text-xs text-muted-foreground">({user.pillarName})</span>}
              </label>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority *</Label>
              <Select value={priority} onValueChange={(v: Priority) => setPriority(v)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Deadline *</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1">Create Task</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/tasks")}>Cancel</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateTask;
