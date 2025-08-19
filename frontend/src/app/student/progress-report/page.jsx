
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Trophy, 
  Target, 
  Clock, 
  BookOpen, 
  Award, 
  Zap, 
  BarChart3,
  Calendar,
  Loader2,
  ChevronRight,
  Star
} from 'lucide-react'
import { toast } from 'sonner'

// Subject colors matching other pages
const subjectColors = {
  English: 'from-pink-400 via-purple-400 to-indigo-500',
  Math: 'from-yellow-400 via-orange-400 to-red-500',
  Science: 'from-green-400 via-teal-400 to-blue-500',
  History: 'from-amber-400 via-orange-500 to-red-500',
  Art: 'from-purple-400 via-pink-400 to-red-400',
  Geography: 'from-green-400 via-teal-400 to-blue-500',
  Physics: 'from-blue-400 via-indigo-400 to-purple-500',
  Chemistry: 'from-green-400 via-emerald-400 to-teal-500',
  Biology: 'from-green-300 via-lime-300 to-emerald-400',
  'Computer Science': 'from-gray-400 via-blue-400 to-indigo-500'
}

export default function ProgressReportPage() {
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProgress = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/student/progress')
      const data = await response.json()
      
      if (response.ok) {
        setProgress(data.progress)
      } else {
        toast.error('Failed to load progress report')
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
      toast.error('Failed to load progress report')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  const activeCourses = progress?.courses?.filter(course => course.isActive) || []
  const completedCourses = progress?.courses?.filter(course => course.overallProgress >= 100) || []
  
  // Calculate subject-wise mastery
  const subjectMastery = {}
  progress?.courses?.forEach(course => {
    if (!subjectMastery[course.subject]) {
      subjectMastery[course.subject] = { total: 0, completed: 0, progress: 0 }
    }
    subjectMastery[course.subject].total += 1
    subjectMastery[course.subject].progress += course.overallProgress
    if (course.overallProgress >= 100) {
      subjectMastery[course.subject].completed += 1
    }
  })

  // Calculate average progress per subject
  Object.keys(subjectMastery).forEach(subject => {
    subjectMastery[subject].averageProgress = Math.round(subjectMastery[subject].progress / subjectMastery[subject].total)
  })

  const overallProgress = activeCourses.length > 0 
    ? Math.round(activeCourses.reduce((acc, course) => acc + course.overallProgress, 0) / activeCourses.length)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
      <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white flex items-center justify-center gap-3">
            <BarChart3 className="h-12 w-12 text-purple-500" />
            Progress & Reports! 
            <span className="text-5xl">📊</span>
          </h1>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
            Track your amazing learning journey and see how far you've come! ✨
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-br from-purple-400 to-pink-500 text-white overflow-hidden transform hover:scale-105 transition-all">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">🎯</div>
              <p className="text-3xl font-black">{overallProgress}%</p>
              <p className="font-bold">Overall Progress</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white overflow-hidden transform hover:scale-105 transition-all">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-3xl font-black">{activeCourses.length}</p>
              <p className="font-bold">Active Courses</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-br from-green-400 to-emerald-500 text-white overflow-hidden transform hover:scale-105 transition-all">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">🏆</div>
              <p className="text-3xl font-black">{completedCourses.length}</p>
              <p className="font-bold">Completed</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white overflow-hidden transform hover:scale-105 transition-all">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">🔥</div>
              <p className="text-3xl font-black">{progress?.streak?.current || 0}</p>
              <p className="font-bold">Day Streak</p>
            </CardContent>
          </Card>
        </div>

        {/* Subject-wise Progress Map */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white dark:bg-gray-800 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-500" />
              Subject Mastery Map 🗺️
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(subjectMastery).map(([subject, data]) => (
                <div key={subject} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800 dark:text-white">{subject}</h3>
                    <Badge className={`bg-gradient-to-r ${subjectColors[subject]} text-white border-0`}>
                      {data.averageProgress}%
                    </Badge>
                  </div>
                  <Progress value={data.averageProgress} className="h-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {data.completed}/{data.total} courses completed
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="border-0 shadow-xl rounded-3xl bg-white dark:bg-gray-800 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Achievement Gallery 🏆
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {progress?.achievements?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {progress.achievements.map((achievement, index) => (
                  <div key={index} className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-800 dark:to-orange-800 rounded-2xl p-4 text-center">
                    <div className="text-3xl mb-2">{achievement.icon}</div>
                    <h4 className="font-bold text-gray-800 dark:text-white">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{achievement.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🎖️</div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                  No achievements yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Keep learning to unlock amazing badges and trophies!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Detailed Course Progress */}
        {activeCourses.length > 0 && (
          <Card className="border-0 shadow-xl rounded-3xl bg-white dark:bg-gray-800 overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-500" />
                Course Details 📖
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {activeCourses.map(course => (
                <div key={course.courseId} className="border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white">{course.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{course.description}</p>
                    </div>
                    <Badge className={`bg-gradient-to-r ${subjectColors[course.subject]} text-white border-0`}>
                      {course.subject}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{course.overallProgress}%</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Progress</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <p className="text-lg font-bold text-gray-800 dark:text-white">
                        {course.completedLessons}/{course.totalLessons}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Lessons</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <p className="text-lg font-bold text-gray-800 dark:text-white">{course.averageScore || 0}%</p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Average Score</p>
                    </div>
                  </div>
                  
                  <Progress value={course.overallProgress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Learning Recommendations */}
        <Card className="border-0 shadow-xl rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <Zap className="h-6 w-6" />
              AI Assistant Suggestions 🤖
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="bg-white/10 rounded-2xl p-4">
                <h4 className="font-bold mb-2">🎯 Focus Areas</h4>
                <p className="text-sm opacity-90">
                  Based on your progress, try spending more time on Math and Science topics. 
                  You're doing great with English!
                </p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-4">
                <h4 className="font-bold mb-2">⏰ Study Schedule</h4>
                <p className="text-sm opacity-90">
                  You learn best in the morning! Try to do at least 20 minutes of learning each day 
                  to maintain your streak.
                </p>
              </div>
              
              <div className="bg-white/10 rounded-2xl p-4">
                <h4 className="font-bold mb-2">🌟 Next Goals</h4>
                <p className="text-sm opacity-90">
                  Complete 2 more lessons this week to unlock the "Weekly Champion" badge! 
                  You're almost there!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            className="rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 border-0 font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
            onClick={() => window.location.href = '/student/my-learning'}
          >
            <ChevronRight className="mr-2 h-4 w-4" />
            Continue Learning! 🚀
          </Button>
          
          <Button 
            variant="outline"
            className="rounded-2xl font-bold border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transform hover:scale-105 transition-all"
            onClick={() => window.location.href = '/student/learning-library'}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Explore Library 📚
          </Button>
        </div>
      </div>
    </div>
  )
}


