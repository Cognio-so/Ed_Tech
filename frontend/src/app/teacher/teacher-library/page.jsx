"use client";

import { useMemo, useState } from "react";
import { Wand2, Upload, Filter, Plus, Share2, Shield, BarChart3, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function TeacherLibrary() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");
  const [subject, setSubject] = useState("All");
  const [grade, setGrade] = useState("All");

  const types = ["All", "Lesson", "Slide", "Video", "Quiz", "Worksheet"];
  const subjects = ["All", "Science", "Math", "History", "Language"];
  const grades = ["All", "6", "7", "8", "9", "10"];

  const resources = useMemo(
    () => [
      {
        id: "r1",
        title: "Photosynthesis Lab Activity",
        type: "Lesson",
        subject: "Science",
        grade: "7",
        duration: "45 min",
        usage: 124,
        tags: ["Hands-on", "Inquiry"],
      },
      {
        id: "r2",
        title: "Cell Structure Slide Deck",
        type: "Slide",
        subject: "Science",
        grade: "7",
        duration: "30 min",
        usage: 198,
        tags: ["Visual", "Diagrams"],
      },
      {
        id: "r3",
        title: "Ecosystems Quick Quiz",
        type: "Quiz",
        subject: "Science",
        grade: "7",
        duration: "10 min",
        usage: 156,
        tags: ["Formative", "Auto-graded"],
      },
      {
        id: "r4",
        title: "Fractions Word Problems",
        type: "Worksheet",
        subject: "Math",
        grade: "6",
        duration: "20 min",
        usage: 88,
        tags: ["Practice", "Differentiation"],
      },
      {
        id: "r5",
        title: "Water Cycle Basics (Video)",
        type: "Video",
        subject: "Science",
        grade: "7",
        duration: "8 min",
        usage: 64,
        tags: ["ELL", "Accessible"],
      },
      {
        id: "r6",
        title: "Debate: Renewable vs Non-renewable",
        type: "Lesson",
        subject: "History",
        grade: "8",
        duration: "40 min",
        usage: 72,
        tags: ["Discussion", "Critical Thinking"],
      },
    ],
    []
  );

  const filtered = resources.filter((r) => {
    const byQ = q
      ? r.title.toLowerCase().includes(q.toLowerCase()) ||
        r.tags.some((t) => t.toLowerCase().includes(q.toLowerCase()))
      : true;
    const byType = type === "All" ? true : r.type === type;
    const bySubject = subject === "All" ? true : r.subject === subject;
    const byGrade = grade === "All" ? true : r.grade === grade;
    return byQ && byType && bySubject && byGrade;
  });

  const aiIdeas = [
    "Simplify 'Cell Structure Slide Deck' for Grade 6",
    "Translate 'Water Cycle Basics' to Spanish",
    "Generate 5 formative questions for 'Ecosystems Quick Quiz'",
    "Adapt 'Photosynthesis Lab Activity' to 30 minutes",
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Teaching Library</h1>
          <p className="text-sm text-muted-foreground">
            Central hub for lessons, slides, videos, quizzes — search, filter, preview, and add in one click.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <UploadDialog />
          </Dialog>
          <Button variant="secondary" className="gap-2 bg-gradient-to-r from-purple-200 to-purple-300 dark:from-purple-800 dark:to-purple-700">
            <Plus className="h-4 w-4" />
            New folder
          </Button>
        </div>
      </div>

      {/* Search + Filters */}
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search resources, tags, keywords…"
              className="pl-9 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <FilterSelect label="Type" value={type} onValueChange={setType} options={types} />
          <FilterSelect label="Subject" value={subject} onValueChange={setSubject} options={subjects} />
          <FilterSelect label="Grade" value={grade} onValueChange={setGrade} options={grades} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Library grid */}
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Resources</h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{filtered.length} results</span>
              <span>•</span>
              <span>Sort: Most used</span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {filtered.map((r) => (
              <ResourceCard key={r.id} r={r} />
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader>
              <CardTitle className="text-base">AI suggestions</CardTitle>
              <CardDescription>Quick content adaptation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {aiIdeas.map((idea) => (
                <div key={idea} className="flex items-center justify-between rounded-md border p-2">
                  <span className="text-sm">{idea}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700"
                  >
                    <Wand2 className="h-4 w-4" />
                    Run
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader>
              <CardTitle className="text-base">Analytics</CardTitle>
              <CardDescription>Most used</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Bar label="Cell Structure Slide Deck" value={92} />
              <Bar label="Ecosystems Quick Quiz" value={81} />
              <Bar label="Photosynthesis Lab Activity" value={74} />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
            <CardHeader>
              <CardTitle className="text-base">Collaboration</CardTitle>
              <CardDescription>Sharing & moderation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  Share with team
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-gradient-to-r from-teal-200 to-teal-300 dark:from-teal-800 dark:to-teal-700"
                >
                  Create link
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Moderation
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-gradient-to-r from-teal-200 to-teal-300 dark:from-teal-800 dark:to-teal-700"
                >
                  Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onValueChange, options }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[140px] bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function ResourceCard({ r }) {
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
      <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="bg-gradient-to-r from-cyan-200 to-cyan-300 dark:from-cyan-800 dark:to-cyan-700"
            >
              {r.type}
            </Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{r.subject}</span>
          </div>
          <div className="text-xs text-muted-foreground">{r.duration}</div>
        </div>

        <div className="text-sm font-medium">{r.title}</div>

        <div className="flex flex-wrap gap-2">
          {r.tags.map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800"
            >
              {t}
            </Badge>
          ))}
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="h-4 w-4" />
            <span>Used</span>
            <MiniUsage value={r.usage} />
            <span className="text-foreground">{r.usage}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-gradient-to-r from-purple-200 to-purple-300 dark:from-purple-800 dark:to-purple-700"
            >
              Add to lesson
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700"
            >
              Preview
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MiniUsage({ value }) {
  const v = Math.max(0, Math.min(100, (value / 200) * 100));
  return (
    <span className="inline-flex h-1 w-16 overflow-hidden rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
      <span
        className="bg-gradient-to-r from-blue-500 to-blue-400"
        style={{ width: `${v}%` }}
      />
    </span>
  );
}

function Bar({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="line-clamp-1">{label}</span>
        <span className="text-foreground">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function UploadDialog() {
  return (
    <DialogContent className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
      <DialogHeader>
        <DialogTitle>Upload resource</DialogTitle>
        <DialogDescription>Add a new item to your library.</DialogDescription>
      </DialogHeader>
      <div className="grid gap-3 sm:grid-cols-2">
        <LabeledInput label="Title" placeholder="e.g., Forces and Motion Lab" />
        <LabeledInput label="Type" placeholder="Lesson, Slide, Video…" />
        <LabeledInput label="Subject" placeholder="Science, Math, …" />
        <LabeledInput label="Grade" placeholder="6, 7, 8…" />
      </div>
      <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Drag & drop files here, or click to browse
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
        >
          Cancel
        </Button>
        <Button className="bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700">
          Upload
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function LabeledInput({ label, placeholder }) {
  return (
    <label className="text-xs">
      <div className="mb-1 text-muted-foreground">{label}</div>
      <Input
        placeholder={placeholder}
        className="bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600"
      />
    </label>
  );
}