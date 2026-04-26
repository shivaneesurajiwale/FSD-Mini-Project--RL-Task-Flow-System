import { useAppContext } from "@/context/AppContext";
import { UserRole } from "@/types/task";
import { motion } from "framer-motion";
import { Crown, Columns3, GraduationCap } from "lucide-react";

const roles: { role: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
  { role: "hod", label: "HOD Portal", description: "Create tasks, manage workspaces, view department dashboard", icon: <Crown className="w-8 h-8" /> },
  { role: "pillar", label: "Pillar Portal", description: "View assigned tasks, delegate sub-tasks to faculty", icon: <Columns3 className="w-8 h-8" /> },
  { role: "faculty", label: "Faculty Portal", description: "View tasks & sub-tasks, update progress, submit work", icon: <GraduationCap className="w-8 h-8" /> },
];

const RoleSelect = () => {
  const { setCurrentRole } = useAppContext();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-4xl w-full">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">Department Task Manager</h1>
          <p className="text-muted-foreground text-lg">Select your role to continue</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {roles.map((r, i) => (
            <motion.button
              key={r.role}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setCurrentRole(r.role)}
              className="group p-8 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 text-left"
            >
              <div className="w-14 h-14 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                {r.icon}
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">{r.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{r.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RoleSelect;
