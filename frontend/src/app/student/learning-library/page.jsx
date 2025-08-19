'use client'

import React, { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Play, FileText, Gamepad2, Film, ExternalLink, Search, Star, Sparkles, BookOpen, Image as ImageIcon, Loader2, RefreshCw, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import StartLearningButton from '@/components/StartLearningButton'
import LearningResourceDialog from '@/components/LearningResourceDialog'

const gradients = {
  Math: 'from-yellow-300 via-orange-300 to-red-400',
  Science: 'from-green-300 via-blue-300 to-purple-400',
  English: 'from-pink-300 via-purple-300 to-indigo-400',
  History: 'from-amber-300 via-orange-400 to-red-400',
  Art: 'from-purple-300 via-pink-300 to-red-300',
  Geography: 'from-green-400 via-teal-400 to-blue-500',
  Physics: 'from-blue-400 via-indigo-400 to-purple-500',
  Chemistry: 'from-green-400 via-emerald-400 to-teal-500',
  Biology: 'from-green-300 via-lime-300 to-emerald-400',
  'Computer Science': 'from-gray-400 via-blue-400 to-indigo-500'
}

const subjects = ['All', 'Math', 'Science', 'History', 'English', 'Art', 'Geography', 'Physics', 'Chemistry', 'Biology', 'Computer Science']

const typeCharacters = {
  slides: '📊',
  video: '🎬', 
  comic: '📖',
  image: '🖼️',
  content: '📝',
  assessment: '📋',
  external: '🌐'
}

const LibraryCharacter = () => (
  <div className="hidden lg:block absolute right-4 top-4">
    <div className="relative w-24 h-24">
      <div className="absolute inset-0 text-5xl" style={{ animation: 'gentle-bounce 4s ease-in-out infinite' }}>📚</div>
      <div className="absolute -top-2 -right-2 text-xl" style={{ animation: 'gentle-spin 6s linear infinite' }}>⭐</div>
      <div className="absolute -top-6 right-2 text-lg" style={{ animation: 'gentle-pulse 3s ease-in-out infinite' }}>✨</div>
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
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  </div>
)

export default function LearningLibraryPage() {
  const [selectedSubject, setSelectedSubject] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('slides')
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  // dialog state
  const [viewerOpen, setViewerOpen] = useState(false)
  const [activeResource, setActiveResource] = useState(null)

  // completion tracking
  const [completedIds, setCompletedIds] = useState(new Set())

  const fetchResources = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedSubject !== 'All') params.append('subject', selectedSubject)
      if (searchTerm) params.append('search', searchTerm)
      const response = await fetch(`/api/student/learning-resources?${params}`)
      const data = await response.json()
      if (response.ok) {
        console.log('Fetched resources:', data.resources) // Add debugging
        setResources(data.resources || [])
      } else {
        console.error('API error:', data.error)
        toast.error('Failed to load learning resources')
      }
    } catch (error) {
      console.error('Error fetching resources:', error)
      toast.error('Failed to load learning resources')
    } finally {
      setLoading(false)
    }
  }

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/student/progress', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) return
      const set = new Set()
      const courses = data?.progress?.courses || []
      for (const c of courses) {
        for (const l of c.lessons || []) {
          if (l.completed) set.add(String(l.resourceId))
        }
      }
      setCompletedIds(set)
    } catch {}
  }

  const syncResources = async () => {
    setSyncing(true)
    try {
      const response = await fetch('/api/student/sync-resources', { method: 'POST' })
      const data = await response.json()
      if (response.ok) {
        toast.success(data.message)
        fetchResources()
      } else toast.error('Failed to sync resources')
    } catch (error) {
      console.error('Error syncing resources:', error)
      toast.error('Failed to sync resources')
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [selectedSubject, searchTerm])

  useEffect(() => {
    fetchProgress()
  }, [])

  const filteredResources = resources.filter(resource => {
    if (activeTab === 'external') return resource.resourceType === 'external' || resource.externalUrl
    return resource.resourceType === activeTab
  })

  const getItemColor = (subject) => gradients[subject] || 'from-gray-300 to-gray-400'

  const startLearning = async (resource) => {
    try {
      await fetch('/api/student/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: resource.courseId || `course_${resource.subject}_${resource.grade}`,
          courseTitle: `${resource.subject} - Grade ${resource.grade}`,
          courseDescription: `Learning ${resource.subject} concepts`,
          subject: resource.subject,
          grade: resource.grade,
          resourceId: resource.resourceId || resource._id,
          resourceType: resource.resourceType,
          lessonTitle: resource.title,
          timeSpent: 1,
          completed: false
        })
      })
      setActiveResource(resource)
      setViewerOpen(true)
    } catch (error) {
      console.error('Error starting resource:', error)
      toast.error('Failed to start resource')
    }
  }

  const renderGrid = (resourceList) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {resourceList.map((resource) => {
        const rid = String(resource.resourceId || resource._id)
        const isCompleted = completedIds.has(rid)
        return (
          <Card 
            key={resource._id} 
            className="border-0 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 overflow-hidden group"
            onClick={() => startLearning(resource)}
          >
            <div className={`relative h-28 bg-gradient-to-br ${getItemColor(resource.subject)} flex items-center justify-center`}>
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-2 left-2 w-5 h-5 bg-white rounded-full"></div>
                <div className="absolute top-3 right-3 w-4 h-4 bg-white rounded-full"></div>
                <div className="absolute bottom-2 left-3 w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div className="relative z-10 text-4xl transition-transform duration-300 group-hover:scale-110">
                {typeCharacters[resource.resourceType] || '📄'}
              </div>
              {isCompleted && (
                <div className="absolute right-2 top-2">
                  <Badge className="bg-emerald-600 text-white border-0 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Completed
                  </Badge>
                </div>
              )}
            </div>
            <CardContent className="p-4 h-full flex flex-col">
              <div className="space-y-2 flex-1">
                <div>
                  <h3 className="font-bold text-base text-gray-800 dark:text-white line-clamp-2">{resource.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">{resource.description}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge className={`bg-gradient-to-r ${getItemColor(resource.subject)} text-white border-0 font-semibold text-xs`}>
                      {resource.subject}
                    </Badge>
                    <Badge variant="outline" className="text-xs">Grade {resource.grade}</Badge>
                    <Badge variant="outline" className="text-xs">{resource.difficulty}</Badge>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                      ⏰ {resource.estimatedTimeMinutes} min
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <StartLearningButton resource={resource} onStart={startLearning} completed={isCompleted} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const getTabIcon = (tabValue) => {
    switch(tabValue) {
      case 'slides': return <FileText className="mr-1 h-4 w-4" />
      case 'video': return <Film className="mr-1 h-4 w-4" />
      case 'comic': return <BookOpen className="mr-1 h-4 w-4" />
      case 'image': return <ImageIcon className="mr-1 h-4 w-4" />
      case 'content': return <FileText className="mr-1 h-4 w-4" />
      case 'assessment': return <Gamepad2 className="mr-1 h-4 w-4" />
      case 'external': return <ExternalLink className="mr-1 h-4 w-4" />
      default: return <FileText className="mr-1 h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <Card className="relative border-0 rounded-2xl shadow-md bg-white dark:bg-gray-800">
          <LibraryCharacter />
          <div className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  Learning Library! <span className="text-3xl">📚</span>
                </h1>
                <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-gray-300">
                  Explore fun slides, videos, comics, and more! ✨
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <Button 
                  onClick={syncResources}
                  disabled={syncing}
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold text-sm px-4 py-2"
                >
                  {syncing ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-1 h-4 w-4" />
                  )}
                  {syncing ? 'Syncing...' : 'Sync Content'}
                </Button>
                <div className="relative w-full sm:w-64">
                  <div className="flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-sm px-3 py-2">
                    <Search className="h-4 w-4 text-purple-500 mr-2" />
                    <input 
                      placeholder="Search content..." 
                      className="bg-transparent outline-none text-sm font-medium text-gray-800 dark:text-white flex-1"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {subjects.map(subject => (
                <Badge 
                  key={subject} 
                  variant={selectedSubject === subject ? "default" : "outline"} 
                  className={`whitespace-nowrap cursor-pointer font-semibold text-xs px-3 py-1 rounded-full transition-all hover:scale-105 ${
                    selectedSubject === subject 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0' 
                      : 'hover:bg-purple-100 dark:hover:bg-purple-800'
                  }`}
                  onClick={() => setSelectedSubject(subject)}
                >
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="flex flex-wrap justify-start gap-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2">
            {['slides', 'video', 'comic', 'image', 'content', 'assessment', 'external'].map((tab, index) => (
              <TabsTrigger 
                key={tab}
                value={tab} 
                className={`flex items-center rounded-xl font-semibold text-xs px-3 py-2 transition-all data-[state=active]:text-white ${
                  index === 0 ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-400 data-[state=active]:to-purple-500' :
                  index === 1 ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-400 data-[state=active]:to-blue-500' :
                  index === 2 ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-400 data-[state=active]:to-red-500' :
                  index === 3 ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-400 data-[state=active]:to-orange-500' :
                  index === 4 ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-400 data-[state=active]:to-blue-500' :
                  index === 5 ? 'data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-400 data-[state=active]:to-pink-500' :
                  'data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-400 data-[state=active]:to-pink-500'
                }`}
              >
                {getTabIcon(tab)}
                <span className="hidden sm:inline capitalize">{tab === 'external' ? 'Links' : tab}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {['slides', 'video', 'comic', 'image', 'content', 'assessment'].map(tab => (
            <TabsContent key={tab} value={tab}>
              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                </div>
              ) : (
                <>
                  {filteredResources.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">🔍</div>
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-white">No {tab} found</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Try adjusting your filters or sync more content</p>
                      <Button onClick={syncResources} disabled={syncing} className="mt-3 rounded-xl font-semibold text-sm">
                        {syncing ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}
                        Sync More Content
                      </Button>
                    </div>
                  ) : (
                    renderGrid(filteredResources)
                  )}
                </>
              )}
            </TabsContent>
          ))}

          <TabsContent value="external">
            <Card className="border-0 rounded-2xl shadow-md bg-white dark:bg-gray-800">
              <div className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 px-4 py-4">
                <CardTitle className="text-white text-xl font-bold flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" /> Amazing External Resources!
                </CardTitle>
                <CardDescription className="text-white/90 text-sm font-medium mt-1">
                  Fun links and activities for you! 🎯
                </CardDescription>
              </div>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-base text-gray-800 dark:text-white">Educational Websites 🎓</h3>
                    {['Khan Academy Kids 👶', 'Scratch Programming 💻', 'NASA Kids Club 🚀'].map((site, i) => (
                      <div key={i} className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-800 dark:to-purple-800 rounded-xl p-3 flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-800 dark:text-white truncate">{site}</span>
                        <Button className="rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-3 py-1">
                          Visit! 🌟
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold text-base text-gray-800 dark:text-white">Fun Activities 🎨</h3>
                    {['Art & Crafts 🎨', 'Science Experiments 🧪', 'Math Puzzles 🧩'].map((activity, i) => (
                      <div key={i} className="bg-gradient-to-r from-pink-100 to-orange-100 dark:from-pink-800 dark:to-orange-800 rounded-xl p-3 flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-800 dark:text-white truncate">{activity}</span>
                        <Button className="rounded-full bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-semibold px-3 py-1">
                          Try It! 🚀
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { icon: '📚', value: resources.length, label: 'Amazing Resources!' },
            { icon: '⏰', value: resources.reduce((acc, item) => acc + (item.estimatedTimeMinutes || 0), 0), label: 'Minutes of Fun!' },
            { icon: '🎯', value: subjects.length - 1, label: 'Subjects to Explore!' }
          ].map((stat, index) => (
            <Card 
              key={index} 
              className={`border-0 rounded-2xl shadow-md bg-gradient-to-br ${
                index === 0 ? 'from-yellow-300 to-orange-400' :
                index === 1 ? 'from-green-300 to-blue-400' :
                'from-purple-300 to-pink-400'
              } text-white`}
            >
              <CardContent className="p-4 text-center">
                <div className="text-3xl mb-1">{stat.icon}</div>
                <p className="text-xl font-semibold">{stat.value}</p>
                <p className="text-sm font-medium">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <LearningResourceDialog
        open={viewerOpen}
        onOpenChange={(v) => {
          setViewerOpen(v)
          if (!v) fetchProgress()
        }}
        resource={activeResource}
        onCompleted={(scorePercent) => {
          if (!activeResource) return
          fetch('/api/student/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              courseId: activeResource.courseId || `course_${activeResource.subject}_${activeResource.grade}`,
              courseTitle: `${activeResource.subject} - Grade ${activeResource.grade}`,
              courseDescription: `Learning ${activeResource.subject} concepts`,
              subject: activeResource.subject,
              grade: activeResource.grade,
              resourceId: activeResource.resourceId || activeResource._id,
              resourceType: activeResource.resourceType,
              lessonTitle: activeResource.title,
              timeSpent: 5,
              completed: true,
              score: typeof scorePercent === 'number' ? Math.round(scorePercent) : null
            })
          }).finally(() => {
            fetchProgress()
          })
        }}
      />
    </div>
  )
}