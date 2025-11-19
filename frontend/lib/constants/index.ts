import { TaskStatus } from "../types";

export const TASKS_QUERY_KEY = ["tasks"];
export const USERS_QUERY_KEY = ["users"];

export const STATUS_COLORS: Record<TaskStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};
