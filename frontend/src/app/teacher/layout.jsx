import { TeacherSidebar } from "@/components/teacher-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { checkRole } from "@/lib/server-roles";
import { redirect } from "next/navigation";

export default async function TeacherLayout({ children }) {
    const isTeacher = await checkRole('teacher')

    if (!isTeacher) {
        redirect('/')
    }

    return (
        <SidebarProvider>
            <TeacherSidebar />
            <main className="flex-1">{children}</main>
        </SidebarProvider>
    )
}