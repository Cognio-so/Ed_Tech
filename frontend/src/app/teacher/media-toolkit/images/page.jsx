'use client'
import React, { useEffect, useState, useCallback } from "react"
import { Eye, Download, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const ImageGenerator = () => {
  const [form, setForm] = useState({
    topic: "",
    subject: "",
    gradeLevel: "",
    visualType: "",
    instructions: "",
    difficultyFlag: false,
    language: "English",
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState([])
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState(null)

  const fetchSaved = useCallback(async () => {
    try {
      const res = await fetch('/api/images', { cache: 'no-store' })
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
    setImageUrl(null)
    try {
      const res = await fetch('/api/images/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: form.topic,
          gradeLevel: form.gradeLevel,
          subject: form.subject,
          visualType: form.visualType, // image | diagram | chart
          instructions: form.instructions || form.topic,
          difficultyFlag: form.difficultyFlag,
          language: form.language,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate image')
      setImageUrl(data.imageUrl)
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
      const res = await fetch(`/api/images?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }
      setSaved((prev) => prev.filter((x) => x._id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDownload = (url, filename = 'generated-image.png') => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const formatTime = (dateStr) => {
    try { return new Date(dateStr).toLocaleString() } catch { return '' }
  }

  const canGenerate = form.topic && form.subject && form.gradeLevel && form.visualType

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="topic">Topic</Label>
              <Textarea
                id="topic"
                placeholder="e.g., Labeled diagram of the human heart"
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                placeholder="Constraints or details to include in the image"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>

          <div className="space-y-4">
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

            <div>
              <Label htmlFor="visualType">Visual Type</Label>
              <Select value={form.visualType} onValueChange={(value) => setForm({ ...form, visualType: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select visual type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="diagram">Diagram</SelectItem>
                  <SelectItem value="chart">Chart</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div> 
              <Label htmlFor="language">Language</Label>
              <Select value={form.language} onValueChange={(value) => setForm({ ...form, language: value })}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Arabic">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="difficulty">Advanced Detail</Label>
              <Switch
                checked={form.difficultyFlag}
                onCheckedChange={(checked) => setForm({ ...form, difficultyFlag: checked })}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate || isGenerating}
            className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:opacity-90 text-white"
          >
            {isGenerating ? 'Generating...' : 'Generate Image'}
          </Button>
        </div>

        {error && <div className="text-red-600 text-sm mt-4">{error}</div>}

        {imageUrl && (
          <div className="mt-6 rounded-xl border overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Generated" className="w-full h-auto" />
            <div className="p-4 flex items-center justify-end gap-3">
              <Button size="sm" variant="outline" onClick={() => handleDownload(imageUrl)}>
                Download
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Saved Images</h3>
          <Badge variant="secondary">{saved.length}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {saved.map((item) => (
            <div key={item._id} className="group relative overflow-hidden rounded-2xl border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-square overflow-hidden bg-muted/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.topic} className="h-full w-full object-cover" />
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => handlePreview(item)} className="rounded-full p-2 ">
                  <Eye className="h-4 w-4 cursor-pointer text-green-500" />
                </button>
                <button onClick={() => handleDownload(item.imageUrl, `${item.topic || 'image'}.png`)} className="rounded-full p-2 ">
                  <Download className="h-4 w-4 cursor-pointer text-blue-500" />
                </button>
                <button onClick={() => handleDelete(item._id)} className="rounded-full p-2 ">
                  <Trash2 className="h-4 w-4 cursor-pointer text-red-600" />
                </button>
              </div>
              <div className="p-4">
                <div className="text-sm font-semibold line-clamp-1">{item.topic}</div>
                <div className="text-xs text-muted-foreground">{item.subject} • {item.visualType}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{formatTime(item.createdAt)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.topic || 'Preview'}</DialogTitle>
          </DialogHeader>
          <div className="rounded-lg overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {previewItem && <img src={previewItem.imageUrl} alt={previewItem.topic} className="w-full h-auto" />}
          </div>
          <div className="text-sm text-muted-foreground">
            {previewItem?.subject} • {previewItem?.visualType} • {formatTime(previewItem?.createdAt)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ImageGenerator