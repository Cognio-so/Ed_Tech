'use client'
import React, { useState } from "react"
import { Video, RefreshCw, Volume2, Mic, Play, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

const VideoCreator = ({ setGeneratedContent }) => {
  const [videoData, setVideoData] = useState({
    script: "",
    avatar: "",
    voiceEmotion: "",
    backgroundScene: "",
    animationStyle: "",
    quality: "1080p",
    duration: 60,
    autoGenerateScript: true
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setTimeout(() => {
      setGeneratedContent(prev => ({
        ...prev,
        video: {
          title: "Educational Video Created",
          duration: `${videoData.duration} seconds`,
          avatar: videoData.avatar,
          preview: "HD video with AI avatar and professional voiceover"
        }
      }))
      setIsGenerating(false)
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="autoScript">Script Auto-Generation</Label>
            <Switch
              checked={videoData.autoGenerateScript}
              onCheckedChange={(checked) => setVideoData({...videoData, autoGenerateScript: checked})}
            />
          </div>

          <div>
            <Label htmlFor="script">Video Script</Label>
            <Textarea
              id="script"
              placeholder={videoData.autoGenerateScript ? "Script will be auto-generated based on your topic..." : "Enter your video script..."}
              value={videoData.script}
              onChange={(e) => setVideoData({...videoData, script: e.target.value})}
              disabled={videoData.autoGenerateScript}
              className="mt-2 min-h-32"
            />
          </div>

          <div>
            <Label htmlFor="avatar">3D Avatar Selection</Label>
            <Select value={videoData.avatar} onValueChange={(value) => setVideoData({...videoData, avatar: value})}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose an avatar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teacher-female">Female Teacher</SelectItem>
                <SelectItem value="teacher-male">Male Teacher</SelectItem>
                <SelectItem value="scientist">Scientist</SelectItem>
                <SelectItem value="historian">Historian</SelectItem>
                <SelectItem value="mathematician">Mathematician</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="voiceEmotion">Voice Emotion Settings</Label>
            <Select value={videoData.voiceEmotion} onValueChange={(value) => setVideoData({...videoData, voiceEmotion: value})}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select voice emotion" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                <SelectItem value="calm">Calm & Professional</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="authoritative">Authoritative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="background">Background Scenes</Label>
            <Select value={videoData.backgroundScene} onValueChange={(value) => setVideoData({...videoData, backgroundScene: value})}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose background" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classroom">Classroom</SelectItem>
                <SelectItem value="library">Library</SelectItem>
                <SelectItem value="laboratory">Laboratory</SelectItem>
                <SelectItem value="office">Modern Office</SelectItem>
                <SelectItem value="nature">Nature/Outdoor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="animation">Animation Styles</Label>
            <Select value={videoData.animationStyle} onValueChange={(value) => setVideoData({...videoData, animationStyle: value})}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select animation style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="slideshow">Slideshow Transitions</SelectItem>
                <SelectItem value="kinetic">Kinetic Typography</SelectItem>
                <SelectItem value="3d">3D Animations</SelectItem>
                <SelectItem value="whiteboard">Whiteboard Style</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Video Duration: {videoData.duration} seconds</Label>
            <Slider
              value={[videoData.duration]}
              onValueChange={(value) => setVideoData({...videoData, duration: value[0]})}
              min={30}
              max={300}
              step={15}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="quality">Quality Settings</Label>
            <Select value={videoData.quality} onValueChange={(value) => setVideoData({...videoData, quality: value})}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="720p">720p HD</SelectItem>
                <SelectItem value="1080p">1080p Full HD</SelectItem>
                <SelectItem value="4k">4K Ultra HD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Professional Dubbing Integration</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button size="sm" variant="outline">
                <Mic className="h-4 w-4 mr-1" />
                Record Voice
              </Button>
              <Button size="sm" variant="outline">
                <Volume2 className="h-4 w-4 mr-1" />
                AI Voice
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleGenerate} 
          disabled={!videoData.avatar || isGenerating}
          className="flex-1 bg-gradient-to-r from-red-500 to-pink-600 hover:opacity-90 text-white"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Creating Video...
            </>
          ) : (
            <>
              <Video className="h-4 w-4 mr-2" />
              Create Video
            </>
          )}
        </Button>
        <Button variant="outline">
          <Volume2 className="h-4 w-4 mr-2" />
          Preview Audio
        </Button>
      </div>
    </div>
  )
}

export default VideoCreator