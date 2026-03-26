import { Metadata } from "next"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"

export const metadata: Metadata = {
  title: "Sci-Park Innovation Platform",
  description: "Enterprise Innovation Management",
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Top Header */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Reserved for global search or notifications */}
            <div className="text-xs text-muted-foreground hidden sm:block">
              Welcome, <span className="font-medium text-foreground">Sci-Park Admin</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col gap-4 p-6 pt-4 bg-muted/20">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
