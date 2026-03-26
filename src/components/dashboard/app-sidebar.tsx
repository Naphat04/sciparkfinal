"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Briefcase, 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  FileText, 
  BarChart, 
  Settings,
  HelpCircle,
  LogOut,
  ChevronRight
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Define the navigation items
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: Briefcase,
    },
    {
      title: "Teams",
      url: "/teams",
      icon: Users,
    },
    {
      title: "Participants",
      url: "/participants",
      icon: GraduationCap,
    },
  ],
  navSecondary: [
    {
      title: "Proposals",
      url: "/proposals",
      icon: FileText,
    },
    {
      title: "Evaluations",
      url: "/evaluations",
      icon: BarChart,
    },
  ],
  user: {
    name: "Admin User",
    email: "admin@scipark.university",
    avatar: "/avatars/admin.png",
  },
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              render={
                <Link href="/">
                  <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Briefcase className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Sci-Park</span>
                    <span className="truncate text-xs">Innovation Portal</span>
                  </div>
                </Link>
              }
            />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Core Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    isActive={pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url))}
                    render={
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Workflow */}
        <SidebarGroup>
          <SidebarGroupLabel>Workflow</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    isActive={pathname?.startsWith(item.url)}
                    render={
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    }
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={data.user.avatar} alt={data.user.name} />
                      <AvatarFallback className="rounded-lg">SC</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{data.user.name}</span>
                      <span className="truncate text-xs">{data.user.email}</span>
                    </div>
                    <ChevronRight className="ml-auto size-4" />
                  </SidebarMenuButton>
                }
              />
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem 
                  render={
                    <Link href="/settings" className="flex items-center gap-2">
                       <Settings className="size-4" />
                       <span>Settings</span>
                    </Link>
                  }
                />
                <DropdownMenuItem 
                  render={
                    <div className="flex items-center gap-2">
                      <HelpCircle className="size-4" />
                      <span>Support</span>
                    </div>
                  }
                />
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  variant="destructive"
                  render={
                    <div className="flex items-center gap-2">
                      <LogOut className="size-4" />
                      <span>Log out</span>
                    </div>
                  }
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
