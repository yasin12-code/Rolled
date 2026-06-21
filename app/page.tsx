import { redirect } from "next/navigation"

export default function Home() {
  // In a real app, this would check auth and redirect to login if not authenticated
  // For now, we redirect to the dashboard
  redirect("/dashboard")
}
