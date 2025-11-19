import { STATUS_COLORS } from "../constants";

export type UserRole = "user" | "admin" | "manager"; // adjust if you have more
export type TaskStatus =  "pending" | "in_progress" | "completed";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type EventType =
  | "task.created"
  | "task.updated"
  | "task.assigned"
  | "task.status_changed"
  | "task.deleted"
  | "user.login"
  | "user.logout"; // extend as needed



export interface IUser {
  id: number;
  email: string;
  password: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface ITask {
  id: number;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed"; // or string if dynamic
  assignedToId: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  assignedTo: IUser;
  createdBy: IUser;
}
