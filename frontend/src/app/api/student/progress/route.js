import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import connectDB from '@/lib/db'
import Progress from '@/models/progressModel'

const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n))

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await connectDB()
    let progress = await Progress.findOne({ clerkId: userId }).lean()

    if (!progress) progress = { clerkId: userId, courses: [], streak: { current: 0, lastActiveAt: null } }

    const allLessons = progress.courses.flatMap(c => c.lessons || [])
    const scorable = allLessons.filter(l => typeof l.score === 'number')
    const avgScore = scorable.length ? Math.round(scorable.reduce((a, l) => a + l.score, 0) / scorable.length) : 0
    const totalTime = progress.courses.reduce((a, c) => a + (c.totalTimeSpent || 0), 0)
    const totalCompleted = progress.courses.reduce((a, c) => a + (c.completedLessons || 0), 0)

    return NextResponse.json({
      progress: {
        ...progress,
        totalTimeSpent: totalTime,
        totalLessonsCompleted: totalCompleted,
        averageScoreAcrossAll: avgScore
      }
    })
  } catch (err) {
    console.error('Progress GET error:', err)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      courseId, courseTitle, courseDescription = '', subject, grade = 'N/A',
      resourceId, resourceType, lessonTitle, timeSpent = 0, completed = false, score = null
    } = body || {}

    if (!courseId || !resourceId || !resourceType || !lessonTitle || !courseTitle || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()
    let doc = await Progress.findOne({ clerkId: userId })
    if (!doc) doc = new Progress({ clerkId: userId, courses: [] })

    let course = doc.courses.find(c => c.courseId === courseId)
    if (!course) {
      course = {
        courseId, title: courseTitle, description: courseDescription, subject, grade,
        isActive: true, lessons: [], totalLessons: 0, completedLessons: 0, overallProgress: 0, totalTimeSpent: 0, averageScore: 0
      }
      doc.courses.push(course)
    } else {
      course.title = courseTitle || course.title
      course.description = courseDescription || course.description
      course.subject = subject || course.subject
      course.grade = grade || course.grade
      course.isActive = true
    }

    let lesson = course.lessons.find(l => l.resourceId === String(resourceId))
    if (!lesson) {
      lesson = { resourceId: String(resourceId), resourceType, title: lessonTitle, completed: !!completed, timeSpent: Math.max(0, timeSpent || 0), score: typeof score === 'number' ? score : null }
      course.lessons.push(lesson)
    } else {
      lesson.completed = lesson.completed || !!completed
      lesson.timeSpent = (lesson.timeSpent || 0) + Math.max(0, timeSpent || 0)
      if (typeof score === 'number') lesson.score = score
    }

    course.totalLessons = course.lessons.length
    course.completedLessons = course.lessons.filter(l => l.completed).length
    course.totalTimeSpent = course.lessons.reduce((a, l) => a + (l.timeSpent || 0), 0)
    const scorable = course.lessons.filter(l => typeof l.score === 'number')
    course.averageScore = scorable.length ? Math.round(scorable.reduce((a, l) => a + l.score, 0) / scorable.length) : 0
    course.overallProgress = course.totalLessons > 0 ? clamp(Math.round((course.completedLessons / course.totalLessons) * 100)) : 0

    const today = new Date()
    if (!doc.streak) doc.streak = { current: 0, lastActiveAt: null }
    const last = doc.streak.lastActiveAt ? new Date(doc.streak.lastActiveAt) : null
    const diffDays = last ? Math.floor((today - new Date(last.toDateString())) / (1000 * 60 * 60 * 24)) : null
    if (diffDays === null || diffDays >= 1) {
      doc.streak.current = (diffDays === 1 || diffDays === null) ? (doc.streak.current || 0) + 1 : 1
      doc.streak.lastActiveAt = today
    } else {
      doc.streak.lastActiveAt = today
    }

    await doc.save()
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Progress POST error:', err)
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}