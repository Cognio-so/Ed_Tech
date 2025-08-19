'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  BookOpen, Play, Trophy, Clock, Star, Brain, Gamepad2, Rocket,
  Zap, Award, Gift, Calculator, Globe, Heart, Smile, Sun,
  Sparkles, Target, Medal, Crown, Rainbow, Gem
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'

const kidGradients = {
  purple: 'from-violet-500 via-purple-500 to-indigo-500',
  orange: 'from-amber-400 via-orange-500 to-pink-500',
  blue: 'from-blue-400 via-cyan-500 to-sky-500',
  green: 'from-emerald-400 via-green-500 to-teal-500',
  pink: 'from-pink-400 via-rose-500 to-fuchsia-500',
}

// Separate components to improve rendering performance
const CartoonSun = () => (
  <div className="relative">
    <Sun className="h-10 w-10 text-yellow-400 animate-spin" style={{animationDuration: '8s'}} />
    <div className="absolute inset-0 flex items-center justify-center">
      <Smile className="h-5 w-5 text-yellow-600" />
    </div>
  </div>
)

const FloatingEmoji = ({ emoji, delay = 0 }) => (
  <div 
    className="absolute text-xl animate-bounce hidden md:block"
    style={{
      animationDelay: `${delay}s`,
      animationDuration: '2s'
    }}
  >
    {emoji}
  </div>
)

