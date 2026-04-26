import React, { createContext, useContext, useState } from "react";
import { UserRole, Task, User } from "@/types/task";
import { initialTasks, users } from "@/data/mockData";

interface AppContextType {
  currentRole: UserRole | null;
  currentUser: User | null;
  setCurrentRole: (role: UserRole | null) => void;
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  users: User[];
}

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRoleState] = useState<UserRole | null>(null);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const currentUser = currentRole
    ? users.find((u) => u.role === currentRole) || null
    : null;

  const setCurrentRole = (role: UserRole | null) => {
    setCurrentRoleState(role);
  };

  return (
    <AppContext.Provider value={{ currentRole, currentUser, setCurrentRole, tasks, setTasks, users }}>
      {children}
    </AppContext.Provider>
  );
};
