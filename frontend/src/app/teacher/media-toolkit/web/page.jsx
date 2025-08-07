'use client'
import React, { useState } from "react"
import { Globe, Search, Filter, RefreshCw, Bookmark, Heart, Share, Download, CheckCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"

const WebContentCurator = ({ setGeneratedContent }) => {
  const [webData, setWebData] = useState({
    searchTopic: "",
    ageGroup: "",
    contentType: "all",
    safetyLevel: "strict",
    resultCount: 10,
    contentQuality: 95,
    ageAppropriateness: 98,
    educationalValue: 92
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    setIsGenerating(true)
    setTimeout(() => {
      setGeneratedContent(prev => ({
        ...prev,
        web: {
          title: "Web Content Curated",
          results: webData.resultCount,
          topic: webData.searchTopic,
          preview: `${webData.resultCount} safe, educational resources found`
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
            <Label htmlFor="searchTopic">Search Topic</Label>
            <Input
              id="searchTopic"
              placeholder="Enter educational topic to search..."
              value={webData.searchTopic}
              onChange={(e) => setWebData({...webData, searchTopic: e.target.value})}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="ageGroup">Age-Appropriate Filtering</Label>
            <Select value={webData.ageGroup} onValueChange={(value) => setWebData({...webData, ageGroup: value})}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select age group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5-8">Ages 5-8</SelectItem>
                <SelectItem value="9-12">Ages 9-12</SelectItem>
                <SelectItem value="13-16">Ages 13-16</SelectItem>
                <SelectItem value="17+">Ages 17+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="contentType">Content Type</Label>
            <Select value={webData.contentType} onValueChange={(value) => setWebData({...webData, contentType: value})}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="videos">Educational Videos</SelectItem>
                <SelectItem value="articles">Articles & Blogs</SelectItem>
                <SelectItem value="interactive">Interactive Content</SelectItem>
                <SelectItem value="games">Educational Games</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="safetyLevel">Safety Verification</Label>
            <Select value={webData.safetyLevel} onValueChange={(value) => setWebData({...webData, safetyLevel: value})}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select safety level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="strict">Strict (Highest Safety)</SelectItem>
                <SelectItem value="moderate">Moderate</SelectItem>
                <SelectItem value="basic">Basic Filtering</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Result Count: {webData.resultCount} results</Label>
            <Slider
              value={[webData.resultCount]}
              onValueChange={(value) => setWebData({...webData, resultCount: value[0]})}
              min={5}
              max={50}
              step={5}
              className="mt-2"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Educational Relevance Scoring</Label>
            <div className="space-y-3 mt-2">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Content Quality</span>
                  <Badge variant="secondary">{webData.contentQuality}%</Badge>
                </div>
                <Slider
                  value={[webData.contentQuality]}
                  onValueChange={(value) => setWebData({...webData, contentQuality: value[0]})}
                  max={100}
                  step={1}
                  className="mt-1"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Age Appropriateness</span>
                  <Badge variant="secondary">{webData.ageAppropriateness}%</Badge>
                </div>
                <Slider
                  value={[webData.ageAppropriateness]}
                  onValueChange={(value) => setWebData({...webData, ageAppropriateness: value[0]})}
                  max={100}
                  step={1}
                  className="mt-1"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Educational Value</span>
                  <Badge variant="secondary">{webData.educationalValue}%</Badge>
                </div>
                <Slider
                  value={[webData.educationalValue]}
                  onValueChange={(value) => setWebData({...webData, educationalValue: value[0]})}
                  max={100}
                  step={1}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Bookmark System</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button size="sm" variant="outline">
                <Bookmark className="h-4 w-4 mr-1" />
                Save All
              </Button>
              <Button size="sm" variant="outline">
                <Heart className="h-4 w-4 mr-1" />
                Favorites
              </Button>
              <Button size="sm" variant="outline">
                <Share className="h-4 w-4 mr-1" />
                Share List
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>

          <div>
            <Label>Teacher Review Workflow</Label>
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="outline" className="flex-1">
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <Eye className="h-4 w-4 mr-1" />
                Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button 
          onClick={handleGenerate} 
          disabled={!webData.searchTopic || isGenerating}
          className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-600 hover:opacity-90 text-white"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Curating Content...
            </>
          ) : (
            <>
              <Search className="h-4 w-4 mr-2" />
              Search & Curate
            </>
          )}
        </Button>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
        </Button>
      </div>
    </div>
  )
}

export default WebContentCurator