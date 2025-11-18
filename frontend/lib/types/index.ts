export type UserRole = "user" | "admin" | "manager"; // adjust if you have more
export type TaskStatus = "pending" | "in-progress" | "completed" | "cancelled";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type EventType =
  | "task.created"
  | "task.updated"
  | "task.assigned"
  | "task.status_changed"
  | "task.deleted"
  | "user.login"
  | "user.logout"; // extend as needed


// types/tasks.ts
export interface Task {
  id: number;
  title: string;
  description?: string;
  assignedTo?: string; // or user object
  createdBy?: string;  // or user object
  status?: string;
  createdAt: string;
  updatedAt: string;
}


// types/users.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
