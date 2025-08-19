'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import PPTXViewer from '@/components/ui/pptx-viewer'
import { CarouselWithControls } from '@/components/ui/carousel'
import { MarkdownStyles } from '@/components/chat/Markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const Section = ({ title, children }) => (
  <div className="space-y-2">
    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">{title}</h3>
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3">{children}</div>
  </div>
)

export default function LearningResourceDialog({ open, onOpenChange, resource, onCompleted }) {
  const [loading, setLoading] = useState(false)
  const [contentDoc, setContentDoc] = useState(null)
  const [assessmentDoc, setAssessmentDoc] = useState(null)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(null)

  const reset = () => {
    setLoading(false)
    setContentDoc(null)
    setAssessmentDoc(null)
    setAnswers({})
    setSubmitted(false)
    setScore(null)
  }

  useEffect(() => {
    if (!open) {
      reset()
      return
    }
    const init = async () => {
      if (!resource) return
      try {
        if (resource.resourceType === 'content') {
          setLoading(true)
          const resourceId = resource.resourceId || resource._id
          console.log('Fetching content for ID:', resourceId)
          
          const res = await fetch(`/api/content/${resourceId}`, { cache: 'no-store' })
          const data = await res.json()
          
          if (res.ok && data.content) {
            console.log('Found content doc:', data.content)
            setContentDoc(data.content)
          } else {
            console.log('Content not found or error:', data.error)
            setContentDoc(null)
          }
        } else if (resource.resourceType === 'assessment') {
          setLoading(true)
          const resourceId = resource.resourceId || resource._id
          console.log('Fetching assessment for ID:', resourceId)
          
          const res = await fetch(`/api/assessments/${resourceId}`, { cache: 'no-store' })
          const data = await res.json()
          
          if (res.ok && data.assessment) {
            console.log('Found assessment doc:', data.assessment)
            setAssessmentDoc(data.assessment)
          } else {
            console.log('Assessment not found or error:', data.error)
            setAssessmentDoc(null)
          }
        }
      } catch (error) {
        console.error('Error fetching resource details:', error)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [open, resource])

  const handleSubmitAssessment = () => {
    if (!assessmentDoc) return
    let totalPoints = 0
    let earned = 0
    const qList = assessmentDoc.questions || []
    qList.forEach((q, idx) => {
      const pts = q.points || 1
      totalPoints += pts
      const given = answers[idx]
      const correct = normalizeAnswer(q.type, q.correctAnswer)
      const givenNorm = normalizeAnswer(q.type, given)
      const isCorrect = givenNorm !== undefined && givenNorm !== null && shallowEqualAnswer(q.type, correct, givenNorm)
      if (isCorrect) earned += pts
    })
    const percent = totalPoints > 0 ? (earned / totalPoints) * 100 : 0
    setScore({ earned, totalPoints, percent })
    setSubmitted(true)
    if (onCompleted) onCompleted(percent)
  }

  const contentToShow = useMemo(() => {
    if (resource?.resourceType !== 'content') return ''
    const text = contentDoc?.generatedContent || ''
    console.log('Content to show:', text) // Add debugging
    return typeof text === 'string' ? text : JSON.stringify(text, null, 2)
  }, [resource, contentDoc])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span>{resource?.title || 'Learning'}</span>
            {resource?.subject && (
              <Badge className="ml-auto">{resource.subject}</Badge>
            )}
          </DialogTitle>
          {/* Add DialogDescription for accessibility */}
          <DialogDescription className="sr-only">
            Learning resource viewer for {resource?.title || 'educational content'}
          </DialogDescription>
        </DialogHeader>

        {!resource ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        ) : resource.resourceType === 'slides' ? (
          <PPTXViewer
            presentationUrl={resource.contentDetails?.presentationUrl || resource.presentationUrl}
            downloadUrl={resource.contentDetails?.downloadUrl || resource.downloadUrl}
            title={resource.title}
            slideCount={resource.contentDetails?.slideCount}
            status="SUCCESS"
          />
        ) : resource.resourceType === 'comic' ? (
          <Section title="Comic Panels">
            {!!(resource.contentDetails?.images?.length) ? (
              <CarouselWithControls 
                items={resource.contentDetails.images || []} 
                renderItem={(image, index) => (
                  <div className="flex items-center justify-center">
                    <img
                      src={image}
                      alt={`Comic panel ${index + 1}`}
                      className="max-h-[75vh] max-w-full rounded-xl object-contain"
                    />
                  </div>
                )}
              />
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-300">
                No panels available.
              </div>
            )}
          </Section>
        ) : resource.resourceType === 'image' ? (
          <Section title="Image">
            {resource.contentDetails?.imageUrl ? (
              <div className="flex items-center justify-center">
                <img
                  src={resource.contentDetails.imageUrl}
                  alt={resource.title}
                  className="max-h-[75vh] max-w-full rounded-xl object-contain"
                />
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-300">Image not found.</div>
            )}
          </Section>
        ) : resource.resourceType === 'content' ? (
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              </div>
            ) : (
              <>
                <Section title="Lesson Content">
                  <div className="prose dark:prose-invert max-w-none text-sm leading-6 max-h-[75vh] overflow-y-auto">
                    {contentToShow ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                        {contentToShow}
                      </ReactMarkdown>
                    ) : (
                      <div className="text-gray-500 dark:text-gray-400">
                        <p>No content available for this resource.</p>
                        <p className="text-xs mt-2">Resource ID: {resource.resourceId || resource._id}</p>
                        <p className="text-xs">Content Doc: {contentDoc ? 'Found' : 'Not found'}</p>
                      </div>
                    )}
                  </div>
                </Section>
              </>
            )}
          </div>
        ) : resource.resourceType === 'assessment' ? (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
              </div>
            ) : !assessmentDoc ? (
              <div className="text-sm text-gray-600 dark:text-gray-300">Assessment not found.</div>
            ) : (
              <>
                {(assessmentDoc.questions || []).map((q, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                    <div className="font-medium text-gray-800 dark:text-gray-200 text-base">
                      Q{idx + 1}. {q.question}
                    </div>

                    {q.type === 'mcq' && (
                      <div className="space-y-2">
                        {(q.options || []).map((opt, i) => (
                          <label key={i} className="flex items-center gap-3 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                            <input
                              type="radio"
                              name={`q_${idx}`}
                              className="accent-purple-600"
                              checked={answers[idx] === opt}
                              onChange={() => setAnswers(a => ({ ...a, [idx]: opt }))}
                              disabled={submitted}
                            />
                            <span className="flex-1">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {q.type === 'true_false' && (
                      <div className="flex items-center gap-6 text-sm">
                        {['true','false'].map(v => (
                          <label key={v} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors">
                            <input
                              type="radio"
                              name={`q_${idx}`}
                              className="accent-purple-600"
                              checked={String(answers[idx]).toLowerCase() === v}
                              onChange={() => setAnswers(a => ({ ...a, [idx]: v }))}
                              disabled={submitted}
                            />
                            <span className="capitalize font-medium">{v}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {(q.type === 'short_answer' || q.type === 'long_answer' || q.type === 'diagram') && (
                      <textarea
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent p-3 text-sm resize-none"
                        rows={q.type === 'long_answer' ? 6 : 4}
                        placeholder="Write your answer..."
                        value={answers[idx] || ''}
                        onChange={(e) => setAnswers(a => ({ ...a, [idx]: e.target.value }))}
                        disabled={submitted}
                      />
                    )}

                    {submitted && (
                      <div className="mt-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        {showAnswerFeedback(q, answers[idx])}
                      </div>
                    )}
                  </div>
                ))}

                {!submitted ? (
                  <Button onClick={handleSubmitAssessment} className="rounded-xl px-8 py-3 text-base">
                    Submit Assessment
                  </Button>
                ) : (
                  <div className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl border">
                    <div className="text-lg font-semibold text-center">
                      Score: {score?.earned || 0}/{score?.totalPoints || 0} ({Math.round(score?.percent || 0)}%)
                    </div>
                    <Button onClick={() => onOpenChange(false)} variant="outline" className="rounded-xl w-full">
                      Close
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-300">Viewer not available for this resource.</div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function normalizeAnswer(type, value) {
  if (value === undefined || value === null) return value
  if (type === 'true_false') {
    const v = String(value).trim().toLowerCase()
    if (v === 'true') return true
    if (v === 'false') return false
    return value
  }
  if (type === 'mcq') {
    return String(value).trim()
  }
  if (type === 'short_answer' || type === 'long_answer') {
    return String(value).trim().toLowerCase()
  }
  return value
}

function shallowEqualAnswer(type, correct, given) {
  if (type === 'true_false') return Boolean(correct) === Boolean(given)
  if (type === 'mcq') return String(correct) === String(given)
  if (type === 'short_answer' || type === 'long_answer') {
    return String(correct || '').trim().toLowerCase() === String(given || '').trim().toLowerCase()
  }
  return false
}

function showAnswerFeedback(q, givenRaw) {
  const correct = normalizeAnswer(q.type, q.correctAnswer)
  const given = normalizeAnswer(q.type, givenRaw)
  const ok = shallowEqualAnswer(q.type, correct, given)
  return (
    <div className={ok ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
      {ok ? 'Correct! 🎉' : (
        <span>
          Incorrect. Correct answer: <span className="font-semibold">{String(q.correctAnswer ?? '—')}</span>
        </span>
      )}
    </div>
  )
}