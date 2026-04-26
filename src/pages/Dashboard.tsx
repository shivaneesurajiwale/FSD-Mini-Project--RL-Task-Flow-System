import { Task, SubTask, TaskStatus, Priority } from "@/types/task";
import { useAppContext } from "@/context/AppContext";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertTriangle, ListTodo, Filter, CalendarDays, BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors: Record<TaskStatus, string> = {
  completed: "hsl(142, 71%, 45%)",
  "in-progress": "hsl(221, 83%, 53%)",
  pending: "hsl(38, 92%, 50%)",
  overdue: "hsl(0, 84%, 60%)",
};

const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const Dashboard = () => {
  const { tasks, currentRole, currentUser } = useAppContext();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [view, setView] = useState<"charts" | "calendar">("charts");

  const relevantTasks = useMemo(() => {
    if (currentRole === "hod") return tasks;
    if (currentRole === "pillar") return tasks.filter((t) => t.assignedTo.includes(currentUser?.id || ""));
    // faculty sees tasks assigned to them + subtasks
    return tasks.filter(
      (t) => t.assignedTo.includes(currentUser?.id || "") || t.subTasks.some((s) => s.assignedTo === currentUser?.id)
    );
  }, [tasks, currentRole, currentUser]);

  const allSubTasks = useMemo(() => {
    if (currentRole === "faculty") {
      return tasks.flatMap((t) => t.subTasks.filter((s) => s.assignedTo === currentUser?.id));
    }
    return relevantTasks.flatMap((t) => t.subTasks);
  }, [relevantTasks, currentRole, currentUser, tasks]);

  const allItems = useMemo(() => {
    const items = [
      ...relevantTasks.map((t) => ({ ...t, type: "task" as const })),
      ...allSubTasks.map((s) => ({ ...s, type: "subtask" as const })),
    ];
    return items;
  }, [relevantTasks, allSubTasks]);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      if (filterPriority !== "all" && item.priority !== filterPriority) return false;
      return true;
    });
  }, [allItems, filterStatus, filterPriority]);

  const stats = useMemo(() => {
    const total = allItems.length;
    const completed = allItems.filter((i) => i.status === "completed").length;
    const pending = allItems.filter((i) => i.status === "pending").length;
    const inProgress = allItems.filter((i) => i.status === "in-progress").length;
    const overdue = allItems.filter((i) => i.status === "overdue").length;
    return { total, completed, pending, inProgress, overdue };
  }, [allItems]);

  const pieData = [
    { name: "Completed", value: stats.completed, color: statusColors.completed },
    { name: "In Progress", value: stats.inProgress, color: statusColors["in-progress"] },
    { name: "Pending", value: stats.pending, color: statusColors.pending },
    { name: "Overdue", value: stats.overdue, color: statusColors.overdue },
  ].filter((d) => d.value > 0);

  const barData = [
    { name: "Critical", count: allItems.filter((i) => i.priority === "critical").length },
    { name: "High", count: allItems.filter((i) => i.priority === "high").length },
    { name: "Medium", count: allItems.filter((i) => i.priority === "medium").length },
    { name: "Low", count: allItems.filter((i) => i.priority === "low").length },
  ];

  // Calendar
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const getDeadlineColor = (item: { status: TaskStatus; deadline: string }) => {
    const dl = new Date(item.deadline);
    if (item.status === "completed" && dl >= new Date()) return "bg-success/20 text-success border-success/30";
    if (item.status === "completed") return "bg-success/20 text-success border-success/30";
    const daysLeft = Math.ceil((dl.getTime() - today.getTime()) / 86400000);
    if (daysLeft < 0) return "bg-danger/20 text-danger border-danger/30";
    if (daysLeft <= 3) return "bg-warning/20 text-warning border-warning/30";
    return "bg-primary/10 text-primary border-primary/20";
  };

  const calendarDays = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return dayNum;
  });

  const getTasksForDay = (day: number) => {
    return allItems.filter((item) => {
      const dl = new Date(item.deadline);
      return dl.getDate() === day && dl.getMonth() === currentMonth && dl.getFullYear() === currentYear;
    });
  };

  const scoreCards = [
    { label: "Total Tasks", value: stats.total, icon: ListTodo, color: "text-primary bg-primary/10" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, color: "text-success bg-success/10" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-warning bg-warning/10" },
    { label: "Overdue", value: stats.overdue, icon: AlertTriangle, color: "text-danger bg-danger/10" },
  ];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant={view === "charts" ? "default" : "outline"} size="sm" onClick={() => setView("charts")}>
            <BarChart3 className="w-4 h-4 mr-1" /> Charts
          </Button>
          <Button variant={view === "calendar" ? "default" : "outline"} size="sm" onClick={() => setView("calendar")}>
            <CalendarDays className="w-4 h-4 mr-1" /> Calendar
          </Button>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {scoreCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-5"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {view === "charts" ? (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Status Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={55} dataKey="value" paddingAngle={3} strokeWidth={0}>
                    {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Priority Breakdown</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(221, 83%, 53%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filters & Task List */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              {filteredItems.length === 0 && (
                <p className="text-muted-foreground text-sm py-8 text-center">No tasks match the selected filters.</p>
              )}
              {filteredItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`status-dot ${item.status === "completed" ? "bg-success" : item.status === "overdue" ? "bg-danger" : item.status === "in-progress" ? "bg-primary" : "bg-warning"}`} />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">Due: {new Date(item.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={item.priority === "critical" ? "destructive" : item.priority === "high" ? "default" : "secondary"} className="text-xs">
                      {item.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">{item.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Calendar View */
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="font-semibold text-foreground mb-4">
            {new Date(currentYear, currentMonth).toLocaleString("default", { month: "long", year: "numeric" })}
          </h3>
          <div className="grid grid-cols-7 gap-1">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="text-xs font-medium text-muted-foreground text-center py-2">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              if (!day) return <div key={i} className="p-2 min-h-[80px]" />;
              const dayTasks = getTasksForDay(day);
              const isToday = day === today.getDate();
              return (
                <div key={i} className={`p-1.5 min-h-[80px] rounded-lg border ${isToday ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50"}`}>
                  <span className={`text-xs font-medium ${isToday ? "text-primary" : "text-foreground"}`}>{day}</span>
                  <div className="mt-1 space-y-0.5">
                    {dayTasks.slice(0, 2).map((task) => (
                      <div key={task.id} className={`text-[10px] px-1 py-0.5 rounded border truncate ${getDeadlineColor(task)}`}>
                        {task.title}
                      </div>
                    ))}
                    {dayTasks.length > 2 && (
                      <span className="text-[10px] text-muted-foreground">+{dayTasks.length - 2} more</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
