import { StudentSidebar } from "@/components/student-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { checkRole } from "@/lib/server-roles"; 
import { redirect } from "next/navigation";

export default async function StudentLayout({ children }) {
    const isStudent = await checkRole('student')

    if (!isStudent) {
        redirect('/')
    }

    return (
        <SidebarProvider>
            <StudentSidebar />
            <main className="flex-1">{children}</main>
        </SidebarProvider>
    )
}