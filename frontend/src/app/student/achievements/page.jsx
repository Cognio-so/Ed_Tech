'use client'

import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Trophy, Star, Sparkles, Award, Crown, Medal, Gift, Share, Download } from 'lucide-react'
import Link from 'next/link'

// Subject gradients reused across the app
const subjectGradients = {
  English: 'from-pink-400 to-purple-500',
  Math: 'from-yellow-400 to-orange-500',
  Science: 'from-green-400 to-emerald-500',
  History: 'from-amber-400 to-red-500',
  Art: 'from-purple-400 to-pink-500',
  Geography: 'from-teal-400 to-blue-500',
  Physics: 'from-blue-400 to-indigo-500',
  Chemistry: 'from-emerald-400 to-teal-500',
  Biology: 'from-lime-400 to-emerald-500',
  'Computer Science': 'from-slate-400 to-indigo-500',
  Default: 'from-gray-300 to-gray-400',
}

// Emoji per subject for fun
const subjectEmoji = {
  English: '📚',
  Math: '🔢',
  Science: '🧪',
  History: '🏛️',
  Art: '🎨',
  Geography: '🌍',
  Physics: '🔬',
  Chemistry: '🧬',
  Biology: '🌱',
  'Computer Science': '💻',
  Default: '🌟',
}

// Achievement Character (extracted as memoized component)
const AchievementCharacter = React.memo(() => (
  <div className="relative">
    <div className="absolute -top-16 -right-8 text-8xl animate-bounce" style={{animationDuration: '2.5s'}}>
      🏆
    </div>
    <div className="absolute -top-12 -right-12 text-3xl animate-spin" style={{animationDuration: '4s', animationDelay: '0.5s'}}>
      ⭐
    </div>
    <div className="absolute -top-20 -right-4 text-2xl animate-pulse">
      ✨
    </div>
  </div>
))

// Extract badge card component for better performance
const BadgeCard = React.memo(({ badge, rarityColor }) => (
  <div 
    className="group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 border-transparent hover:border-purple-300"
  >
    <div className="absolute top-3 right-3">
      <Badge className={`${rarityColor} font-bold text-xs`}>
        {badge.rarity}
      </Badge>
    </div>
    
    <div className="text-center space-y-4">
      <div className={`relative mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12`}>
        <badge.icon className="h-10 w-10 text-white" />
        <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
          {badge.emoji}
        </div>
      </div>
      
      <div>
        <h3 className="font-black text-lg text-gray-800 dark:text-white mb-2">{badge.name}</h3>
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-3">{badge.description}</p>
        <Badge variant="outline" className="text-xs font-bold">
          Earned {badge.earnedDate} 🎉
        </Badge>
      </div>
    </div>
    
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
      <div className="absolute top-2 left-2 text-yellow-400 animate-ping">✨</div>
      <div className="absolute bottom-2 right-2 text-pink-400 animate-pulse">💫</div>
      <div className="absolute top-1/2 left-2 text-blue-400 animate-bounce">⭐</div>
    </div>
  </div>
))

// Extract upcoming badge component
const UpcomingBadge = React.memo(({ badge }) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{badge.emoji}</span>
        <div>
          <p className="font-bold text-gray-800 dark:text-white">{badge.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">{badge.requirement}</p>
        </div>
      </div>
    </div>
    <div className="space-y-1">
      <div className="flex justify-between text-sm font-bold">
        <span className="text-gray-600 dark:text-gray-300">Progress</span>
        <span className="text-green-600">{badge.progress}%</span>
      </div>
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000"
          style={{width: `${badge.progress}%`}}
        />
      </div>
    </div>
  </div>
))

