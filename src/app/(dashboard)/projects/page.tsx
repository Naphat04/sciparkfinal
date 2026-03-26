import { Metadata } from "next"
import { PlusCircle, Search, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import * as projectService from "@/services/project.service"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Projects | Sci-Park",
  description: "Manage innovation projects and programs",
}

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE": return "bg-green-500/10 text-green-500 border-green-500/20"
    case "DRAFT": return "bg-gray-500/10 text-gray-500 border-gray-500/20"
    case "COMPLETED": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
    case "CANCELLED": return "bg-red-500/10 text-red-500 border-red-500/20"
    default: return ""
  }
}

export default async function ProjectsPage() {
  const projects = await projectService.getAllProjects()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage and monitor innovation programs and incubation tracks.
          </p>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Project
        </Button>
      </div>

      <Separator />

      <Card className="border-none shadow-sm bg-card/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Active Programs</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Filter programs..."
                  className="w-[250px] pl-9 bg-background/50 h-9"
                />
              </div>
              <Button variant="outline" size="icon-sm" className="h-9 w-9">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            You have {projects.length} innovation projects in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-background/50">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="w-[300px]">Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Teams</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No projects found. Create your first project to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  projects.map((project) => (
                    <TableRow key={project.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell className="font-medium">
                        <Link href={`/projects/${project.id}`} className="hover:underline">
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${getStatusColor(project.status)} font-medium transition-all`}>
                          {project.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-primary">{project._count.teams}</span>
                        <span className="text-muted-foreground ml-1">teams</span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(project.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(project.endDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="xs" asChild>
                           <Link href={`/projects/${project.id}`}>
                             View
                           </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
