// frontend/src/components/student-sidebar.jsx
"use client"

import React from "react"
import { 
  Home, 
  BookOpen, 
  Award, 
  BarChart, 
  GraduationCap, 
  Sparkles, 
  Gamepad, 
  Star, 
  Palette, 
  Brain
} from "lucide-react"
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
  SidebarHeader
} from "@/components/ui/sidebar"
import { UserButton, useUser } from "@clerk/nextjs"
import { Badge } from "@/components/ui/badge"
import { usePathname } from "next/navigation"
import { ThemeToggle } from "./theme-toggle"
import Link from "next/link"

// Fun gradients for kids UI (from UIGradients)
const kidGradients = {
  purple: "from-violet-500 via-purple-500 to-indigo-500",
  orange: "from-amber-400 via-orange-500 to-pink-500",
  blue: "from-blue-400 via-cyan-500 to-sky-500",
  green: "from-emerald-400 via-green-500 to-teal-500",
  pink: "from-pink-400 via-rose-500 to-fuchsia-500",
}

// Navigation items for student area
const navigationItems = [
  {
    title: "Dashboard",
    url: "/student/dashboard",
    icon: Home,
    badge: null,
    gradient: kidGradients.purple,
  },
  {
    title: "Learning Library",
    url: "/student/learning-library",
    icon: BookOpen,
    badge: null,
    gradient: kidGradients.blue,
  },
  {
    title: "My Learning",
    url: "/student/my-learning",
    icon: Brain,
    badge: null,
    gradient: kidGradients.green,
  },
  {
    title: "Progress Report",
    url: "/student/progress-report",
    icon: BarChart,
    badge: null,
    gradient: kidGradients.orange,
  },
  {
    title: "Achievements",
    url: "/student/achievements",
    icon: Award,
    badge: "NEW",
    badgeVariant: "secondary",
    gradient: kidGradients.pink,
  },
]

export function StudentSidebar() {
  const pathname = usePathname()
  const { user } = useUser()

  return (
    
    <Sidebar className="border-r border-border/40">
      {/* Header with logo and title */}
      <SidebarHeader className="border-b border-border/40 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground">LearnFun</h1>
            <p className="text-xs text-muted-foreground">Student Portal</p>
          </div>
        </div>
      </SidebarHeader>

      {/* Navigation menu */}
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`group relative h-12 rounded-xl transition-all duration-200 hover:bg-accent/60 ${
                      pathname === item.url 
                        ? 'bg-accent border-l-4 border-l-violet-500 shadow-sm' 
                        : 'hover:translate-x-1'
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3 px-4">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${item.gradient} text-white shadow-sm`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className={`font-medium transition-colors ${
                        pathname === item.url 
                          ? 'text-foreground font-semibold' 
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

        {/* Fun activities section */}
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-xs font-bold text-muted-foreground mb-2 px-1">
            Fun Activities 🎮
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="group relative h-12 rounded-xl transition-all duration-200 hover:bg-accent/60 hover:translate-x-1"
                >
                  <div className="flex items-center gap-3 px-4 cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
                      <Gamepad className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-muted-foreground group-hover:text-foreground">
                      Learning Games
                    </span>
                    <Badge variant="secondary" className="ml-auto text-xs px-2 py-0.5 bg-amber-100 text-amber-700">
                      Fun
                    </Badge>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="group relative h-12 rounded-xl transition-all duration-200 hover:bg-accent/60 hover:translate-x-1"
                >
                  <div className="flex items-center gap-3 px-4 cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-sm">
                      <Palette className="h-4 w-4" />
                    </div>
                    <span className="font-medium text-muted-foreground group-hover:text-foreground">
                      Art Corner
                    </span>
                    <Badge variant="secondary" className="ml-auto text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700">
                      Creative
                    </Badge>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with user profile and theme toggle */}
      <SidebarFooter className="border-t border-border/40 p-4">
        <div className="flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 backdrop-blur-sm w-full">
          <div className="flex items-center gap-3">
            <UserButton 
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 rounded-lg",
                  userButtonPopoverCard: "shadow-lg border border-border",
                }
              }}
            />
            <div className="flex flex-col">
              <p className="text-sm font-medium">{user?.fullName || 'Student'}</p>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 text-amber-500" />
                <p className="text-xs text-muted-foreground">Level 3</p>
              </div>
            </div>
          </div>
          <ThemeToggle className="h-8 w-8" />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

export default StudentSidebar
