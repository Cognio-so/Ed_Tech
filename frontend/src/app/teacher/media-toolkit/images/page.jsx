'use client'
import React, { useState } from "react"
import { Image, RefreshCw, Grid, Crop, RotateCw, Palette, Type, Shapes, Scissors, Plus, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"

const ImageGenerator = ({ setGeneratedContent }) => {
  const [imageData, setImageData] = useState({
    prompt: "",
    artStyle: "",
    imageCount: 1,
    resolution: "1024x1024",
    includeText: false,
    educationalLevel: ""
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setTimeout(() => {
      setGeneratedContent(prev => ({
        ...prev,
        images: {
          title: "Educational Images Generated",
          count: imageData.imageCount,
          style: imageData.artStyle,
          preview: `${imageData.imageCount} high-quality educational images`
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
            <Label htmlFor="prompt">Image Description</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the educational image you want to create..."
              value={imageData.prompt}
              onChange={(e) => setImageData({...imageData, prompt: e.target.value})}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="artStyle">Art Style Selector</Label>
            <Select value={imageData.artStyle} onValueChange={(value) => setImageData({...imageData, artStyle: value})}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose art style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realistic">Realistic</SelectItem>
                <SelectItem value="cartoon">Cartoon</SelectItem>
                <SelectItem value="diagram">Technical Diagram</SelectItem>
                <SelectItem value="watercolor">Watercolor</SelectItem>
                <SelectItem value="minimalist">Minimalist</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Batch Generation: {imageData.imageCount} images</Label>
            <Slider
              value={[imageData.imageCount]}
              onValueChange={(value) => setImageData({...imageData, imageCount: value[0]})}
              min={1}
              max={10}
              step={1}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="educationalLevel">Educational Level</Label>
            <Select value={imageData.educationalLevel} onValueChange={(value) => setImageData({...imageData, educationalLevel: value})}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select educational level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preschool">Preschool</SelectItem>
                <SelectItem value="elementary">Elementary</SelectItem>
                <SelectItem value="middle">Middle School</SelectItem>
                <SelectItem value="high">High School</SelectItem>
                <SelectItem value="college">College</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="resolution">Resolution</Label>
            <Select value={imageData.resolution} onValueChange={(value) => setImageData({...imageData, resolution: value})}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select resolution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="512x512">512x512 (Small)</SelectItem>
                <SelectItem value="1024x1024">1024x1024 (Medium)</SelectItem>
                <SelectItem value="1792x1024">1792x1024 (Wide)</SelectItem>
                <SelectItem value="1024x1792">1024x1792 (Tall)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="includeText">Include Text Overlay</Label>
            <Switch
              checked={imageData.includeText}
              onCheckedChange={(checked) => setImageData({...imageData, includeText: checked})}
            />
          </div>

          <div>
            <Label>Basic Editing Tools</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <Button size="sm" variant="outline">
                <Crop className="h-4 w-4 mr-1" />
                Crop
              </Button>
              <Button size="sm" variant="outline">
                <RotateCw className="h-4 w-4 mr-1" />
                Rotate
              </Button>
              <Button size="sm" variant="outline">
                <Palette className="h-4 w-4 mr-1" />
                Colors
              </Button>
              <Button size="sm" variant="outline">
                <Type className="h-4 w-4 mr-1" />
                Text
              </Button>
              <Button size="sm" variant="outline">
                <Shapes className="h-4 w-4 mr-1" />
                Shapes
              </Button>
              <Button size="sm" variant="outline">
                <Scissors className="h-4 w-4 mr-1" />
                Cut
              </Button>
            </div>
          </div>

          <div>
            <Label>Automatic Tagging</Label>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge variant="secondary">Educational</Badge>
              <Badge variant="secondary">Science</Badge>
              <Badge variant="secondary">Diagram</Badge>
              <Badge variant="secondary">Visual Aid</Badge>
            </div>
          </div>

          <div>
            <Label>Direct Lesson Integration</Label>
            <Button size="sm" variant="outline" className="mt-2 w-full">
              <Plus className="h-4 w-4 mr-1" />
              Add to Lesson Plan
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleGenerate} 
          disabled={!imageData.prompt || isGenerating}
          className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:opacity-90 text-white"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating Images...
            </>
          ) : (
            <>
              <Image className="h-4 w-4 mr-2" />
              Generate Images
            </>
          )}
        </Button>
        <Button variant="outline">
          <Grid className="h-4 w-4 mr-2" />
          View Gallery
        </Button>
      </div>
    </div>
  )
}

export default ImageGenerator