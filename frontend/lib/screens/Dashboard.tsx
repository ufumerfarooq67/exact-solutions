"use client"


import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Skeleton } from '@/lib/components/ui/skeleton';
import { ListTodo, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { apiRequest } from '../lib/queryClient';
import { Task } from '../types';
import { TASKS_QUERY_KEY } from '../constants';


export default function Dashboard() {
    const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
      queryKey: TASKS_QUERY_KEY,
      queryFn: () => apiRequest<Task[]>("GET", `${process.env.NEXT_PUBLIC_SERVER_URL}/v1/tasks`),
    });
  
  const stats = {
    total: tasks?.length || 0,
    pending: tasks?.filter((t) => t.status === 'pending').length || 0,
    inProgress: tasks?.filter((t) => t.status === 'in_progress').length || 0,
    completed: tasks?.filter((t) => t.status === 'completed').length || 0,
  };

  const statCards = [
    {
      title: 'Total Tasks',
      value: stats.total,
      icon: ListTodo,
      color: 'text-primary',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: AlertCircle,
      color: 'text-yellow-600 dark:text-yellow-500',
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-500',
    },
    {
      title: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-500',
    },
  ];

  if (tasksLoading) {
    return (
      <div className="space-y-8">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your task management activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  {stat.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {tasks && tasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ListTodo className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Get started by creating your first task. Navigate to "My Tasks" to begin.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
