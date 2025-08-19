"use client";

import { useState, useEffect } from "react";
import {
  PenTool,
  FileText,
  Sparkles,
  Download,
  Copy,
  Save,
  Settings,
  BookOpen,
  Users,
  Clock,
  Target,
  Eye,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Check,
  Brain,
  PresentationIcon,
  HelpCircle, // Replace Quiz with HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkdownStyles } from "@/components/chat/Markdown";

const subjects = [
  { id: 'math', title: 'Math' },
  { id: 'science', title: 'Science' },
  { id: 'history', title: 'History' },
  { id: 'english', title: 'English' },
  { id: 'social-studies', title: 'Social Studies' },
  { id: 'art', title: 'Art' },
  { id: 'music', title: 'Music' },
  { id: 'physical-education', title: 'Physical Education' },
  { id: 'foreign-languages', title: 'Foreign Languages' },
  { id: 'computer-science', title: 'Computer Science' },
  { id: 'business', title: 'Business' },
  { id: 'health', title: 'Health' },
];

const grades = ['1','2','3','4','5','6','7','8','9','10','11','12'];
const contentTypes = [
  { id: 'lesson-plan', title: 'Lesson Plan', icon: PenTool, description: 'Create a lesson plan for a specific topic' },
  { id: 'worksheet', title: 'Worksheet', icon: FileText, description: 'Create a worksheet for a specific topic' },
  { id: 'quiz', title: 'Quiz', icon: HelpCircle, description: 'Create a quiz for a specific topic' }, // Use HelpCircle instead of Quiz
  { id: 'presentation', title: 'Presentation', icon: PresentationIcon, description: 'Create a presentation for a specific topic' },
];


export default function ContentGeneration() {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [objectives, setObjectives] = useState("");
  const [emotionalFlags, setEmotionalFlags] = useState("");
  const [adaptiveLevel, setAdaptiveLevel] = useState(false);
  const [includeAssessment, setIncludeAssessment] = useState(false);
  const [multimediaSuggestions, setMultimediaSuggestions] = useState(false);
  const [generateSlides, setGenerateSlides] = useState(false);
  const [instructionalDepth, setInstructionalDepth] = useState("standard");
  const [contentVersion, setContentVersion] = useState("standard");
  const [contentType, setContentType] = useState("lesson-plan");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedContent, setSavedContent] = useState([]);
  const [isCopied, setIsCopied] = useState(false);
  const [isExported, setIsExported] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isGeneratingSlides, setIsGeneratingSlides] = useState(false);
  const [slideDialogOpen, setSlideDialogOpen] = useState(false);
  const [slideCount, setSlideCount] = useState(10);
  const [presentationResult, setPresentationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  

  const fetchSavedContent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/content');
      if (response.ok) {
        const data = await response.json();
        setSavedContent(data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch content:', error);
      toast.error('Failed to load saved content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedContent();
  }, []);

  const handleGenerate = async () => {
    if (!selectedGrade || !selectedSubject || !topic || !contentType) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/content/generate', { // Changed from '/api/content' to '/api/content/generate'
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: selectedSubject,
          topic,
          grade: selectedGrade,
          objectives,
          emotionalFlags,
          adaptiveLevel,
          includeAssessment,
          multimediaSuggestions,
          generateSlides,
          language,
          instructionalDepth,
          contentVersion,
          contentType,
        }),
      });

      if (response.ok) { // Changed from response.status === 200 to response.ok
        const data = await response.json();
        setGeneratedContent(data.content);
        await fetchSavedContent(); 
        toast.success('Content generated successfully using AI!');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success('Content copied to clipboard!');
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  const handleExport = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contentType}-${topic}-grade${selectedGrade}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Content exported successfully!');
    setIsExported(true);
    setTimeout(() => {
      setIsExported(false);
    }, 2000);
    };

  const handleSave = async (e) => {
    if (!generatedContent) {
      toast.error('No content to save');
      return;
    }
    e.preventDefault(); 
    try {
      const response = await fetch('/api/content/generate', { // Changed from '/api/content' to '/api/content/generate'
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        content: generatedContent,
        contentType,
        subject: selectedSubject,
        grade: selectedGrade,
        topic,
        objectives,
        emotionalFlags,
        adaptiveLevel,
        includeAssessment,
        multimediaSuggestions,
        generateSlides,
        language,
        instructionalDepth,
        contentVersion,
      }),
    });

    if (response.ok) { // Changed from response.status === 200 to response.ok
      const data = await response.json();
      await fetchSavedContent();  
      toast.success('Content saved successfully!');
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } else {
      const errorData = await response.json();
      toast.error(errorData.error || 'Failed to save content');
    }
  } catch (error) {
    console.error('Save error:', error);
    toast.error('Failed to save content');
  }
};

  const handleViewContent = (content) => {
    setGeneratedContent(content.generatedContent);
  };

  const handleDeleteContent = async (contentId) => {
    try {
      const response = await fetch(`/api/content?id=${contentId}`, {
        method: 'DELETE',
      });

      if (response.status === 200) {
        setSavedContent(savedContent.filter(item => item._id !== contentId));
        toast.success('Content deleted successfully!');
      } else {
        toast.error('Failed to delete content');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete content');
    }
  };

 const handleGenerateSlides = async () => {
  if (!generatedContent) {
    toast.error('No content to generate slides from');
    return;
  }

  setIsGeneratingSlides(true);
  try {
    const response = await fetch('/api/content/generate-slides', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: generatedContent,
        title: `${selectedSubject} - ${topic}`,
        topic: topic,
        language: language,
        slideCount: slideCount
      }),
    });

    const data = await response.json();
    console.log('Slides API Response:', data); // Debug log

    if (response.ok) {
      if (data && data.presentation) {
        setPresentationResult({
          presentationUrl: data.presentation.presentationUrl || null,
          downloadUrl: data.presentation.downloadUrl || data.presentation.presentationUrl || null,
          slideCount: data.presentation.slideCount || slideCount,
          status: data.presentation.status || 'SUCCESS',
          errorMessage: data.presentation.errorMessage || null
        });
        toast.success('Slides generated successfully!');
      } else {
        console.error('Invalid response structure:', data);
        toast.error('Invalid response from server');
      }
    } else {
      const errorMessage = data.error || 'Failed to generate slides';
      console.error('API Error:', errorMessage);
      toast.error(errorMessage);
    }
  } catch (error) {
    console.error('Slide generation error:', error);
    toast.error('Failed to generate slides');
  } finally {
    setIsGeneratingSlides(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="p-6 space-y-6">
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-white dark:bg-slate-800 shadow-sm border">
            <TabsTrigger value="generate" className="h-10 text-sm font-medium">
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Content
            </TabsTrigger>
            <TabsTrigger value="saved" className="h-10 text-sm font-medium">
              <FileText className="h-4 w-4 mr-2" />
              Saved Content
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                  AI Content Generator
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                  Create customized teaching materials with AI assistance powered by Python backend
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 shadow-lg">
                  <Brain className="h-4 w-4 mr-2" />
                  AI Powered Backend
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Generation Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Content Type Selection */}
                <Card className="shadow-sm border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Choose Content Type</CardTitle>
                    <CardDescription>
                      Select what type of educational material you want to create with AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contentTypes.map((type) => (
                        <div
                          key={type.id}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group hover:shadow-lg ${
                            contentType === type.id 
                              ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 shadow-lg" 
                              : "border-border hover:border-violet-300 dark:hover:border-violet-700"
                          }`}
                          onClick={() => setContentType(type.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-12 h-12 rounded-xl ${type.color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}
                            >
                              <type.icon className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{type.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {type.description}
                              </p>
                            </div>
                            {contentType === type.id && (
                              <CheckCircle className="h-5 w-5 text-violet-600" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Configuration Form */}
                <Card className="shadow-sm border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">Content Configuration</CardTitle>
                    <CardDescription>
                      Provide details about your lesson to generate personalized content using AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="grade" className="text-sm font-medium">Grade Level *</Label>
                        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select grade..." />
                          </SelectTrigger>
                          <SelectContent>
                            {grades.map((grade) => (
                              <SelectItem key={grade} value={grade}>
                                Grade {grade}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                          <SelectTrigger className="h-11">
                            <SelectValue placeholder="Select subject..." />
                          </SelectTrigger>
                          <SelectContent>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                {subject.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="topic" className="text-sm font-medium">Lesson Topic *</Label>
                      <Input
                        id="topic"
                        placeholder="e.g., Introduction to Fractions, Photosynthesis, World War 2..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="objectives" className="text-sm font-medium">
                        Learning Objectives (Optional)
                      </Label>
                      <Textarea
                        id="objectives"
                        placeholder="Describe what students should learn or be able to do after this lesson..."
                        value={objectives}
                        onChange={(e) => setObjectives(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center h-11"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {showAdvanced ? "Hide Advanced AI Settings" : "Show Advanced AI Settings"}
                      </Button>
                      
                      {showAdvanced && (
                        <div className="space-y-4 p-6 border rounded-xl bg-muted/30">
                          <div className="space-y-2">
                            <Label htmlFor="emotionalFlags" className="text-sm font-medium">
                              Emotional Considerations (Optional, comma-separated)
                            </Label>
                            <Input
                              id="emotionalFlags"
                              placeholder="e.g., anxiety, low confidence, high engagement"
                              value={emotionalFlags}
                              onChange={(e) => setEmotionalFlags(e.target.value)}
                              className="h-11"
                            />
                          </div>
                          
                          <div className="space-y-4">
                            <Label className="text-sm font-medium">Additional AI Options</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background">
                                <Checkbox
                                  id="adaptiveLevel"
                                  checked={adaptiveLevel}
                                  onCheckedChange={setAdaptiveLevel}
                                />
                                <Label htmlFor="adaptiveLevel" className="text-sm">Adaptive Difficulty</Label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background">
                                <Checkbox
                                  id="includeAssessment"
                                  checked={includeAssessment}
                                  onCheckedChange={setIncludeAssessment}
                                />
                                <Label htmlFor="includeAssessment" className="text-sm">Include Assessment</Label>
                              </div>
                              <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background">
                                <Checkbox
                                  id="multimediaSuggestions"
                                  checked={multimediaSuggestions}
                                  onCheckedChange={setMultimediaSuggestions}
                                />
                                <Label htmlFor="multimediaSuggestions" className="text-sm">Multimedia Suggestions</Label>
                              </div>
                                                            <div className="space-y-2">
                                <Label htmlFor="language" className="text-sm font-medium">Language</Label>
                                <Select value={language} onValueChange={setLanguage}>
                                  <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Select language..." />
                                  </SelectTrigger>
                                  <SelectContent>
         
                           <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Arabic">Arabic</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="instructionalDepth" className="text-sm font-medium">Instructional Depth</Label>
                              <Select value={instructionalDepth} onValueChange={setInstructionalDepth}>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select depth..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Basic</SelectItem>
                                  <SelectItem value="standard">Standard</SelectItem>
                                  <SelectItem value="high">Advanced</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="contentVersion" className="text-sm font-medium">Content Version</Label>
                              <Select value={contentVersion} onValueChange={setContentVersion}>
                                <SelectTrigger className="h-11">
                                  <SelectValue placeholder="Select version..." />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="low">Simplified</SelectItem>
                                  <SelectItem value="standard">Standard</SelectItem>
                                  <SelectItem value="high">Enriched</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="flex items-center justify-end">
                      <Button
                        onClick={handleGenerate}
                        disabled={!selectedGrade || !selectedSubject || !topic || !contentType || isGenerating}
                        className="h-12 px-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 shadow-lg"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating with AI...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Content with AI
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Generated Content */}
                {generatedContent && (
                  <Card className="shadow-sm border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-xl">
                        <span className="flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                          AI-Generated Content
                        </span>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={handleCopy} className="h-9">
                            {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            Copy
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleExport} className="h-9">
                            {isExported ? <Check className="h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                            Export
                          </Button>
                          <Button size="sm" onClick={handleSave} className="h-9 bg-green-600 hover:bg-green-700">
                            {isSaved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save
                          </Button>
                        </div>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Python AI Backend
                        </Badge>
                        <Badge variant="outline">
                          {contentType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 max-h-96 overflow-y-auto border">
                        <div className="prose prose-sm max-w-none text-foreground">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                            {generatedContent}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </CardContent>
                    {contentType === "presentation" && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSlideDialogOpen(true)} 
                        className="h-9 bg-yellow-500 hover:bg-yellow-600 text-white hover:text-white"
                      >
                        <PresentationIcon className="h-4 w-4 mr-2" />
                        Create Slides
                      </Button>
                    )}
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* AI Assistant Tips */}
                <Card className="border-0 bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <Sparkles className="h-5 w-5 mr-2" />
                      AI Backend Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white/90">
                    <div className="space-y-3 text-sm">
                      {[
                        "Our Python AI backend generates high-quality content",
                        "Be specific about your topic for better AI results",
                        "Include emotional considerations for student engagement",
                        "Use adaptive difficulty for diverse learners",
                        "Content is automatically saved to your account",
                      ].map((tip, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/60 mt-1.5 shrink-0" />
                          <p>{tip}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="shadow-sm border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">This Week</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">Content Created</span>
                      </div>
                      <span className="font-medium">{savedContent.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Time Saved</span>
                      </div>
                      <span className="font-medium">{savedContent.length * 2} hrs</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-purple-600" />
                        <span className="text-sm">Students Reached</span>
                      </div>
                      <span className="font-medium">{savedContent.length * 25}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <Card className="shadow-sm border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">AI-Generated Saved Content</CardTitle>
                <CardDescription>Your previously generated and saved materials created with Python AI backend</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : savedContent && savedContent.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {savedContent.map((item) => (
                      <Card key={item._id} className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm font-medium truncate">
                                {item.topic} - Grade {item.grade}
                              </CardTitle>
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.subject}
                              </p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="default" className="text-xs">
                                  AI Generated
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(item.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleViewContent(item)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[800px] max-h-[70vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>{item.topic}</DialogTitle>
                                    <DialogDescription>
                                      {item.subject} - Grade {item.grade} - {new Date(item.createdAt).toLocaleDateString()}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <p className="font-semibold">
                                        Objectives: <span className="font-normal">{item.objectives || 'None provided'}</span>
                                      </p>
                                    </div>
                                    <Separator />
                                    <div>
                                      <h3 className="font-semibold text-lg">AI-Generated Content</h3>
                                      <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                                        <div className="prose prose-sm max-w-none">
                                          <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
                                            {generatedContent}
                                          </ReactMarkdown>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => handleDeleteContent(item._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">No AI-generated content available.</p>
                    <p className="text-xs text-muted-foreground mt-1">Generate some content with our AI to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={slideDialogOpen} onOpenChange={setSlideDialogOpen}>
        <DialogContent className="sm:max-w-[800px] bg-[#0f172a] text-white p-0">
          {!presentationResult ? (
            <>
              <DialogHeader className="p-6 pb-2">
                <DialogTitle>Generate PowerPoint Slides</DialogTitle>
              </DialogHeader>
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slideCount" className="text-white">Number of Slides</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="slideCount"
                      type="number"
                      value={slideCount}
                      onChange={(e) => setSlideCount(parseInt(e.target.value) || 10)}
                      min={5}
                      max={30}
                      className="bg-[#1e293b] border-gray-700 text-white"
                    />
                  </div>
                </div>
                
                <DialogFooter className="pt-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setSlideDialogOpen(false)}
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleGenerateSlides} 
                    disabled={isGeneratingSlides}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    {isGeneratingSlides ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Slides'
                    )}
                  </Button>
                </DialogFooter>
              </div>
            </>
          ) : (
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h2 className="text-xl font-semibold">Presentation Ready</h2>
              </div>

              <div className="bg-[#1e293b] rounded-lg p-4">
                <h3 className="font-semibold text-lg">{`${selectedSubject} - ${topic}`}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                  <FileText className="h-4 w-4" />
                  <span>{slideCount} slides</span>
                  <span>PPTX Format</span>
                </div>
              </div>

              <div>
                <h4 className="text-lg mb-4">Preview & Actions</h4>
                <div className="bg-[#1e293b] rounded-lg p-8 text-center aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                    <p className="text-gray-400">Preview not available. Download to view the presentation.</p>
                  </div>
                </div>
              </div>

              <Button 
                onClick={() => {
                  if (presentationResult?.downloadUrl) {
                    window.open(presentationResult.downloadUrl, '_blank');
                  }
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-12"
              >
                <Download className="h-5 w-5 mr-2" />
                Download PPTX
              </Button>

              <div className="text-xs text-gray-400 text-center">
                Generated with SlideSpeak AI • Supports PowerPoint, Google Slides, and more
              </div>
              
              <div className="border-t border-gray-800 pt-4 flex justify-end">
                <Button 
                  variant="ghost" 
                  onClick={() => setSlideDialogOpen(false)}
                  className="text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}