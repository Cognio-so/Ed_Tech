"use client"
import { Sparkles, Brain, Home, GraduationCap, Settings, HelpCircle, Video, Mic } from "lucide-react"
import { useState } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { UserButton, useUser } from "@clerk/nextjs"
import { Badge } from "@/components/ui/badge"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import Link from "next/link"

// Menu items.
const navigationItems = [
  {
    title: "Dashboard",
    url: "/teacher/dashboard",
    icon: Home,
    badge: null,
  },
  {
    title: "Content Generation",
    url: "/teacher/content-generation",
    icon: Sparkles,
    badge: "AI",
    badgeVariant: "default",
  },
  {
    title: "Assessment Builder",
    url: "/teacher/assessment-builder",
    icon: Brain,
    badge: "NEW",
    badgeVariant: "secondary",
  },
  {
    title: "Media Toolkit",
    url: "/teacher/media-toolkit",
    icon: Video,
    badge: "NEW",
    badgeVariant: "secondary",
  },
  {
    title: "Voice Coaching",
    url: "/teacher/voice-coaching",
    icon: Mic,
    badge: "NEW",
    badgeVariant: "secondary",
  }
]



export function TeacherSidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-foreground">EduTech AI</h1>
            <p className="text-xs text-muted-foreground">Teacher Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`group relative h-11 rounded-lg transition-all duration-200 hover:bg-accent/60 ${
                      pathname === item.url 
                        ? 'bg-accent border-l-4 border-l-violet-500 shadow-sm' 
                        : 'hover:translate-x-1'
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 px-3">
                      <item.icon className={`h-5 w-5 transition-colors ${
                        pathname === item.url 
                          ? 'text-violet-600' 
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`} />
                      <span className={`font-medium transition-colors ${
                        pathname === item.url 
                          ? 'text-foreground' 
                          : 'text-muted-foreground group-hover:text-foreground'
                      }`}>
                        {item.title}
                      </span>
                      {item.badge && (
                        <Badge 
                          variant={item.badgeVariant || "default"} 
                          className="ml-auto text-xs px-2 py-0.5"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30 w-full">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                  userButtonPopoverCard: "shadow-lg border border-border",
                }
              }}
              
            />
            {user?.fullName}
            <ThemeToggle className="ml-auto" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}