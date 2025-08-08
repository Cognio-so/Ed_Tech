"use client"
import { useState, useEffect } from "react";
import { Plus, Eye, Trash2, Wand2, Loader2, CheckCircle, AlertCircle, Brain, BookOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export default function AssessmentBuilderPage() {
  const [activeTab, setActiveTab] = useState("assessments");
  const [form, setForm] = useState({
    title: "",
    subject: "",
    grade: "",
    duration: "30",
    description: "",
    topic: "",
    difficulty: "Medium",
    learningObjectives: "",
    numQuestions: "10",
    questionTypes: { mcq: true, true_false: false, short_answer: false },
    anxietyTriggers: "",
    customPrompt: ""
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [generatedSolutions, setGeneratedSolutions] = useState([]);
  const [rawContent, setRawContent] = useState("");
  const [formError, setFormError] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch assessments on component mount
  useEffect(() => {
    if (activeTab === "assessments") {
      fetchAssessments();
    }
  }, [activeTab]);

  const fetchAssessments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/assessments');
      if (response.ok) {
        const data = await response.json();
        setAssessments(data.assessments || []);
      }
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
      toast.error('Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setForm(prev => ({ ...prev, [id]: value }));
    setFormError(null);
  };
  
  const handleSelectChange = (id, value) => {
    setForm(prev => ({ ...prev, [id]: value }));
    setFormError(null);
  };

  const handleCheckboxChange = (id) => {
    setForm(prev => ({
      ...prev,
      questionTypes: {
        ...prev.questionTypes,
        [id]: !prev.questionTypes[id]
      }
    }));
  };

  const validateForm = () => {
    if (!form.title || !form.subject || !form.grade || !form.topic) {
      setFormError("Please fill in all required fields");
      return false;
    }
    
    const hasQuestionType = Object.values(form.questionTypes).some(type => type);
    if (!hasQuestionType) {
      setFormError("Please select at least one question type");
      return false;
    }
    
    return true;
  };

  const handleGenerate = async () => {
    if (!validateForm()) return;

    setIsGenerating(true);
    try {
      const response = await fetch('/api/assessments/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedQuestions(data.questions);
        setGeneratedSolutions(data.solutions || []);
        setRawContent(data.rawContent || "");
        toast.success(`Generated ${data.questions.length} questions successfully using AI!`);
      } else {
        toast.error(data.error || 'Failed to generate questions');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate questions');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (status) => {
    if (generatedQuestions.length === 0) {
      toast.error('No questions to save');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          status,
          questions: generatedQuestions,
          solutions: generatedSolutions,
          rawContent: rawContent,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Assessment ${status === 'draft' ? 'saved as draft' : 'published'} successfully!`);
        setActiveTab("assessments");
        fetchAssessments();
        // Reset form
        setForm({
          title: "",
          subject: "",
          grade: "",
          duration: "30",
          description: "",
          topic: "",
          difficulty: "Medium",
          learningObjectives: "",
          numQuestions: "10",
          questionTypes: { mcq: true, true_false: false, short_answer: false },
          anxietyTriggers: "",
          customPrompt: ""
        });
        setGeneratedQuestions([]);
        setGeneratedSolutions([]);
        setRawContent("");
      } else {
        toast.error(data.error || 'Failed to save assessment');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save assessment');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async (assessmentId) => {
    try {
      const response = await fetch(`/api/assessments?id=${assessmentId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAssessments(assessments.filter(assessment => assessment._id !== assessmentId));
        toast.success('Assessment deleted successfully!');
      } else {
        toast.error('Failed to delete assessment');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete assessment');
    }
  };

  const getQuestionTypeDisplay = (type) => {
    const types = {
      mcq: 'MCQ',
      true_false: 'T/F',
      short_answer: 'Short Answer',
      long_answer: 'Long Answer'
    };
    return types[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              AI Assessment Builder
            </h1>
            <p className="text-lg text-muted-foreground mt-1">Create, manage, and deploy AI-powered assessments with Python backend integration.</p>
          </div>
          <Button 
            onClick={() => setActiveTab("builder")} 
            className="gap-2 h-12 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0 shadow-lg"
          >
            <Plus className="h-4 w-4" />
            New Assessment
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 h-12 p-1 bg-white dark:bg-slate-800 shadow-sm border">
            <TabsTrigger value="assessments" className="h-10 text-sm font-medium">
              <BookOpen className="h-4 w-4 mr-2" />
              My Assessments
            </TabsTrigger>
            <TabsTrigger value="builder" className="h-10 text-sm font-medium">
              <Brain className="h-4 w-4 mr-2" />
              AI Assessment Builder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assessments" className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : assessments.length > 0 ? (
              assessments.map((assessment) => (
                <Card key={assessment._id} className="shadow-sm border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl">{assessment.title}</CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">{assessment.subject}</Badge>
                          <Badge variant="outline">{assessment.grade}</Badge>
                          <Badge variant={assessment.status === 'active' ? 'default' : assessment.status === 'draft' ? 'secondary' : 'outline'}>
                            {assessment.status}
                          </Badge>
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            AI Generated
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-9 w-9">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[800px] max-h-[800px] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{assessment.title}</DialogTitle>
                              <DialogDescription>{assessment.description || 'AI-generated assessment with no additional description provided.'}</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <p><span className="font-semibold">Subject:</span> {assessment.subject}</p>
                                <p><span className="font-semibold">Grade:</span> {assessment.grade}</p>
                                <p><span className="font-semibold">Duration:</span> {assessment.duration} mins</p>
                                <p><span className="font-semibold">Status:</span> {assessment.status}</p>
                              </div>
                              <Separator />
                              
                              {/* Questions Section */}
                              <div>
                                <h3 className="font-semibold text-lg mb-3">Questions ({assessment.questions?.length || 0})</h3>
                                {assessment.questions && assessment.questions.length > 0 ? (
                                  <div className="space-y-4 max-h-60 overflow-y-auto">
                                    {assessment.questions.map((q, index) => (
                                      <div key={index} className="p-4 border rounded-md bg-muted/30">
                                        <p className="font-semibold">
                                          {index + 1}. ({getQuestionTypeDisplay(q.type)}) {q.question}
                                        </p>
                                        {q.options && q.options.length > 0 && (
                                          <ul className="list-disc pl-5 mt-2 space-y-1">
                                            {q.options.map((opt, i) => (
                                              <li key={i} className={q.correctAnswer === opt ? "font-bold text-green-600 dark:text-green-400" : ""}>
                                                {opt}
                                              </li>
                                            ))}
                                          </ul>
                                        )}
                                        {q.points && (
                                          <p className="text-xs text-muted-foreground mt-1">Points: {q.points}</p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-muted-foreground">No questions available.</p>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-destructive h-9 w-9" 
                          onClick={() => handleDelete(assessment._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div><p className="text-muted-foreground">Questions</p><p className="font-medium">{assessment.questions?.length || 0}</p></div>
                      <div><p className="text-muted-foreground">Duration</p><p className="font-medium">{assessment.duration} mins</p></div>
                      <div><p className="text-muted-foreground">Created</p><p className="font-medium">{new Date(assessment.createdAt).toLocaleDateString()}</p></div>
                      <div><p className="text-muted-foreground">Status</p><p className="font-medium">{assessment.status}</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No assessments found.</p>
                <p className="text-xs text-muted-foreground mt-1">Create your first AI-powered assessment to get started!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="builder" className="space-y-6">
            <Card className="shadow-sm border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Target className="h-5 w-5 mr-2 text-blue-600" />
                  1. Basic Information
                </CardTitle>
                <CardDescription>Set the core details for your AI-generated assessment.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formError && (
                  <div className="text-red-500 text-sm mb-4 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                    {formError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">Assessment Title *</Label>
                    <Input 
                      id="title" 
                      value={form.title} 
                      onChange={handleInputChange} 
                      placeholder="e.g., Algebra Basics Quiz" 
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
                    <Input 
                      id="subject" 
                      value={form.subject} 
                      onChange={handleInputChange} 
                      placeholder="e.g., Mathematics" 
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="grade" className="text-sm font-medium">Grade Level *</Label>
                    <Select value={form.grade} onValueChange={(v) => handleSelectChange('grade', v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select a grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 12}, (_, i) => (
                          <SelectItem key={i+1} value={`Grade ${i+1}`}>Grade {i+1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium">Duration (minutes) *</Label>
                    <Input 
                      id="duration" 
                      type="number" 
                      value={form.duration} 
                      onChange={handleInputChange} 
                      className="h-11"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description / Instructions</Label>
                  <Textarea 
                    id="description" 
                    value={form.description} 
                    onChange={handleInputChange} 
                    placeholder="Explain the rules, topics covered, etc." 
                    className="resize-none"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  2. AI Generation Settings
                </CardTitle>
                <CardDescription>Provide details for the AI to generate questions using advanced Python backend.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-sm font-medium">Primary Topic *</Label>
                    <Input 
                      id="topic" 
                      value={form.topic} 
                      onChange={handleInputChange} 
                      placeholder="e.g., Photosynthesis" 
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-sm font-medium">Difficulty Level</Label>
                    <Select value={form.difficulty} onValueChange={(v) => handleSelectChange('difficulty', v)}>
                      <SelectTrigger className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="learningObjectives" className="text-sm font-medium">Learning Objectives</Label>
                  <Textarea 
                    id="learningObjectives" 
                    value={form.learningObjectives} 
                    onChange={handleInputChange} 
                    placeholder="What should students know after taking this assessment?" 
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Question Types *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background">
                      <Checkbox 
                        id="mcq" 
                        checked={form.questionTypes.mcq} 
                        onCheckedChange={() => handleCheckboxChange('mcq')} 
                      />
                      <Label htmlFor="mcq" className="text-sm">Multiple Choice</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background">
                      <Checkbox 
                        id="true_false" 
                        checked={form.questionTypes.true_false} 
                        onCheckedChange={() => handleCheckboxChange('true_false')} 
                      />
                      <Label htmlFor="true_false" className="text-sm">True/False</Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg border bg-background">
                      <Checkbox 
                        id="short_answer" 
                        checked={form.questionTypes.short_answer} 
                        onCheckedChange={() => handleCheckboxChange('short_answer')} 
                      />
                      <Label htmlFor="short_answer" className="text-sm">Short Answer</Label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numQuestions" className="text-sm font-medium">Number of Questions</Label>
                    <Input 
                      id="numQuestions" 
                      type="number" 
                      value={form.numQuestions} 
                      onChange={handleInputChange} 
                      min="1"
                      max="50"
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="anxietyTriggers" className="text-sm font-medium">Anxiety Considerations</Label>
                    <Input 
                      id="anxietyTriggers" 
                      value={form.anxietyTriggers} 
                      onChange={handleInputChange} 
                      placeholder="e.g., time pressure, complex wording" 
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customPrompt" className="text-sm font-medium">Additional Instructions (Optional)</Label>
                  <Textarea 
                    id="customPrompt" 
                    value={form.customPrompt} 
                    onChange={handleInputChange} 
                    placeholder="Any specific requirements or styles for the questions..." 
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white border-0 shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Questions with AI...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Questions with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {generatedQuestions.length > 0 && (
              <Card className="shadow-sm border-0 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    3. Review AI-Generated Questions ({generatedQuestions.length} Questions)
                  </CardTitle>
                  <CardDescription>Review the questions generated by our AI and save the assessment.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedQuestions.map((q, index) => (
                      <div key={index} className="p-4 border rounded-lg bg-muted/30">
                        <p className="font-semibold">
                          {index + 1}. ({getQuestionTypeDisplay(q.type)}) {q.question}
                        </p>
                        {q.options && q.options.length > 0 && (
                          <ul className="list-disc pl-5 mt-2 space-y-1">
                            {q.options.map((opt, i) => (
                              <li key={i}>
                                {opt}
                              </li>
                            ))}
                          </ul>
                        )}
                        {q.points && (
                          <p className="text-xs text-muted-foreground mt-1">Points: {q.points}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {generatedSolutions.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div>
                        <h4 className="font-semibold text-lg mb-3">Answer Key ({generatedSolutions.length} Solutions)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {generatedSolutions.map((solution, index) => (
                            <div key={index} className="p-2 text-sm bg-green-50 dark:bg-green-950/30 rounded border">
                              <span className="font-semibold">{solution.questionNumber}.</span>{" "}
                              <span className="text-green-700 dark:text-green-300">{solution.answer}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  
                  <Separator className="my-6" />
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      onClick={() => handleSave('draft')} 
                      disabled={isSaving}
                      className="flex-1 h-12"
                      variant="outline"
                    >
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Save as Draft
                    </Button>
                    <Button 
                      onClick={() => handleSave('active')} 
                      disabled={isSaving}
                      className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                    >
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Publish Assessment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}