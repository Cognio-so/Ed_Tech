'use client'
import React, { useEffect, useState, useCallback } from "react"
import { Eye, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { MarkdownStyles } from "@/components/chat/Markdown"

const WebContentCurator = () => {
  const [form, setForm] = useState({
    topic: "",
    subject: "",
    gradeLevel: "",
    contentType: "articles",
    language: "English",
    comprehension: "intermediate",
    maxResults: 10,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [resultText, setResultText] = useState("")
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState(null)

  const fetchSaved = useCallback(async () => {
    try {
      const res = await fetch('/api/web-search', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) setSaved(data.items || [])
    } catch {}
  }, [])

  useEffect(() => {
    fetchSaved()
  }, [fetchSaved])

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError(null)
    setResultText("")
    try {
      const res = await fetch('/api/web-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to perform web search')
      setResultText(data.content)
      if (data.saved) setSaved((prev) => [data.saved, ...prev])
      else fetchSaved()
    } catch (e) {
      setError(e.message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreview = (item) => {
    setPreviewItem(item)
    setPreviewOpen(true)
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/web-search?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }
      setSaved((prev) => prev.filter((x) => x._id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDownloadMd = (content, filename = 'web-search.md') => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const formatTime = (dateStr) => {
    try { return new Date(dateStr).toLocaleString() } catch { return '' }
  }

  const canGenerate = form.topic && form.subject && form.gradeLevel

  const subjects = [
    { value: 'Biology', label: 'Biology' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Geography', label: 'Geography' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'History', label: 'History' },
    { value: 'English', label: 'English' },
    { value: 'Arabic', label: 'Arabic' },
  ]

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Search Topic</Label>
              <Input
                id="topic"
                placeholder="Enter educational topic to search..."
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={form.subject} onValueChange={(value) => setForm({ ...form, subject: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Biology">Biology</SelectItem>
                  <SelectItem value="Physics">Physics</SelectItem>
                  <SelectItem value="Chemistry">Chemistry</SelectItem>
                  <SelectItem value="Geography">Geography</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="gradeLevel">Grade Level</Label>
              <Select value={form.gradeLevel} onValueChange={(value) => setForm({ ...form, gradeLevel: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {['5','6','7','8','9','10','11','12'].map(g => (
                    <SelectItem key={g} value={g}>{g}th Grade</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={form.contentType} onValueChange={(value) => setForm({ ...form, contentType: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="articles">Articles & Blogs</SelectItem>
                  <SelectItem value="videos">Educational Videos</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="language">Language</Label>
                <Select value={form.language} onValueChange={(value) => setForm({ ...form, language: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                   
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="comprehension">Comprehension</Label>
                <Select value={form.comprehension} onValueChange={(value) => setForm({ ...form, comprehension: value })}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Comprehension" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90 text-white"
          >
            {isGenerating ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {error && <div className="text-red-600 text-sm mt-4">{error}</div>}

        {resultText && (
          <div className="mt-6 p-4 border rounded-xl bg-background">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>{resultText}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Saved Web Searches</h3>
          <Badge variant="secondary">{saved.length}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map((item) => (
            <div key={item._id} className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow p-4">
              <div className="text-sm font-semibold line-clamp-2">{item.topic}</div>
              <div className="text-xs text-muted-foreground">{item.subject} • {item.contentType}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{formatTime(item.createdAt)}</div>
              <div className="mt-3 text-xs text-muted-foreground line-clamp-4">
                {item.searchResults?.slice(0, 220)}{item.searchResults?.length > 220 ? '…' : ''}
              </div>
              <div className="mt-3 flex items-center gap-2 justify-end">
                <Button size="icon" variant="outline" onClick={() => handlePreview(item)}><Eye className="h-4 w-4" /></Button>
                <Button size="icon" variant="outline" onClick={() => handleDownloadMd(item.searchResults || '', `${item.topic || 'web-search'}.md`)}><Download className="h-4 w-4" /></Button>
                <Button size="icon" variant="outline" onClick={() => handleDelete(item._id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[80%] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewItem?.topic || 'Preview'}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm dark:prose-invert max-w-[800px]">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>{previewItem?.searchResults || ''}</ReactMarkdown>
          </div>
          <div className="text-xs text-muted-foreground">
            {previewItem?.subject} • {previewItem?.contentType} • {formatTime(previewItem?.createdAt)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default WebContentCurator