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
      title: "แผงควบคุม",
      url: "/",
      icon: LayoutDashboard,
    },
    {
      title: "โครงการ",
      url: "/projects",
      icon: Briefcase,
    },
    {
      title: "ทีม",
      url: "/teams",
      icon: Users,
    },
    {
      title: "ผู้เข้าร่วม",
      url: "/participants",
      icon: GraduationCap,
    },
  ],
  navSecondary: [
    {
      title: "ข้อเสนอโครงการ",
      url: "/proposals",
      icon: FileText,
    },
    {
      title: "การประเมิน",
      url: "/evaluations",
      icon: BarChart,
    },
  ],
  user: {
    name: "Admin User",
    email: "admin@scipark.university",
    avatar: "", // Removed broken path to prevent 404
  },
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: any
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname()
  
  const currentUser = user ? {
    name: user.name,
    email: user.email,
    avatar: "",
  } : data.user

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              nativeButton={false}
              render={
                <Link href="/">
                  <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                    <Briefcase className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">Sci-Park</span>
                    <span className="truncate text-xs text-muted-foreground uppercase tracking-widest font-black opacity-60">ระบบจัดการนวัตกรรม</span>
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
          <SidebarGroupLabel className="text-[10px] uppercase font-black tracking-widest opacity-50">เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    isActive={pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url))}
                    nativeButton={false}
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
          <SidebarGroupLabel className="text-[10px] uppercase font-black tracking-widest opacity-50">กระบวนการทำงาน</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    tooltip={item.title}
                    isActive={pathname?.startsWith(item.url)}
                    nativeButton={false}
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
                    <Avatar className="h-8 w-8 rounded-lg bg-primary/10 text-primary">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback className="rounded-lg font-bold">{currentUser.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{currentUser.name}</span>
                      <span className="truncate text-xs">{currentUser.email}</span>
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
                        <span>ตั้งค่าระบบ</span>
                    </Link>
                  }
                />
                <DropdownMenuItem 
                  render={
                    <div className="flex items-center gap-2">
                      <HelpCircle className="size-4" />
                      <span>ศูนย์ช่วยเหลือ</span>
                    </div>
                  }
                />
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive focus:bg-destructive/10"
                  render={
                    <Link href="/login" className="flex items-center gap-2 w-full cursor-pointer">
                      <LogOut className="size-4" />
                      <span>เปลี่ยน Role / คืนค่าระบบ</span>
                    </Link>
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
