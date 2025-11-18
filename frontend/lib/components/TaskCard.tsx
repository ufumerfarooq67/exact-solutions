"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import { Button } from "@/lib/components/ui/button";
import { Avatar, AvatarFallback } from "@/lib/components/ui/avatar";
import { Calendar, Edit, Trash2, User } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/contexts/AuthContext";
import { toTitleCase } from "../lib/utils";

interface TaskCardProps {
  task: any;
  assignee?: any;
  creator?: any;
  onEdit?: () => void;
  onDelete?: () => void;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
};

const priorityColors = {
  low: "border-green-300 dark:border-green-700",
  medium: "border-yellow-300 dark:border-yellow-700",
  high: "border-red-300 dark:border-red-700",
};

export function TaskCard({ task, assignee, creator, onEdit, onDelete }: TaskCardProps) {
  const { user, isAdmin } = useAuth();
  const canModify = isAdmin || user?.id === creator.id || user?.id === assignee.id;

  return (
    <Card className="hover-elevate" data-testid={`card-task-${task.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-2">
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <h3 className="font-medium text-base truncate" data-testid={`text-task-title-${task.id}`}>
            {task.title}
          </h3>
        </div>
        <Badge className={`${statusColors[task.status]} shrink-0`} data-testid={`badge-status-${task.id}`}>
          {toTitleCase(task.status.replace("_", " "))}
        </Badge>
      </CardHeader>
      <CardContent className="pb-2">
        {task.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{task.description}</p>}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          {assignee && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">{assignee.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span data-testid={`text-assignee-${task.id}`}>{assignee.name}</span>
            </div>
          )}
          {!assignee && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Unassigned</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between gap-2 pt-4">
        <div className="flex items-center gap-2"></div>
        {canModify && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <Button onClick={onEdit} data-testid={`button-edit-${task.id}`}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button onClick={onDelete} data-testid={`button-delete-${task.id}`}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
