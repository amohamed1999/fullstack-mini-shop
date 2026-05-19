import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronsLeft,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Products", url: "/products", icon: Package },
  { title: "Orders", url: "/orders", icon: ShoppingCart },
  { title: "Categories", url: "/categories", icon: Tags },
];


export function AppSidebar({ isAdmin }: { isAdmin: boolean }) {
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  const isActive = (url: string) =>
    pathname.startsWith(url);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <div className="flex items-center gap-2">
            <div
              className="grid size-8 place-items-center rounded-md text-sm font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
            >
              A
            </div>
            {!collapsed && (
              <span className="font-display text-base font-semibold">Atlas</span>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={toggleSidebar}
              aria-label="Collapse sidebar"
              className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-sidebar-accent"
            >
              <ChevronsLeft className="size-4" />
            </button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && (
          <p className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            v0.1 · phase 1
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
