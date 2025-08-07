'use client'

import React from "react"
import { motion } from "framer-motion"
import {
  Users,
  BookOpen,
  TrendingUp,
  Calendar,
  Clock,
  Award,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Sparkles,
  MessageSquare,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const TeacherDashboardPage = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  }

  const stats = [
    {
      title: "Active Students",
      value: "156",
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "from-blue-500 to-cyan-500"
    },
    {
      title: "Content Generated",
      value: "89",
      change: "+23%",
      trend: "up",
      icon: BookOpen,
      color: "from-green-500 to-emerald-500"
    },
    {
      title: "Avg. Performance",
      value: "87%",
      change: "+5%",
      trend: "up",
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Pending Reviews",
      value: "24",
      change: "-8%",
      trend: "down",
      icon: Clock,
      color: "from-orange-500 to-red-500"
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: "assessment",
      title: "Math Quiz Chapter 5 completed",
      description: "32 students completed the assessment",
      time: "2 hours ago",
      status: "completed"
    },
    {
      id: 2,
      type: "content",
      title: "Science lesson plan generated",
      description: "Photosynthesis lesson for Grade 7",
      time: "4 hours ago",
      status: "generated"
    },
    {
      id: 3,
      type: "progress",
      title: "Student performance alert",
      description: "3 students need additional support",
      time: "6 hours ago",
      status: "alert"
    }
  ]

  const upcomingClasses = [
    {
      id: 1,
      subject: "Mathematics",
      grade: "Grade 7A",
      time: "10:00 AM",
      duration: "45 min",
      topic: "Algebraic Expressions"
    },
    {
      id: 2,
      subject: "Science",
      grade: "Grade 8B",
      time: "11:30 AM",
      duration: "50 min",
      topic: "Chemical Reactions"
    },
    {
      id: 3,
      subject: "Mathematics",
      grade: "Grade 6C",
      time: "2:00 PM",
      duration: "40 min",
      topic: "Fractions and Decimals"
    },
    {
        id: 4,
        subject: "English",
        grade: "Grade 5D",
        time: "3:00 PM",
        duration: "30 min",
        topic: "Grammar and Punctuation"
    }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Good morning, Teacher! 👋
            </h1>
            <p className="text-slate-600 text-lg">Here's what's happening with your classes today</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <CheckCircle size={12} className="mr-1" />
              All systems operational
            </Badge>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <Sparkles size={16} className="mr-2" />
              Quick Generate
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Stats Cards */}
        <motion.section variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <motion.div
                key={stat.title}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="relative overflow-hidden border-0 shadow-lg">
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                        <stat.icon size={24} className="text-white" />
                      </div>
                      <Badge 
                        variant={stat.trend === 'up' ? 'default' : 'secondary'}
                        className={stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                      >
                        {stat.change}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-primary mb-1">{stat.value}</p>
                      <p className="text-foreground text-sm">{stat.title}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Schedule */}
          <motion.section variants={itemVariants} className="lg:col-span-2">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar size={20} />
                  <span>Today's Schedule</span>
                </CardTitle>
                <CardDescription>Your upcoming classes and activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingClasses.map((class_item) => (
                    <motion.div
                      key={class_item.id}
                      whileHover={{ scale: 1.01 }}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="w-16 text-center">
                        <p className="font-semibold text-slate-900">{class_item.time}</p>
                        <p className="text-xs text-slate-500">{class_item.duration}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-slate-900">{class_item.subject}</h4>
                          <Badge variant="secondary" className="text-xs">{class_item.grade}</Badge>
                        </div>
                        <p className="text-sm text-slate-600">{class_item.topic}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Activity size={14} className="mr-1" />
                        Join
                      </Button>
                    </motion.div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Full Schedule
                </Button>
              </CardContent>
            </Card>
          </motion.section>

          {/* Quick Actions */}
          <motion.section variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target size={20} />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <BookOpen size={16} className="mr-2" />
                  Generate Lesson Plan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <PieChart size={16} className="mr-2" />
                  Create Assessment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 size={16} className="mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare size={16} className="mr-2" />
                  Student Messages
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity size={20} />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.status === 'completed' ? 'bg-green-100' :
                        activity.status === 'generated' ? 'bg-blue-100' : 'bg-orange-100'
                      }`}>
                        {activity.status === 'completed' && <CheckCircle size={14} className="text-green-600" />}
                        {activity.status === 'generated' && <Sparkles size={14} className="text-blue-600" />}
                        {activity.status === 'alert' && <AlertCircle size={14} className="text-orange-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary truncate">{activity.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </div>

        {/* Performance Overview */}
        <motion.section variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 size={20} />
                <span>Class Performance Overview</span>
              </CardTitle>
              <CardDescription>Student progress across your classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Grade 7A - Math</span>
                    <span className="text-sm text-slate-500">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  <p className="text-xs text-slate-500">28 of 30 students on track</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Grade 8B - Science</span>
                    <span className="text-sm text-slate-500">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                  <p className="text-xs text-slate-500">26 of 30 students on track</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Grade 6C - Math</span>
                    <span className="text-sm text-slate-500">78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                  <p className="text-xs text-slate-500">23 of 30 students on track</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </motion.div>
    </div>
  )
}

export default TeacherDashboardPage