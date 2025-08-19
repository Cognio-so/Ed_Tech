// frontend/src/app/api/student/learning-resources/route.js
import { NextResponse } from 'next/server'
import connectDB from '@/lib/db'
import { auth } from '@clerk/nextjs/server'
import Presentation from '@/models/presentationModel'
import Assessment from '@/models/assessmentModel'
import Content from '@/models/contentModel'
import Comic from '@/models/comicModel'
import ImageModel from '@/models/imageModel'
import WebSearch from '@/models/webSearchModel'

const truncate = (str = '', n = 120) => (str.length > n ? str.slice(0, n) + '…' : str)

export async function GET(request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const subjectFilter = searchParams.get('subject') || 'All'
    const search = (searchParams.get('search') || '').trim().toLowerCase()
    const limit = parseInt(searchParams.get('limit') || '0', 10)

    await connectDB()

    const [presentations, assessments, contents, comics, images, webSearches] = await Promise.all([
      Presentation.find({ }),
      Assessment.find({ }),
      Content.find({ }),
      Comic.find({ }),
      ImageModel.find({ }),
      WebSearch.find({ })
    ])

    const resources = []

    // Slides (Presentations)
    for (const p of presentations) {
      resources.push({
        _id: p._id,
        resourceId: p._id,
        resourceType: 'slides',
        title: p.title || p.topic || 'Presentation',
        description: truncate(p.topic || p.customInstructions || ''),
        subject: 'Computer Science', // fallback since model has no subject
        grade: 'N/A',
        estimatedTimeMinutes: Math.max(5, p.slideCount ? p.slideCount : 10),
        difficulty: 'medium',
        contentDetails: {
          presentationUrl: p.presentationUrl || p.downloadUrl || null,
          slideCount: p.slideCount
        },
        createdAt: p.createdAt
      })
    }

    // Assessments
    for (const a of assessments) {
      resources.push({
        _id: a._id,
        resourceId: a._id,
        resourceType: 'assessment',
        title: a.title,
        description: truncate(a.description || `${a.questions?.length || 0} questions`),
        subject: a.subject,
        grade: a.grade,
        estimatedTimeMinutes: a.duration || 10,
        difficulty: 'medium',
        contentDetails: {
          questionsCount: a.questions?.length || 0
        },
        createdAt: a.createdAt
      })
    }

    // Content (generated lessons/notes/etc.)
    for (const c of contents) {
      const text = typeof c.generatedContent === 'string' ? c.generatedContent : ''
      resources.push({
        _id: c._id,
        resourceId: c._id,
        resourceType: 'content',
        title: c.topic,
        description: truncate(c.objectives || text),
        subject: c.subject,
        grade: c.grade,
        estimatedTimeMinutes: Math.min(60, Math.max(5, Math.round(text.split(/\s+/).length / 200 * 5) || 8)),
        difficulty: 'medium',
        contentDetails: {
          contentType: c.contentType
        },
        createdAt: c.createdAt
      })
    }

    // Comics
    for (const cm of comics) {
      resources.push({
        _id: cm._id,
        resourceId: cm._id,
        resourceType: 'comic',
        title: `Comic: ${truncate(cm.instructions, 60)}`,
        description: `${cm.panels?.length || cm.images?.length || cm.numPanels} panels`,
        subject: 'Art',
        grade: cm.gradeLevel,
        estimatedTimeMinutes: Math.max(3, (cm.panels?.length || cm.numPanels || 4)),
        difficulty: 'easy',
        contentDetails: {
          images: cm.images || [],
          firstImageUrl: (cm.images && cm.images[0]) || (cm.panels && cm.panels[0]?.imageUrl) || null
        },
        createdAt: cm.createdAt
      })
    }

    // Images
    for (const im of images) {
      resources.push({
        _id: im._id,
        resourceId: im._id,
        resourceType: 'image',
        title: `${im.visualType}: ${im.topic}`,
        description: truncate(im.instructions),
        subject: im.subject,
        grade: im.gradeLevel,
        estimatedTimeMinutes: 1,
        difficulty: im.difficultyFlag === 'true' ? 'hard' : 'easy',
        contentDetails: {
          imageUrl: im.imageUrl
        },
        createdAt: im.createdAt
      })
    }

    // Web Searches
    for (const ws of webSearches) {
      resources.push({
        _id: ws._id,
        resourceId: ws._id,
        resourceType: 'websearch',
        title: `Web Search: ${ws.topic}`,
        description: truncate(ws.query || ws.topic),
        subject: ws.subject || 'General',
        grade: ws.gradeLevel || 'N/A',
        estimatedTimeMinutes: Math.min(30, Math.max(5, Math.round(ws.searchResults.split(/\s+/).length / 300 * 5) || 10)),
        difficulty: ws.comprehension === 'advanced' ? 'hard' : (ws.comprehension === 'basic' ? 'easy' : 'medium'),
        contentDetails: {
          contentType: ws.contentType || 'web search',
          searchQuery: ws.query,
          searchResults: ws.searchResults
        },
        createdAt: ws.createdAt
      })
    }

    // Filter by subject
    let filtered = resources
    if (subjectFilter && subjectFilter !== 'All') {
      filtered = filtered.filter(r => (r.subject || '').toLowerCase() === subjectFilter.toLowerCase())
    }

    // Search filter
    if (search) {
      filtered = filtered.filter(r => {
        const hay = `${r.title || ''} ${r.description || ''} ${r.subject || ''} ${r.grade || ''}`.toLowerCase()
        return hay.includes(search)
      })
    }

    // Sort by newest
    filtered.sort((a, b) => (new Date(b.createdAt || 0)) - (new Date(a.createdAt || 0)))

    // Limit if requested
    const out = limit > 0 ? filtered.slice(0, limit) : filtered

    return NextResponse.json({ resources: out })
  } catch (error) {
    console.error('learning-resources GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch learning resources' }, { status: 500 })
  }
}