// Extract level component
const LevelCard = React.memo(({ level }) => (
  <div 
    className={`relative rounded-2xl p-6 text-center transform transition-all duration-300 hover:scale-105 ${
      level.unlocked 
        ? `bg-gradient-to-br ${level.color} text-white shadow-lg cursor-pointer` 
        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
    }`}
  >
    {level.unlocked && (
      <div className="absolute top-2 right-2 text-2xl animate-bounce">
        ✨
      </div>
    )}
    
    <div className="space-y-3">
      <div className="text-4xl">{level.emoji}</div>
      <div>
        <p className="text-sm font-semibold opacity-90">Level {level.level}</p>
        <p className="text-lg font-black">{level.name}</p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-bold">
          <span>Progress</span>
          <span>{level.progress}%</span>
        </div>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white rounded-full transition-all duration-1000"
            style={{width: `${level.progress}%`}}
          />
        </div>
      </div>
      
      {level.unlocked && level.progress === 100 && (
        <Badge className="bg-white/20 text-white border-0 font-bold">
          Completed! 🎉
        </Badge>
      )}
      
      {!level.unlocked && (
        <Badge className="bg-gray-200 text-gray-600 border-0 font-bold">
          Locked 🔒
        </Badge>
      )}
    </div>
  </div>
))

