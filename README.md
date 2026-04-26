# Department Taskflow

A role-based task management system for academic departments, enabling HODs, Pillar Heads, and Faculty members to create, assign, track, and manage tasks efficiently.

---

## 🎯 Aim

To streamline and automate the task management workflow within academic departments by providing a centralized platform where department heads can assign tasks to pillar heads, who in turn can delegate to faculty members, with full tracking and accountability.

---

## 🎯 Objectives

1. **Role-Based Access Control** - Implement distinct roles (HOD, Pillar Head, Faculty) with appropriate permissions and views
2. **Task Creation & Assignment** - Enable hierarchical task creation and assignment from HOD → Pillar → Faculty
3. **Task Tracking** - Provide real-time status tracking (Pending, In Progress, Completed, Rejected)
4. **Progress Monitoring** - Allow HODs and Pillar Heads to monitor task progress with visual dashboards
5. **Collaboration** - Support comments and file attachments on tasks for better collaboration
6. **Activity Logging** - Maintain audit trails of all actions performed on tasks

---

## 🛠 Tech Stack

### Frontend
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn UI** - Component library
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM

### Development Tools
- **Bun** - Package manager
- **ESLint** - Code linting
- **Vitest** - Testing
- **Playwright** - E2E testing

---

## 🔄 System Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER ROLES                                     │
├─────────────────┬─────────────────────┬─────────────────────────────────────┤
│      HOD        │    Pillar Head      │            Faculty                  │
│  (Department    │   (Department       │      (Task Executor)                │
│   Head)         │   Sub-division)     │                                     │
└────────┬────────┴──────────┬──────────┴──────────────┬──────────────────────┘
         │                   │                         │
         ▼                   ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION                                      │
│  • Login with email, password, and role selection                          │
│  • Role-based redirect to appropriate dashboard                            │
└─────────────────────────────────────────────────────────────────────────────┘
         │                   │                         │
         ▼                   ▼                         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         TASK WORKFLOW                                       │
│                                                                             │
│   1. CREATE TASK                                                            │
│      ┌──────────────┐                                                      │
│      │ HOD creates  │                                                      │
│      │    task      │                                                      │
│      └──────┬───────┘                                                      │
└─────────────┼───────────────────────────────────────────────────────────────┘
              │ assigns to Pillar
              ▼
┌─────────────┼───────────────────────────────────────────────────────────────┐
│   2. ASSIGN TASK                                                            │
│      ┌──────────────┐                                                      │
│      │ Pillar Head  │                                                      │
│      │ assigns to   │                                                      │
│      │  Faculty     │                                                      │
│      └──────┬───────┘                                                      │
└─────────────┼───────────────────────────────────────────────────────────────┘
              │ works on task
              ▼
┌─────────────┼───────────────────────────────────────────────────────────────┐
│   3. WORK ON TASK                                                           │
│      ┌──────────────┐                                                      │
│      │  Faculty     │                                                      │
│      │ updates      │                                                      │
│      │ status, adds │                                                      │
│      │ comments,    │                                                      │
│      │ attachments  │                                                      │
│      └──────┬───────┘                                                      │
└─────────────┼───────────────────────────────────────────────────────────────┘
              │ submits for review
              ▼
┌─────────────┼───────────────────────────────────────────────────────────────┐
│   4. REVIEW & APPROVE                                                       │
│      ┌──────────────┐                                                      │
│      │ Pillar Head  │                                                      │
│      │ reviews &    │──────┐                                               │
│      │ approves/    │      │                                               │
│      │ rejects      │      ▼                                               │
│      └──────────────┘   ┌──────────────┐                                  │
│                         │   HOD can    │                                  │
│                         │   also       │                                  │
│                         │   review     │                                  │
│                         └──────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Task Status Flow

```
[Created] → [Assigned] → [In Progress] → [Submitted] → [Approved]
                              ↓
                          [Rejected] → [In Progress] (resubmit)
```

### Key Features by Role

| Feature | HOD | Pillar Head | Faculty |
|---------|-----|-------------|---------|
| Create Tasks | ✅ | ❌ | ❌ |
| Assign to Pillar | ✅ | ❌ | ❌ |
| Assign to Faculty | ✅ | ✅ | ❌ |
| View All Tasks | ✅ | Own Pillar | Own Tasks |
| Update Task Status | ❌ | Own Pillar | Own Tasks |
| Add Comments/Files | ✅ | ✅ | ✅ |
| View Dashboard | ✅ | ✅ | ✅ |
| Approve/Reject | ✅ | ✅ | ❌ |

---

## 🚀 Getting Started

### Prerequisites
- Node.js or Bun
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
bun install

# Start frontend (development)
bun run dev

# Start backend server
bun run server
```

### Environment Variables

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/department-taskflow
```

---

## 📁 Project Structure

```
department-taskflow/
├── server/              # Backend API
│   ├── index.js        # Express server & routes
│   ├── models.js       # Mongoose schemas
│   └── seedData.js     # Initial data
├── src/                 # Frontend React app
│   ├── components/     # UI components
│   ├── pages/          # Page components
│   ├── context/        # React context
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities
│   └── types/          # TypeScript types
└── public/             # Static assets
```

---

## 📄 License

MIT