// Extract card components to improve performance and readability
const QuickActionCard = ({ action }) => (
  <Card className="border-0 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-102 bg-white dark:bg-gray-800">
    <div className={`h-2 bg-gradient-to-r ${action.color}`}></div>
    <CardContent className="p-4">
      <div className="flex items-start gap-3">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white`}>
          <action.icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">{action.label}</h3>
            <span className="text-xl">{action.emoji}</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{action.desc}</p>
          <Button className="mt-2 rounded-xl font-semibold text-sm bg-gradient-to-r from-gray-700 to-gray-800 text-white border-0 transition-all hover:scale-105" 
            onClick={() => window.location.href='/student/learning-library'}>
            Let's Go! {action.character}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
)

const SubjectCard = ({ subject }) => (
  <Card className="group border-0 rounded-2xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-102 bg-white dark:bg-gray-800">
    <div className={`relative h-36 bg-gradient-to-br ${subject.color} flex flex-col items-center justify-center overflow-hidden`}>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full"></div>
        <div className="absolute top-3 right-3 w-5 h-5 bg-white rounded-full"></div>
        <div className="absolute bottom-3 left-3 w-7 h-7 bg-white rounded-full"></div>
      </div>
      <div className="relative z-10 text-center">
        <div className="text-4xl mb-1 transition-transform duration-300 group-hover:scale-110">
          {subject.character}
        </div>
        <subject.icon className="h-8 w-8 text-white/90 mx-auto" />
      </div>
    </div>
    <CardContent className="p-4">
      <div className="space-y-2">
        <div>
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-800 dark:text-purple-300 font-semibold rounded-full text-xs">
            {subject.tag}
          </Badge>
          <h3 className="font-bold text-base mt-1 text-gray-800 dark:text-white line-clamp-1">{subject.title}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{subject.subtitle}</p>
        </div>
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-gray-700 dark:text-gray-300">⏰ {subject.mins} min</span>
          <span className="text-purple-600">{subject.progress}% done!</span>
        </div>
        <Progress value={subject.progress} className="h-2 rounded-full bg-gray-100 dark:bg-gray-700" />
        <Button className="mt-3 w-full rounded-xl font-semibold text-sm bg-gradient-to-r from-gray-700 to-gray-800 text-white border-0 transition-all hover:scale-105"
          onClick={() => window.location.href='/student/learning-library'}>
          <Play className="mr-1 h-3 w-3" /> Start Adventure! {subject.emoji}
        </Button>
      </div>
    </CardContent>
  </Card>
)

// Main Component
export default function StudentDashboardPage() {
  const { user } = useUser()
  const [progressData, setProgressData] = useState(null)
  const [resources, setResources] = useState([])

  // Use useCallback for fetch function to avoid recreation on each render
  const fetchData = useCallback(async () => {
    try {
      const [pRes, rRes] = await Promise.all([
        fetch('/api/student/progress', { cache: 'no-store' }),
        fetch('/api/student/learning-resources?limit=8', { cache: 'no-store' }),
      ])
      const [p, r] = await Promise.all([pRes.json(), rRes.json()])
      if (pRes.ok) setProgressData(p.progress || null)
      if (rRes.ok) setResources(r.resources || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Memoized calculations
  const totals = useMemo(() => {
    const courses = progressData?.courses || []
    const streak = progressData?.streak?.current || 0
    const avgCompletion = courses.length
      ? Math.round(courses.reduce((a, c) => a + (c.overallProgress || 0), 0) / courses.length)
      : 0
    const totalLessonsCompleted = courses.reduce((a, c) => a + (c.completedLessons || 0), 0)
    const thresholds = [0, 10, 25, 40, 60]
    let level = 1
    thresholds.forEach((t, idx) => {
      if (totalLessonsCompleted >= t) level = idx + 1
    })
    return { streak, avgCompletion, level, totalLessonsCompleted }
  }, [progressData])

  const upcomingAchievements = useMemo(() => {
    const courses = progressData?.courses || []
    return courses
      .filter(c => (c.overallProgress || 0) < 100)
      .slice(0, 3)
      .map(c => ({
        name: `${c.title}`,
        progress: Math.round(c.overallProgress || 0),
        emoji: '🎯',
        color: kidGradients.orange,
      }))
  }, [progressData])

  const subjectCards = useMemo(() => {
    const bySubject = {
      Math: kidGradients.orange,
      Science: kidGradients.green,
      English: kidGradients.pink,
      History: kidGradients.orange,
      'Computer Science': kidGradients.purple,
      Default: kidGradients.blue,
    }
    return resources.slice(0, 8).map((res, i) => ({
      id: res._id,
      title: res.title,
      subtitle: res.description,
      tag: res.subject || 'General',
      mins: res.estimatedTimeMinutes || 10,
      color: bySubject[res.subject] || bySubject.Default,
      icon: BookOpen,
      emoji: '📚',
      progress: Math.min(100, Math.round((progressData?.courses?.find(c => c.subject === res.subject)?.overallProgress) || 0)),
      character: '🌟',
    }))
  }, [resources, progressData])

  const nextLesson = useMemo(() => {
    const courses = progressData?.courses || []
    const active = courses.find(c => (c.overallProgress || 0) < 100) || courses[0]
    if (!active) return null
    const next = active.lessons?.find(l => !l.completed)
    return {
      course: active,
      title: next?.title || active.title,
      stepText: `Progress: ${active.completedLessons || 0} of ${active.totalLessons || 0}`,
      overall: Math.round(active.overallProgress || 0),
    }
  }, [progressData])

  // Precomputed quick action cards data
  const quickActions = useMemo(() => [
    { id: 'continue', label: 'Keep Learning!', desc: 'Continue your awesome journey!', icon: Zap, color: kidGradients.orange, emoji: '⚡', character: '🎯' },
    { id: 'practice', label: 'Brain Games!', desc: 'Fun quizzes await you!', icon: Brain, color: kidGradients.green, emoji: '🧠', character: '🎮' },
    { id: 'read', label: 'Story Time!', desc: 'Discover magical stories!', icon: BookOpen, color: kidGradients.blue, emoji: '📚', character: '🌈' },
  ], [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-slate-900 dark:via-violet-900 dark:to-indigo-900 overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Floating BG */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <FloatingEmoji emoji="⭐" delay={0} />
          <FloatingEmoji emoji="🌟" delay={1} />
          <FloatingEmoji emoji="✨" delay={2} />
          <div className="absolute top-16 right-16">
            <FloatingEmoji emoji="🎈" delay={0.5} />
          </div>
          <div className="absolute bottom-16 left-16">
            <FloatingEmoji emoji="🦋" delay={1.5} />
          </div>
        </div>

        {/* Hero Banner */}
        <Card className="relative overflow-hidden border-0 shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"></div>
          <div className="relative px-4 sm:px-6 py-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-4 w-full lg:w-2/3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Avatar className="h-16 w-16 ring-4 ring-white/30 shadow-lg transition-transform duration-300">
                    <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white text-2xl font-bold">
                      {user?.fullName?.[0] || "U"}
                    </AvatarFallback>
                    <div className="absolute -top-1 -right-1 text-lg animate-bounce">👑</div>
                  </Avatar>
                  <div className="flex-1">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
                      Hey {user?.fullName || "Explorer"}!
                    </h1>
                    <p className="text-white/90 text-base sm:text-lg font-medium mt-1">
                      Ready for a fun learning adventure? 🚀
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-white/25 text-white px-3 py-1 text-xs font-semibold border-0 transition-transform hover:scale-105">
                    <Clock className="mr-1 h-3 w-3" /> {totals.streak}-day streak! 🔥
                  </Badge>
                  <Badge className="bg-white/25 text-white px-3 py-1 text-xs font-semibold border-0 transition-transform hover:scale-105">
                    <Crown className="mr-1 h-3 w-3" /> Level {totals.level} Star! ⭐
                  </Badge>
                  <Badge className="bg-white/25 text-white px-3 py-1 text-xs font-semibold border-0 transition-transform hover:scale-105">
                    <Gem className="mr-1 h-3 w-3" /> {progressData?.totalLessonsCompleted || 0} lessons!
                  </Badge>
                </div>
              </div>

              <Card className="w-full lg:w-1/3 border-0 rounded-2xl shadow-lg bg-white dark:bg-gray-800 transition-all duration-300">
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-indigo-400 to-purple-500 p-2 rounded-xl text-white">
                        <Play className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-lg text-gray-800 dark:text-white">Continue Learning!</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">You're doing great! 🌟</p>
                      </div>
                    </div>
                  </div>
                  
                  {nextLesson ? (
                    <>
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-800 dark:to-pink-800 rounded-xl p-3 mb-3">
                        <p className="font-semibold text-base text-gray-800 dark:text-white truncate">📖 {nextLesson.title}</p>
                        <div className="flex items-center mt-1">
                          <BookOpen className="h-3 w-3 text-purple-600 mr-1" />
                          <p className="text-xs text-gray-700 dark:text-gray-300 truncate">{nextLesson.course.title}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className="text-gray-700 dark:text-gray-300">{nextLesson.stepText}</span>
                          <span className="text-purple-600">{nextLesson.overall}% 🎯</span>
                        </div>
                        <Progress value={nextLesson.overall} className="h-3 rounded-full bg-purple-100 dark:bg-purple-800" />
                      </div>
                    </>
                  ) : (
                    <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">No active courses yet. Start from the library!</div>
                  )}

                  <Button className="mt-4 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-xl text-white font-semibold py-2 transition-all hover:scale-105" onClick={() => window.location.href='/student/learning-library'}>
                    <Play className="mr-1 h-4 w-4" /> Let's Continue! 🚀
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </Card>

        {/* Quick Actions - Use the extracted component */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <QuickActionCard key={action.id} action={action} />
          ))}
        </div>

        {/* Achievements (from progress) */}
        <Card className="border-0 rounded-2xl shadow-md bg-white dark:bg-gray-800">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 px-4 py-3">
            <CardTitle className="text-white flex items-center gap-2 text-xl font-bold">
              <Award className="h-6 w-6" /> My Super Achievements!
            </CardTitle>
          </div>
          <CardContent className="p-4">
            {upcomingAchievements.length === 0 ? (
              <div className="text-center text-xs text-gray-600 dark:text-gray-300 py-4">
                Start a lesson to begin earning achievements! ✨
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAchievements.map((achievement, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{achievement.emoji}</span>
                        <p className="font-semibold text-base text-gray-800 dark:text-white truncate">{achievement.name}</p>
                      </div>
                      <span className="text-base font-semibold text-gray-700 dark:text-gray-300">{achievement.progress}%</span>
                    </div>
                    <Progress value={achievement.progress} className="h-3 rounded-full bg-gray-100 dark:bg-gray-700" />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 text-center">
              <Button className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold px-6 py-2 transition-all hover:scale-105" onClick={() => window.location.href='/student/achievements'}>
                <Gift className="mr-1 h-4 w-4" /> See All Rewards 🎁
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recommended Subject Cards - Use the extracted component */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              Perfect For You! <span className="text-2xl">🌟</span>
            </h2>
            <Button variant="ghost" className="text-purple-600 font-semibold hover:bg-purple-100 dark:hover:bg-purple-800 rounded-xl" onClick={() => window.location.href='/student/learning-library'}>
              See All Adventures! →
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {subjectCards.map((subject) => (
              <SubjectCard key={subject.id} subject={subject} />
            ))}
          </div>
        </div>

        {/* Daily Challenge */}
        <Card className="border-0 rounded-2xl shadow-md bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 transition-all duration-300">
          <div className="relative px-4 sm:px-6 py-6 text-white">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-3 left-6 w-10 h-10 bg-white rounded-full animate-pulse"></div>
              <div className="absolute top-6 right-10 w-8 h-8 bg-yellow-300 rounded-full animate-bounce" style={{animationDelay: '0.5s'}}></div>
            </div>
            
            <div className="relative flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-3">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                  <Gamepad2 className="h-6 w-6" /> Today's Super Challenge!
                </h3>
                <p className="text-base font-medium opacity-95">
                  Solve today's puzzle and win rewards! 🎁
                </p>
                <div className="flex gap-3">
                  <Button className="bg-white text-purple-700 hover:bg-gray-100 rounded-xl font-semibold text-sm px-4 py-2 transition-all hover:scale-105">
                    Accept Challenge! 🚀
                  </Button>
                  <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-xl font-semibold text-sm">
                    View Rewards 🏆
                  </Button>
                </div>
              </div>
              <div className="hidden md:block">
                <Rocket className="h-16 w-16 text-white/90 transform rotate-12" />
              </div>
            </div>
          </div>
        </Card>

        {/* Footer Message */}
        <div className="text-center py-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 max-w-md mx-auto">
            <div className="text-3xl mb-1">🎉</div>
            <p className="text-lg font-bold text-gray-800 dark:text-white">You're Amazing!</p>
            <p className="text-xs text-gray-600 dark:text-gray-300">Keep learning and having fun! 🌈</p>
          </div>
        </div>
      </div>
    </div>
  )
} 