export default function AchievementsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [progress, setProgress] = useState(null)
  const categories = ['All', 'Math', 'Science', 'Reading', 'History', 'Art']

  // Use useCallback for helper functions to avoid recreation
  const getRarityColor = useCallback((rarity) => {
    switch(rarity) {
      case 'Common': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
      case 'Rare': return 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-300'
      case 'Epic': return 'bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-300'
      case 'Legendary': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-700'
    }
  }, [])

  // Use useCallback for fetch function to avoid recreation on each render
  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/student/progress', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) setProgress(data.progress || { courses: [] })
      else setProgress({ courses: [] })
    } catch (error) {
      console.error('Error fetching progress data:', error)
      setProgress({ courses: [] })
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Memoized calculations
  const {
    earnedBadges,
    upcomingBadges,
    levelStats,
    totals,
  } = useMemo(() => {
    const courses = progress?.courses || []

    // Completed course -> earned badge
    const earned = []
    for (const c of courses) {
      if ((c.overallProgress || 0) >= 100) {
        const rarity = (c.averageScore || 0) >= 90 ? 'Epic' : (c.averageScore || 0) >= 75 ? 'Rare' : 'Common'
        earned.push({
          id: c.courseId,
          name: `${c.title} Completed!`,
          description: `Finished all ${c.totalLessons || 0} lessons${typeof c.averageScore === 'number' ? ` • Avg ${c.averageScore}%` : ''}`,
          color: subjectGradients[c.subject] || subjectGradients.Default,
          icon: Star,
          emoji: subjectEmoji[c.subject] || subjectEmoji.Default,
          rarity,
          earnedDate: 'Recently',
          subject: c.subject || 'General',
        })
      }
    }

    // In-progress course -> upcoming
    const upcoming = []
    for (const c of courses) {
      const p = Math.max(0, Math.min(100, Math.round(c.overallProgress || 0)))
      if (p < 100) {
        upcoming.push({
          name: c.title,
          requirement: `${Math.max(0, 100 - p)}% remaining`,
          progress: p,
          emoji: subjectEmoji[c.subject] || subjectEmoji.Default,
          subject: c.subject || 'General',
        })
      }
    }

    // Level journey based on total completed lessons
    const totalLessonsCompleted = courses.reduce((a, c) => a + (c.completedLessons || 0), 0)
    const thresholds = [
      { name: 'Bronze Explorer', emoji: '🥉', color: 'from-amber-400 to-yellow-500', needed: 0 },
      { name: 'Silver Adventurer', emoji: '🥈', color: 'from-gray-400 to-slate-500', needed: 10 },
      { name: 'Gold Champion', emoji: '🥇', color: 'from-yellow-400 to-amber-500', needed: 25 },
      { name: 'Platinum Hero', emoji: '💎', color: 'from-blue-400 to-indigo-500', needed: 40 },
      { name: 'Diamond Legend', emoji: '👑', color: 'from-purple-400 to-pink-500', needed: 60 },
    ]
    
    let currentLevelIdx = 0
    thresholds.forEach((t, idx) => {
      if (totalLessonsCompleted >= t.needed) currentLevelIdx = idx
    })
    
    const levels = thresholds.map((t, idx) => {
      const next = thresholds[idx + 1]
      const unlocked = totalLessonsCompleted >= t.needed
      let pct = 100
      if (!next) {
        pct = Math.min(100, Math.round(((totalLessonsCompleted - t.needed) / 20) * 100))
      } else {
        const span = Math.max(1, next.needed - t.needed)
        pct = Math.max(0, Math.min(100, Math.round(((totalLessonsCompleted - t.needed) / span) * 100)))
      }
      return {
        name: t.name,
        level: idx + 1,
        unlocked,
        progress: pct,
        color: t.color,
        emoji: t.emoji,
      }
    })

    const avgCompletion = courses.length
      ? Math.round(courses.reduce((a, c) => a + (c.overallProgress || 0), 0) / courses.length)
      : 0

    return {
      earnedBadges: earned,
      upcomingBadges: upcoming,
      levelStats: levels,
      totals: {
        badges: earned.length,
        upcomingCount: upcoming.length,
        currentLevel: currentLevelIdx + 1,
        completionRate: avgCompletion,
      },
    }
  }, [progress])

  const filteredEarned = useMemo(() => {
    if (selectedCategory === 'All') return earnedBadges
    const catToSubject = {
      Reading: 'English',
      Art: 'Art',
      Math: 'Math',
      History: 'History',
      Science: 'Science',
    }
    const subj = catToSubject[selectedCategory]
    if (!subj) return earnedBadges
    return earnedBadges.filter(b => b.subject === subj)
  }, [earnedBadges, selectedCategory])

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900">
      <div className="mx-auto max-w-7xl p-6 md:p-8 space-y-8">
        
        {/* Header with Character */}
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-white flex items-center gap-3">
                My Achievements! 
                <span className="text-5xl">🏆</span>
              </h1>
              <p className="text-lg font-semibold text-gray-600 dark:text-gray-300">
                Collect amazing badges as you learn and grow! ✨
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button className="hidden sm:flex rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 border-0 font-bold text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
                <Share className="mr-2 h-4 w-4" /> 
                Share Collection! 📢
              </Button>
              <Button variant="outline" className="rounded-2xl font-bold border-2 hover:bg-purple-50 dark:hover:bg-purple-900 transform hover:scale-105 transition-all">
                <Download className="mr-2 h-4 w-4" />
                Download Certificate! 📜
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview (real data) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 rounded-2xl shadow-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white transform hover:scale-105 transition-all">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🏅</div>
              <p className="text-2xl font-black">{totals.badges}</p>
              <p className="text-sm font-bold">Badges Earned</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 rounded-2xl shadow-lg bg-gradient-to-br from-green-400 to-teal-500 text-white transform hover:scale-105 transition-all">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-2xl font-black">{totals.upcomingCount}</p>
              <p className="text-sm font-bold">Coming Soon</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 rounded-2xl shadow-lg bg-gradient-to-br from-purple-400 to-pink-500 text-white transform hover:scale-105 transition-all">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">⭐</div>
              <p className="text-2xl font-black">{totals.currentLevel}</p>
              <p className="text-sm font-bold">Current Level</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 rounded-2xl shadow-lg bg-gradient-to-br from-blue-400 to-indigo-500 text-white transform hover:scale-105 transition-all">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <p className="text-2xl font-black">{totals.completionRate}%</p>
              <p className="text-sm font-bold">Completion Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Filter */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
          {categories.map(category => (
            <Badge 
              key={category}
              variant={selectedCategory === category ? "default" : "outline"} 
              className={`whitespace-nowrap cursor-pointer font-bold px-6 py-3 rounded-full transform hover:scale-110 transition-all text-sm ${
                selectedCategory === category 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0' 
                  : 'hover:bg-purple-100 dark:hover:bg-purple-800'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category} {category === 'All' ? '🌟' : category === 'Math' ? '🔢' : category === 'Science' ? '🚀' : category === 'Reading' ? '📚' : category === 'History' ? '🏛️' : '🎨'}
            </Badge>
          ))}
        </div>

        {/* Trophy Case (with extracted component) */}
        <Card className="border-0 shadow-2xl rounded-3xl bg-white dark:bg-gray-800 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 px-6 py-4">
            <CardTitle className="text-white flex items-center gap-3 text-2xl font-black">
              <Trophy className="h-6 w-6" /> 
              My Trophy Case! 
              <span className="text-3xl">🏆</span>
            </CardTitle>
            <CardDescription className="text-white/90 text-lg font-semibold">
              Your amazing collection of earned badges! 🎉
            </CardDescription>
          </div>
          <CardContent className="p-8">
            {filteredEarned.length === 0 ? (
              <div className="text-center text-sm text-gray-600 dark:text-gray-300 py-8">
                No badges earned yet. Start learning to unlock your first badge! ✨
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredEarned.map(badge => (
                  <BadgeCard 
                    key={badge.id} 
                    badge={badge} 
                    rarityColor={getRarityColor(badge.rarity)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Section (with extracted components) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Next Up (with extracted component) */}
          <Card className="border-0 shadow-2xl rounded-3xl bg-white dark:bg-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-green-400 via-teal-400 to-blue-500 px-6 py-4">
              <CardTitle className="text-white flex items-center gap-3 text-xl font-black">
                <Award className="h-5 w-5" /> 
                Almost There! 
                <span className="text-2xl">🎯</span>
              </CardTitle>
              <CardDescription className="text-white/90 font-semibold">
                Badges you can earn soon! 🚀
              </CardDescription>
            </div>
            <CardContent className="p-6 space-y-6">
              {upcomingBadges.length === 0 ? (
                <div className="text-sm text-gray-600 dark:text-gray-300">No upcoming badges yet. Start a lesson to begin your journey! ✨</div>
              ) : (
                upcomingBadges.map((badge, index) => (
                  <UpcomingBadge key={index} badge={badge} />
                ))
              )}
            </CardContent>
          </Card>

          {/* Level Progress (with extracted component) */}
          <Card className="border-0 shadow-2xl xl:col-span-2 rounded-3xl bg-white dark:bg-gray-800 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-500 px-6 py-4">
              <CardTitle className="text-white flex items-center gap-3 text-xl font-black">
                <Crown className="h-5 w-5" /> 
                Level Journey! 
                <span className="text-2xl">👑</span>
              </CardTitle>
              <CardDescription className="text-white/90 font-semibold">
                Your amazing progress through the levels! 🌟
              </CardDescription>
            </div>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {levelStats.map((level, index) => (
                  <LevelCard key={index} level={level} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rewards Section */}
        <Card className="border-0 shadow-2xl rounded-3xl bg-white dark:bg-gray-800 overflow-hidden">
          <div className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-500 px-6 py-4">
            <CardTitle className="text-white flex items-center gap-3 text-2xl font-black">
              <Gift className="h-6 w-6" /> 
              Special Rewards! 
              <span className="text-3xl">🎁</span>
            </CardTitle>
            <CardDescription className="text-white/90 text-lg font-semibold">
              Amazing prizes you unlock as you progress! 🌟
            </CardDescription>
          </div>
          <CardContent className="p-8">
            <div className="text-center text-sm text-gray-600 dark:text-gray-300">
              Keep learning to unlock rewards!
            </div>
          </CardContent>
        </Card>

        {/* Motivational Message */}
        <div className="text-center">
          <Card className="border-0 rounded-3xl shadow-xl bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 text-white max-w-lg mx-auto overflow-hidden transform hover:scale-105 transition-all">
            <CardContent className="p-8">
              <div className="text-5xl mb-4">🌟</div>
              <p className="text-2xl font-black mb-3">You're a Learning Superstar!</p>
              <p className="text-lg font-semibold mb-4">Keep collecting badges and leveling up! Every achievement makes you stronger! 💪✨</p>
              <Button className="bg-white text-purple-600 hover:bg-gray-100 rounded-2xl font-bold text-lg px-6 py-3 transform hover:scale-105 transition-all">
                Keep Learning! 🚀
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}