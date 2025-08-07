'use client'

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Presentation, RefreshCw, Languages, Image, Type, Save, History } from "lucide-react"
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
  const [error, setError] = useState(null)
  const [localGeneratedContent, setLocalGeneratedContent] = useState(null)
  const [savedPresentations, setSavedPresentations] = useState([])
  const [isLoadingSaved, setIsLoadingSaved] = useState(false)

  // Load saved presentations on component mount
  useEffect(() => {
    fetchSavedPresentations();
  }, []);

  const fetchSavedPresentations = async () => {
    setIsLoadingSaved(true);
    try {
      const response = await fetch('/api/presentations');
      if (response.ok) {
        const data = await response.json();
        setSavedPresentations(data.presentations || []);
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
        headers: {
          'Content-Type': 'application/json',
        },
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
          title: data.presentation.title,
          url: data.presentation.presentationUrl,
          downloadUrl: data.presentation.downloadUrl,
          slideCount: data.presentation.slideCount,
          status: data.presentation.status,
          errorMessage: data.presentation.errorMessage,
          id: data.presentation.id,
          createdAt: data.presentation.createdAt
        }
        
        setLocalGeneratedContent(newContent)
        setGeneratedContent && setGeneratedContent(prev => ({ ...prev, slides: newContent }))
        
        // Refresh the saved presentations list
        await fetchSavedPresentations();
        
        toast.success('Presentation generated successfully!')
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
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/80 dark:bg-slate-800/80 p-6 rounded-xl shadow-lg backdrop-blur-sm"
      >
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 text-center mb-6 flex items-center justify-center gap-2">
          <Presentation className="h-6 w-6 text-blue-600" />
          Create Your AI Presentation
        </h2>

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
            presentationUrl={localGeneratedContent.url}
            downloadUrl={localGeneratedContent.downloadUrl}
            title={localGeneratedContent.title}
            slideCount={localGeneratedContent.slideCount}
            status={localGeneratedContent.status}
            errorMessage={localGeneratedContent.errorMessage}
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
            <History className="h-5 w-5" />
            Your Presentations ({savedPresentations.length})
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
                    <Badge 
                      variant={presentation.status === 'SUCCESS' ? 'default' : 
                              presentation.status === 'FAILURE' ? 'destructive' : 'secondary'}
                      className="ml-2"
                    >
                      {presentation.status}
                    </Badge>
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
                        className="flex-1"
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePresentation(presentation._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                  
                  {presentation.status === 'FAILURE' && (
                    <div className="text-xs text-red-500 dark:text-red-400">
                      {presentation.errorMessage || 'Generation failed'}
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