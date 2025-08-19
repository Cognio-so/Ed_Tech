
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Play, Pause, Clock, Bookmark, Star, Award, Rocket, Loader2, BookOpen, Target, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

// Kid-friendly gradients
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

// Subject emojis
const subjectEmojis = {
  English: '📚',
  Math: '🔢',
  Science: '🧪',
  History: '🏛️',
  Art: '🎨',
  Geography: '🌍',
  Physics: '⚛️',
  Chemistry: '🧬',
  Biology: '🌱',
  'Computer Science': '💻'
}

// Subject characters
const subjectCharacters = {
  English: '🕵️‍♀️',
  Math: '🧮',
  Science: '👨‍🚀',
  History: '👑',
  Art: '🎭',
  Geography: '🗺️',
  Physics: '🔬',
  Chemistry: '⚗️',
  Biology: '🌻',
  'Computer Science': '🤖'
}

// Learning Character with reduced animation
const LearningCharacter = () => (
  <div className="relative">
    <div className="absolute -top-12 -right-4 text-6xl" style={{
      animation: 'gentle-bounce 3s ease-in-out infinite'
    }}>
      🎓
    </div>
    <div className="absolute -top-8 -right-8 text-2xl" style={{
      animation: 'gentle-spin 5s linear infinite'
    }}>
      ⭐
    </div>
    <div className="absolute -top-16 -right-1 text-xl" style={{
      animation: 'gentle-pulse 2.5s ease-in-out infinite'
    }}>
      ✨
    </div>
    <style jsx>{`
      @keyframes gentle-bounce {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-8px); }
      }
      @keyframes gentle-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes gentle-pulse {
        0%, 100% { opacity: 0.6; }
        50% { opacity: 1; }
      }
    `}</style>
  </div>
)

