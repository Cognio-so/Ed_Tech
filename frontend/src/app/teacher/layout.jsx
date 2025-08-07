"use client"
import { TeacherSidebar } from "@/components/teacher-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function TeacherLayout({ children }) {
    return (
        <SidebarProvider>
            <TeacherSidebar />
            <main className="flex-1">{children}</main>
        </SidebarProvider>

    )
}