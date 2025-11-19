"use client";

import { Home, ListTodo, Users, UserCircle, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/lib/components/ui/sidebar";
import { useAuth } from "@/lib/contexts/auth-context";
import { Button } from "@/lib/components/ui/button";
import { Avatar, AvatarFallback } from "@/lib/components/ui/avatar";
import { Separator } from "@/lib/components/ui/separator";
import { usePathname, useRouter } from "next/navigation";

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname()
  const { user, isAdmin, logout } = useAuth();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      show: true,
    },
    {
      title: "My Tasks",
      url: "/tasks",
      icon: ListTodo,
      show: true,
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
      show: isAdmin,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: UserCircle,
      show: true,
    },
  ];

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold px-4 py-6">TaskFlow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter((item) => item.show)
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <a
                        href={item.url}
                        onClick={(e) => {
                          e.preventDefault();
                          router.push(item.url);
                        }}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Separator className="mb-4" />
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="text-sm">{user?.name?.substring(0, 2)?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" data-testid="text-name">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground">{isAdmin ? "Admin" : "User"}</p>
          </div>
        </div>
        <Button
          // variant="outline"
          // size="sm"
          className="w-full"
          onClick={handleLogout}
          data-testid="button-logout"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
