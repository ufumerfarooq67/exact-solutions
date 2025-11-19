"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/lib/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/lib/components/ui/dialog";
import { TaskCard } from "@/lib/components/task-card";
import { TaskForm } from "@/lib/components/task-form";
import { Skeleton } from "@/lib/components/ui/skeleton";
import { useToast } from "@/lib/hooks/use-toast";
import { apiRequest } from "@/lib/utils/queryClient";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/lib/components/ui/alert-dialog";
import { ITask, IUser } from "../types";
import { TASKS_QUERY_KEY } from "../constants";

export default function Tasks() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const { data: tasks, isLoading: tasksLoading } = useQuery<ITask[]>({
    queryKey: TASKS_QUERY_KEY,
    queryFn: () => apiRequest<ITask[]>("GET", `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/tasks`),
  });

  const { data: users } = useQuery<IUser[]>({
    queryKey: ["users"],
    queryFn: () => apiRequest<IUser[]>("GET", `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/users`),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/tasks`, data),
    onSuccess: () => {
      setIsCreateOpen(false);
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create task.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<any> }) =>
      apiRequest("PATCH", `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/tasks/${id}`, data),
    onSuccess: () => {
      setEditingTask(null);
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/tasks/${id}`),
    onSuccess: () => {
      setDeletingTaskId(null);
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully.",
      });
    },
    onError: (err) => {
      console.log({ err });
      toast({
        title: "Error",
        description: "Failed to delete task.",
        variant: "destructive",
      });
    },
  });

  if (tasksLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
            My Tasks
          </h1>
          <p className="text-muted-foreground">Manage and track all your tasks</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-task">
              <Plus className="mr-2 h-4 w-4" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <TaskForm
              users={users}
              onSubmit={(data) => createMutation.mutate(data)}
              onCancel={() => setIsCreateOpen(false)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {tasks && tasks.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground mb-4">No tasks yet. Create your first task to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks?.map((task) => {
            return (
              <TaskCard
                key={task.id}
                task={task}
                assignee={task.assignedTo}
                creator={task.createdBy}
                onEdit={() => setEditingTask(task)}
                onDelete={() => setDeletingTaskId(task.id)}
              />
            );
          })}
        </div>
      )}

      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm
              task={editingTask}
              users={users}
              onSubmit={(data) => updateMutation.mutate({ id: editingTask.id, data })}
              onCancel={() => setEditingTask(null)}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingTaskId} onOpenChange={(open) => !open && setDeletingTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this task? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingTaskId && deleteMutation.mutate(deletingTaskId)} data-testid="button-confirm-delete">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
