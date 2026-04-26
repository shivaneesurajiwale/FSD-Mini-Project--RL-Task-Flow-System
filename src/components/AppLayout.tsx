import { useAppContext } from "@/context/AppContext";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, ListTodo, LogOut, ChevronLeft, Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { currentRole, currentUser, setCurrentRole } = useAppContext();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ...(currentRole === "hod"
      ? [{ to: "/create-task", label: "Create Task", icon: PlusCircle }]
      : []),
    { to: "/tasks", label: "Tasks", icon: ListTodo },
  ];

  const roleLabels = { hod: "HOD", pillar: "Pillar Head", faculty: "Faculty" };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-64"
      )}>
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          {!collapsed && <span className="font-bold text-lg tracking-tight">TaskFlow</span>}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-md hover:bg-sidebar-border transition-colors">
            {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <p className="text-xs text-sidebar-foreground/50 uppercase tracking-wider">Logged in as</p>
            <p className="font-medium text-sm mt-1">{currentUser?.name}</p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-sidebar-accent/20 text-sidebar-accent mt-1 inline-block">
              {roleLabels[currentRole!]}
            </span>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-border"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          <button
            onClick={() => setCurrentRole(null)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-border transition-colors w-full"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Switch Role</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