export default function MyLearningPage() {
  const [playingCourse, setPlayingCourse] = useState(null)
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recommendations, setRecommendations] = useState([])

  // Fetch student progress
  const fetchProgress = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/student/progress')
      const data = await response.json()
      
      if (response.ok) {
        setProgress(data.progress)
        
        // Fetch learning resource recommendations
        const recsResponse = await fetch('/api/student/learning-resources?limit=6')
        const recsData = await recsResponse.json()
        if (recsResponse.ok) {
          setRecommendations(recsData.resources?.slice(0, 6) || [])
        }
      } else {
        toast.error('Failed to load learning progress')
      }
    } catch (error) {
      console.error('Error fetching progress:', error)
      toast.error('Failed to load learning progress')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProgress()
  }, [])

  const updateProgress = async (courseId, lessonData) => {
    try {
      const response = await fetch('/api/student/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          ...lessonData,
          timeSpent: 5, // Simulated time spent
        })
      })
      
      if (response.ok) {
        fetchProgress() // Refresh progress
        toast.success('Progress updated!')
      }
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error('Failed to update progress')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  const totalProgress = progress?.courses?.length > 0 
    ? Math.round(progress.courses.reduce((acc, course) => acc + course.overallProgress, 0) / progress.courses.length)
    : 0

  const activeCourses = progress?.courses?.filter(course => course.isActive) || []
  const completedCourses = progress?.courses?.filter(course => course.overallProgress >= 100) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
      <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-8">
        
        {/* Header with Character */}
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                My Learning Journey! 
                <span className="text-5xl">🚀</span>
              </h1>
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                Continue your amazing adventures and keep learning! ✨
              </p>
            </div>
            
            <div className="flex gap-4">
              <Card className="border-0 rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-4">
                <div className="text-center">
                  <div className="text-3xl mb-1">📊</div>
                  <p className="text-2xl font-black text-gray-800 dark:text-white">{totalProgress}%</p>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Overall Progress</p>
                </div>
              </Card>
              
              <Card className="border-0 rounded-2xl shadow-lg bg-white dark:bg-gray-800 p-4">
                <div className="text-center">
                  <div className="text-3xl mb-1">🔥</div>
                  <p className="text-2xl font-black text-gray-800 dark:text-white">{progress?.streak?.current || 0}</p>
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Day Streak</p>
                </div>
              </Card>
              
              <Button className="hidden sm:flex rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 border-0 font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                <Bookmark className="mr-2 h-4 w-4" /> 
                Saved Items 💾
              </Button>
            </div>
          </div>
        </div>

        {/* Next Lesson & Pending Quizzes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Next Lesson */}
          <Card className="border-0 shadow-xl rounded-3xl bg-white dark:bg-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 px-6 py-4">
              <CardTitle className="text-white text-xl font-black flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Next Lesson 📖
              </CardTitle>
            </div>
            <CardContent className="p-6">
              {activeCourses.length > 0 ? (
                <div className="space-y-4">
                  {activeCourses.slice(0, 2).map(course => {
                    const nextLesson = course.lessons.find(lesson => !lesson.completed)
                    return nextLesson ? (
                      <div key={course.courseId} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                        <div className="text-3xl">
                          {subjectCharacters[course.subject] || '📚'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 dark:text-white">{nextLesson.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{course.title}</p>
                          <Badge className={`bg-gradient-to-r ${subjectColors[course.subject]} text-white border-0 text-xs mt-1`}>
                            {course.subject}
                          </Badge>
                        </div>
                        <Button 
                          className="rounded-xl bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold"
                          onClick={() => updateProgress(course.courseId, {
                            resourceId: nextLesson.resourceId,
                            resourceType: nextLesson.resourceType,
                            lessonTitle: nextLesson.title,
                            courseTitle: course.title,
                            subject: course.subject,
                            grade: course.grade,
                            completed: true,
                            score: Math.floor(Math.random() * 30) + 70 // Random score 70-100
                          })}
                        >
                          <Play className="mr-1 h-4 w-4" />
                          Continue
                        </Button>
                      </div>
                    ) : null
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-gray-600 dark:text-gray-300">No active lessons. Start learning something new!</p>
                  <Button 
                    className="mt-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold"
                    onClick={() => window.location.href = '/student/learning-library'}
                  >
                    Explore Library 📚
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Quizzes */}
          <Card className="border-0 shadow-xl rounded-3xl bg-white dark:bg-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-400 to-red-500 px-6 py-4">
              <CardTitle className="text-white text-xl font-black flex items-center gap-2">
                <Target className="h-5 w-5" />
                Pending Quizzes 🎯
              </CardTitle>
            </div>
            <CardContent className="p-6">
              <div className="text-center py-6">
                <div className="text-4xl mb-2">📝</div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">No pending quizzes</p>
                <p className="text-sm text-gray-500">Complete lessons to unlock assessments!</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Courses */}
        {activeCourses.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-gray-800 dark:text-white">
                Active Courses 🎓
              </h2>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {activeCourses.length} Active
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {activeCourses.map(course => (
                <Card 
                  key={course.courseId} 
                  className="border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] bg-white dark:bg-gray-800 rounded-3xl overflow-hidden group"
                >
                  <div className={`relative h-24 bg-gradient-to-r ${subjectColors[course.subject]} flex items-center justify-center`}>
                    {/* Background decoration */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-2 left-4 w-6 h-6 bg-white rounded-full opacity-80"></div>
                      <div className="absolute top-4 right-6 w-4 h-4 bg-white rounded-full opacity-60"></div>
                      <div className="absolute bottom-3 left-8 w-8 h-8 bg-white rounded-full opacity-70"></div>
                    </div>
                    
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="text-4xl transform transition-transform duration-300 group-hover:scale-110">
                        {subjectCharacters[course.subject] || '📚'}
                      </div>
                      <div className="text-white">
                        <h3 className="text-xl font-black">{course.title}</h3>
                        <p className="text-white/90 font-semibold">{course.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Badge className={`bg-gradient-to-r ${subjectColors[course.subject]} text-white border-0 font-bold mb-2`}>
                          {course.subject} {subjectEmojis[course.subject]}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                          <Clock className="h-4 w-4" /> 
                          {course.totalTimeSpent} min spent
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-gray-800 dark:text-white">{course.overallProgress}%</div>
                        <div className="text-sm font-bold text-gray-600 dark:text-gray-300">
                          {course.completedLessons}/{course.totalLessons} lessons
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm font-bold">
                        <span className="text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-purple-600">{course.overallProgress}% Complete! 🎯</span>
                      </div>
                      <Progress value={course.overallProgress} className="h-3" />
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button 
                        className={`w-full rounded-2xl font-bold transform hover:scale-105 transition-all shadow-lg hover:shadow-xl ${
                          playingCourse === course.courseId 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : `bg-gradient-to-r ${subjectColors[course.subject]}`
                        } border-0 text-white`}
                        onClick={() => {
                          setPlayingCourse(playingCourse === course.courseId ? null : course.courseId)
                          const nextLesson = course.lessons.find(lesson => !lesson.completed)
                          if (nextLesson) {
                            updateProgress(course.courseId, {
                              resourceId: nextLesson.resourceId,
                              resourceType: nextLesson.resourceType,
                              lessonTitle: nextLesson.title,
                              courseTitle: course.title,
                              subject: course.subject,
                              grade: course.grade,
                            })
                          }
                        }}
                      >
                        {playingCourse === course.courseId ? (
                          <>
                            <Pause className="mr-2 h-4 w-4" /> 
                            Pause ⏸️
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" /> 
                            Continue! 🚀
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="w-full rounded-2xl font-bold border-2 hover:bg-gray-50 dark:hover:bg-gray-700 transform hover:scale-105 transition-all"
                      >
                        <Star className="mr-2 h-4 w-4" /> 
                        Review 📝
                      </Button>
                    </div>
                    
                    {/* Achievement Badge */}
                    {course.overallProgress >= 75 && (
                      <div className="bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-800 dark:to-orange-800 rounded-2xl p-3 text-center">
                        <div className="flex items-center justify-center gap-2 text-orange-600 dark:text-orange-300 font-bold">
                          <Award className="h-5 w-5" />
                          <span>Almost Done! You're a champion! 🏆</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Recommended Learning Resources */}
        {recommendations.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-gray-800 dark:text-white">
                Recommended for You 🌟
              </h2>
              <Button 
                variant="outline"
                className="rounded-2xl font-bold"
                onClick={() => window.location.href = '/student/learning-library'}
              >
                See All →
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map(resource => (
                <Card key={resource._id} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white dark:bg-gray-800 rounded-3xl overflow-hidden group">
                  <div className={`relative h-20 bg-gradient-to-br ${subjectColors[resource.subject] || 'from-gray-300 to-gray-400'} flex items-center justify-center`}>
                    <div className="text-3xl">
                      {subjectCharacters[resource.subject] || '📚'}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm line-clamp-2 mb-2">
                      {resource.title}
                    </h4>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`bg-gradient-to-r ${subjectColors[resource.subject] || 'from-gray-300 to-gray-400'} text-white border-0 text-xs`}>
                        {resource.subject}
                      </Badge>
                      <span className="text-xs text-gray-600 dark:text-gray-300">
                        {resource.estimatedTimeMinutes} min
                      </span>
                    </div>
                    <Button 
                      className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-sm"
                      onClick={() => {
                        updateProgress(`course_${resource.subject}_${resource.grade}`, {
                          resourceId: resource.resourceId || resource._id,
                          resourceType: resource.resourceType,
                          lessonTitle: resource.title,
                          courseTitle: `${resource.subject} - Grade ${resource.grade}`,
                          subject: resource.subject,
                          grade: resource.grade,
                        })
                      }}
                    >
                      <Play className="mr-1 h-3 w-3" />
                      Start
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Learning Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-br from-blue-400 to-purple-500 text-white overflow-hidden transform hover:scale-105 transition-all">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">📚</div>
              <p className="text-2xl font-black">{activeCourses.length}</p>
              <p className="font-bold">Active Courses</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-br from-green-400 to-teal-500 text-white overflow-hidden transform hover:scale-105 transition-all">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-2xl font-black">{progress?.totalLessonsCompleted || 0}</p>
              <p className="font-bold">Lessons Done!</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white overflow-hidden transform hover:scale-105 transition-all">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">⏰</div>
              <p className="text-2xl font-black">{progress?.totalTimeSpent || 0}</p>
              <p className="font-bold">Minutes Learned</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-br from-pink-400 to-red-500 text-white overflow-hidden transform hover:scale-105 transition-all">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-2">⭐</div>
              <p className="text-2xl font-black">{progress?.averageScoreAcrossAll || 0}%</p>
              <p className="font-bold">Average Score</p>
            </CardContent>
          </Card>
        </div>

        {/* Motivational Message */}
        <div className="text-center">
          <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-white max-w-md mx-auto overflow-hidden transform hover:scale-105 transition-all">
            <CardContent className="p-6">
              <div className="text-4xl mb-3">🌟</div>
              <p className="text-xl font-black mb-2">Keep Going, Superstar! </p>
              <p className="font-semibold">You're doing an amazing job learning! 🎉✨</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}