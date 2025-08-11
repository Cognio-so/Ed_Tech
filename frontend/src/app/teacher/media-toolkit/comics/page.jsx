'use client'
import React, { useRef, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CarouselWithControls } from "@/components/ui/carousel"
import { Eye, Download, Trash2, Save, Maximize2, BookOpen, Sparkles, Play, Pause, Grid, X } from "lucide-react"

const ComicsCreator = () => {
  const [form, setForm] = useState({
    instructions: "",
    gradeLevel: "",
    numPanels: 4,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [images, setImages] = useState([]) // [{ index, url }]
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState([])
  const [liveViewerOpen, setLiveViewerOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewComic, setPreviewComic] = useState(null)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const abortRef = useRef(null)

  const canGenerate = form.instructions && form.gradeLevel && form.numPanels > 0

  const fetchSaved = useCallback(async () => {
    try {
      const res = await fetch('/api/comics', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) setSaved(data.items || [])
    } catch {}
  }, [])

  useEffect(() => { fetchSaved() }, [fetchSaved])

  const startStream = async () => {
    setIsGenerating(true)
    setError(null)
    setImages([])
    setLiveViewerOpen(true)
    try {
      abortRef.current = new AbortController()
      const res = await fetch('/api/comics/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        signal: abortRef.current.signal,
      })
      if (!res.ok || !res.body) {
        const txt = await res.text().catch(()=>'')
        throw new Error(txt || 'Failed to start stream')
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''
        for (const part of parts) {
          const line = part.trim()
          if (!line.startsWith('data:')) continue
          const json = line.slice(5).trim()
          try {
            const evt = JSON.parse(json)
            if (evt.type === 'panel_image' && evt.url) {
              setImages(prev => {
                const exists = prev.some(p => p.index === evt.index)
                const next = exists
                  ? prev.map(p => (p.index === evt.index ? { index: evt.index, url: evt.url } : p))
                  : [...prev, { index: evt.index, url: evt.url }]
                return next.sort((a,b)=>a.index-b.index)
              })
            }
          } catch {}
        }
      }
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message || 'Stream error')
    } finally {
      setIsGenerating(false)
    }
  }

  const stopStream = () => {
    if (abortRef.current) abortRef.current.abort()
    setIsGenerating(false)
  }

  const handleDownload = (url, filename = 'comic-panel.png') => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const handleSaveComic = async () => {
    try {
      if (!images.length) return
      const payload = {
        instructions: form.instructions,
        gradeLevel: form.gradeLevel,
        numPanels: form.numPanels,
        images: images.map(i => i.url),
      }
      const res = await fetch('/api/comics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save comic')
      setSaved(prev => [data.saved, ...prev])
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/comics?id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete')
      }
      setSaved(prev => prev.filter(x => x._id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  const formatTime = (dateStr) => {
    try { return new Date(dateStr).toLocaleString() } catch { return '' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <BookOpen className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Comic Creator</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
            Create Educational Comics
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Transform educational content into engaging comic stories using AI. Perfect for visual learners and creative storytelling.
          </p>
        </div>

        {/* Generation Card */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              Generate New Comic
            </CardTitle>
            <CardDescription>
              Describe your educational topic and let AI create a visual story
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Controls */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="instructions" className="text-sm font-medium">Topic & Instructions</Label>
                  <Textarea
                    id="instructions"
                    placeholder="e.g., Create a fun comic explaining photosynthesis for 5th graders with plant characters"
                    value={form.instructions}
                    onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                    className="min-h-[120px] resize-none border-muted-foreground/20 focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label htmlFor="gradeLevel" className="text-sm font-medium">Grade Level</Label>
                    <Select value={form.gradeLevel} onValueChange={(value) => setForm({ ...form, gradeLevel: value })}>
                      <SelectTrigger className="border-muted-foreground/20">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {['3','4','5','6','7','8','9','10','11','12'].map(g => (
                          <SelectItem key={g} value={g}>{g}th Grade</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="numPanels" className="text-sm font-medium">Panels</Label>
                    <Input
                      id="numPanels"
                      type="number"
                      min={1}
                      max={20}
                      value={form.numPanels}
                      onChange={(e) => setForm({ ...form, numPanels: parseInt(e.target.value || '0') })}
                      className="border-muted-foreground/20"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  {!isGenerating ? (
                    <Button
                      onClick={startStream}
                      disabled={!canGenerate}
                      className="flex-1 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:opacity-90 text-white shadow-lg"
                      size="lg"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Create Comic
                    </Button>
                  ) : (
                    <Button onClick={stopStream} variant="outline" className="flex-1" size="lg">
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Generation
                    </Button>
                  )}
                  
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setLiveViewerOpen(true)}
                    disabled={!images.length}
                    className="border-primary/20 hover:bg-primary/5"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>

                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}
              </div>

              {/* Live Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Live Preview</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleSaveComic} disabled={!images.length}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
                
                <div className="aspect-video rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 flex items-center justify-center overflow-hidden">
                  {images.length > 0 ? (
                    <div className="w-full h-full p-4">
                      <CarouselWithControls
                        items={images}
                        showIndicators={false}
                        renderItem={(p) => (
                          <div className="rounded-lg overflow-hidden bg-background h-full flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.url} alt={`Panel ${p.index}`} className="max-h-full max-w-full object-contain" />
                          </div>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Comic panels will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saved Comics Gallery */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  Your Comics Library
                  <Badge variant="secondary" className="ml-2">{saved.length}</Badge>
                </CardTitle>
                <CardDescription>Manage and view your created comics</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {saved.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No comics yet</h3>
                <p className="text-muted-foreground mb-4">Create your first educational comic to get started</p>
              </div>
            ) : (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                {saved.map((item) => (
                  <div key={item._id} className="group relative">
                    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/20">
                      {/* Thumbnail */}
                      <div className="aspect-square overflow-hidden bg-gradient-to-br from-muted/20 to-muted/40 relative">
                        {item.images?.[0] ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={item.images[0]} 
                              alt={item.instructions} 
                              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                          </div>
                        )}
                        
                        {/* Action Buttons Overlay */}
                        <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                            onClick={() => { setPreviewComic(item); setPreviewOpen(true); }}
                          >
                            <Eye className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                            onClick={() => item.images?.[0] && handleDownload(item.images[0], `${item.instructions.slice(0,20)}.png`)}
                          >
                            <Download className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm"
                            onClick={() => handleDelete(item._id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>

                        {/* Panel Count Badge */}
                        <div className="absolute bottom-3 left-3">
                          <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-xs">
                            {item.numPanels} panels
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2">{item.instructions}</h3>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Grade {item.gradeLevel}</span>
                          <span>{formatTime(item.createdAt)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Viewer Dialog */}
      <Dialog open={liveViewerOpen} onOpenChange={setLiveViewerOpen}>
        <DialogContent className="w-[95vw] max-w-[1400px] h-[95vh] p-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-500" />
                  Live Comic Viewer
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setLiveViewerOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 p-6 overflow-hidden">
              {images.length > 0 ? (
                <CarouselWithControls
                  items={images}
                  className="h-full"
                  renderItem={(p) => (
                    <div className="rounded-xl border overflow-hidden bg-gradient-to-br from-background to-muted/10 flex items-center justify-center h-[calc(85vh-200px)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={p.url} 
                        alt={`Panel ${p.index}`} 
                        className="max-h-full max-w-full object-contain rounded-lg shadow-lg" 
                      />
                    </div>
                  )}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Waiting for comic panels...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 pt-2 border-t">
              <div className="flex justify-end gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => images[0]?.url && handleDownload(images[0].url, 'comic.png')} 
                  disabled={!images.length}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download First
                </Button>
                <Button size="sm" onClick={handleSaveComic} disabled={!images.length}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Comic
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="w-[95vw] max-w-[1400px] h-[95vh] p-0">
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 pb-2 border-b">
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  Comic Preview
                  {previewComic && (
                    <Badge variant="outline" className="ml-2">
                      Grade {previewComic.gradeLevel}
                    </Badge>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            
            {previewComic && (
              <div className="flex-1 p-6 overflow-hidden">
                <CarouselWithControls
                  items={(previewComic.images || []).map((url, i) => ({ url, index: i + 1 }))}
                  className="h-full"
                  renderItem={(p) => (
                    <div className="rounded-xl border overflow-hidden bg-gradient-to-br from-background to-muted/10 flex items-center justify-center h-[calc(85vh-200px)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={p.url} 
                        alt={`Panel ${p.index}`} 
                        className="max-h-full max-w-full object-contain rounded-lg shadow-lg" 
                      />
                    </div>
                  )}
                />
              </div>
            )}
            
            {previewComic && (
              <div className="p-6 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium">{previewComic.instructions}</p>
                    <p>{previewComic.numPanels} panels • Created {formatTime(previewComic.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => previewComic.images?.[0] && handleDownload(previewComic.images[0], `${previewComic.instructions.slice(0,20)}.png`)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ComicsCreator