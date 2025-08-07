'use client'
import React, { useState } from "react"
import { BookOpen, RefreshCw, Edit, User, Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"

const ComicsCreator = ({ setGeneratedContent }) => {
  const [comicsData, setComicsData] = useState({
    storyPrompt: "",
    characterCount: 2,
    panelCount: 6,
    artStyle: "cartoon",
    includeAnimation: false,
    educationalTopic: ""
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setTimeout(() => {
      setGeneratedContent(prev => ({
        ...prev,
        comics: {
          title: "Educational Comic Created",
          panels: comicsData.panelCount,
          characters: comicsData.characterCount,
          preview: `${comicsData.panelCount}-panel comic with ${comicsData.characterCount} characters`
        }
      }))
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="storyPrompt">Educational Story Prompt</Label>
            <Textarea
              id="storyPrompt"
              placeholder="Describe the educational story for your comic..."
              value={comicsData.storyPrompt}
              onChange={(e) => setComicsData({...comicsData, storyPrompt: e.target.value})}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Character Count: {comicsData.characterCount}</Label>
            <Slider
              value={[comicsData.characterCount]}
              onValueChange={(value) => setComicsData({...comicsData, characterCount: value[0]})}
              min={1}
              max={8}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label>Panel Count: {comicsData.panelCount}</Label>
            <Slider
              value={[comicsData.panelCount]}
              onValueChange={(value) => setComicsData({...comicsData, panelCount: value[0]})}
              min={3}
              max={12}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="educationalTopic">Educational Topic</Label>
            <Input
              id="educationalTopic"
              placeholder="e.g., Math, Science, History..."
              value={comicsData.educationalTopic}
              onChange={(e) => setComicsData({...comicsData, educationalTopic: e.target.value})}
              className="mt-2"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="artStyle">Art Style</Label>
            <Select value={comicsData.artStyle} onValueChange={(value) => setComicsData({...comicsData, artStyle: value})}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose art style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cartoon">Cartoon</SelectItem>
                <SelectItem value="manga">Manga</SelectItem>
                <SelectItem value="superhero">Superhero</SelectItem>
                <SelectItem value="educational">Educational Friendly</SelectItem>
                <SelectItem value="watercolor">Watercolor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="includeAnimation">Animation Options for Short Clips</Label>
            <Switch
              checked={comicsData.includeAnimation}
              onCheckedChange={(checked) => setComicsData({...comicsData, includeAnimation: checked})}
            />
          </div>

          <div>
            <Label>Character Consistency</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button size="sm" variant="outline">
                <User className="h-4 w-4 mr-1" />
                Main Character
              </Button>
              <Button size="sm" variant="outline">
                <Users className="h-4 w-4 mr-1" />
                Supporting
              </Button>
            </div>
          </div>

          <div>
            <Label>Educational Storytelling Templates</Label>
            <Select>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose template" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="problem-solution">Problem & Solution</SelectItem>
                <SelectItem value="journey">Learning Journey</SelectItem>
                <SelectItem value="discovery">Discovery Story</SelectItem>
                <SelectItem value="friendship">Friendship & Learning</SelectItem>
                <SelectItem value="adventure">Educational Adventure</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleGenerate} 
          disabled={!comicsData.storyPrompt || isGenerating}
          className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-600 hover:opacity-90 text-white"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creating Comic...
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Create Comic
            </>
          )}
        </Button>
        <Button variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Panels
        </Button>
      </div>
    </div>
  )
}

export default ComicsCreator