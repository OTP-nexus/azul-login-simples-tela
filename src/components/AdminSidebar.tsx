import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  Truck, 
  CreditCard, 
  MessageSquare, 
  Settings,
  Shield,
  BarChart3,
  Menu,
  DollarSign
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const adminItems = [
  {
    group: "Dashboard",
    items: [
      { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
    ]
  },
  {
    group: "Usuários",
    items: [
      { title: "Usuários", url: "/admin/users", icon: Users },
      { title: "Documentos", url: "/admin/documents", icon: FileCheck },
    ]
  },
  {
    group: "Operações",
    items: [
      { title: "Fretes", url: "/admin/freights", icon: Truck },
      { title: "Assinaturas", url: "/admin/subscriptions", icon: CreditCard },
      { title: "Pagamentos", url: "/admin/payments", icon: DollarSign },
    ]
  },
  {
    group: "Suporte",
    items: [
      { title: "Tickets", url: "/admin/support", icon: MessageSquare },
    ]
  },
  {
    group: "Relatórios",
    items: [
      { title: "Relatórios", url: "/admin/reports", icon: BarChart3 },
    ]
  },
  {
    group: "Configurações",
    items: [
      { title: "Sistema", url: "/admin/settings", icon: Settings },
    ]
  }
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/admin") {
      return currentPath === "/admin";
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) =>
    isActive(path) ? "bg-primary text-primary-foreground" : "hover:bg-accent";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"}>
      <SidebarContent>
        {adminItems.map((group) => (
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {!collapsed && <span>{group.group}</span>}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end={item.url === "/admin"}
                        className={getNavCls(item.url)}
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}