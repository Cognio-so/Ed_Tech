'use client'

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Presentation, RefreshCw, Languages, Image, Type, Save, History, PresentationIcon } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import PPTXViewer from "@/components/ui/pptx-viewer"

const SlidesGenerator = ({ setGeneratedContent }) => {
  // Form state
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [slideCount, setSlideCount] = useState([10])
  const [includeImages, setIncludeImages] = useState(true)
  const [language, setLanguage] = useState('ENGLISH')
  const [verbosity, setVerbosity] = useState('standard')
  const [customInstructions, setCustomInstructions] = useState('')
  
  // UI state
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState(null)
  const [localGeneratedContent, setLocalGeneratedContent] = useState(null)
  const [savedPresentations, setSavedPresentations] = useState([])
  const [isLoadingSaved, setIsLoadingSaved] = useState(false)

  useEffect(() => {
    fetchSavedPresentations();
  }, []);

  const dedupePresentations = (list) => {
    const seen = new Set()
    const out = []
    for (const p of list) {
      const key = p.presentationUrl || p.taskId || p._id
      if (!key) {
        out.push(p)
        continue
      }
      if (seen.has(key)) continue
      seen.add(key)
      out.push(p)
    }
    return out
  }

  const fetchSavedPresentations = async () => {
    setIsLoadingSaved(true);
    try {
      const response = await fetch('/api/presentations');
      if (response.ok) {
        const data = await response.json();
        const cleaned = dedupePresentations(data.presentations || []);
        setSavedPresentations(cleaned);
      }
    } catch (error) {
      console.error('Failed to fetch presentations:', error);
      toast.error('Failed to load saved presentations');
    } finally {
      setIsLoadingSaved(false);
    }
  };

  const handleGenerate = async () => {
    if (!title.trim() || !topic.trim()) {
      setError('Please enter both title and topic')
      toast.error('Please fill in all required fields')
      return
    }

    setIsGenerating(true)
    setError(null)
    setLocalGeneratedContent(null)

    try {
      const response = await fetch('/api/presentations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          topic: topic.trim(),
          slideCount: slideCount[0],
          includeImages,
          language,
          verbosity,
          customInstructions: customInstructions.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate presentation')
      }

      if (data.success && data.presentation) {
        const newContent = {
          ...data.presentation
        }
        setLocalGeneratedContent(newContent)
        setGeneratedContent && setGeneratedContent(prev => ({ ...prev, slides: newContent }))
        toast.success('Presentation generated. Preview, then Save to library.')
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err) {
      setError(err.message || 'Failed to generate presentation')
      toast.error(err.message || 'Failed to generate presentation')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!localGeneratedContent) return
    try {
      setIsSaving(true)
      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // include generation meta and form context
          title,
          topic,
          customInstructions,
          slideCount: localGeneratedContent.slideCount,
          language,
          includeImages,
          verbosity,
          taskId: localGeneratedContent.taskId,
          status: localGeneratedContent.status,
          presentationUrl: localGeneratedContent.presentationUrl || localGeneratedContent.url || null,
          downloadUrl: localGeneratedContent.downloadUrl || null,
          errorMessage: localGeneratedContent.errorMessage || null
        })
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to save presentation')
      }

      toast.success('Presentation saved')
      await fetchSavedPresentations()
    } catch (e) {
      console.error(e)
      toast.error(e.message || 'Failed to save presentation')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeletePresentation = async (presentationId) => {
    try {
      const response = await fetch(`/api/presentations?id=${presentationId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSavedPresentations(prev => prev.filter(p => p._id !== presentationId));
        toast.success('Presentation deleted successfully');
      } else {
        throw new Error('Failed to delete presentation');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete presentation');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 dark:bg-slate-800/80 p-6 rounded-2xl shadow-xl backdrop-blur-md ring-1 ring-black/5"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Presentation Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter presentation title"
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="topic" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Topic/Content *
              </Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Describe the main topic or content for your presentation"
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              />
            </div>

            <div>
              <Slider
                label="Number of Slides"
                description={`Generate ${slideCount[0]} slides for your presentation`}
                value={slideCount}
                onValueChange={setSlideCount}
                min={1}
                max={50}
                step={1}
                showValue={true}
                className="mt-2"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Languages className="h-4 w-4" />
                  Language
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ENGLISH">English</SelectItem>
                    <SelectItem value="ARABIC">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                  <Type className="h-4 w-4" />
                  Verbosity
                </Label>
                <Select value={verbosity} onValueChange={setVerbosity}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concise">Concise</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="text-heavy">Text Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Image className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <Label htmlFor="includeImages" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  Include Stock Images
                </Label>
              </div>
              <Switch
                id="includeImages"
                checked={includeImages}
                onCheckedChange={setIncludeImages}
              />
            </div>

            <div>
              <Label htmlFor="customInstructions" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Custom Instructions
              </Label>
              <Textarea
                id="customInstructions"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Add specific instructions (e.g., 'Focus on practical examples', 'Include case studies')"
                className="mt-1 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 min-h-[80px]"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !title.trim() || !topic.trim()}
          className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-md h-12"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Generating Your Presentation...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Generate Presentation
            </>
          )}
        </Button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}
      </motion.div>

      {/* Generated Content Display */}
      {localGeneratedContent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <PPTXViewer
            presentationUrl={localGeneratedContent.presentationUrl || localGeneratedContent.url}
            downloadUrl={localGeneratedContent.downloadUrl}
            title={localGeneratedContent.title}
            slideCount={localGeneratedContent.slideCount}
            status={localGeneratedContent.status}
            errorMessage={localGeneratedContent.errorMessage}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </motion.div>
      )}

      {/* Saved Presentations */}
      {savedPresentations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <PresentationIcon className="h-5 w-5" />
            Your Presentations
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPresentations.map((presentation) => (
              <Card 
                key={presentation._id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">{presentation.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                    {presentation.topic}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                    <span>{presentation.slideCount} slides</span>
                    <span>{new Date(presentation.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {presentation.status === 'SUCCESS' && presentation.presentationUrl && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(presentation.presentationUrl, '_blank')}
                        className="flex-1 cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg shadow-md "
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePresentation(presentation._id)}
                        className="flex-1 cursor-pointer bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg shadow-md"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                  
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default SlidesGenerator