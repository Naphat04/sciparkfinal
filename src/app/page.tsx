import { redirect } from "next/navigation"

export default function Home() {
  // Automatically redirect users to the Sci-Park Projects Dashboard
  redirect("/projects")
}
