"use client";

import { useEffect, useMemo, useState } from "react";
import { Wand2, Upload, Plus, BarChart3, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MarkdownStyles } from "@/components/chat/Markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function TeacherLibrary() {
  const [q, setQ] = useState("");
  // removed type dropdown → using tabs instead
  const [subject, setSubject] = useState("All");
  const [grade, setGrade] = useState("All");

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeType, setActiveType] = useState("All");
  const [preview, setPreview] = useState(null); // holds normalized resource { type, doc, ... }

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      setLoading(true);
      try {
        const [contentRes, presRes, imgRes, comicsRes, webRes, assessRes] = await Promise.allSettled([
          fetch("/api/content").then(r => (r.ok ? r.json() : Promise.reject(r))),
          fetch("/api/presentations").then(r => (r.ok ? r.json() : Promise.reject(r))),
          fetch("/api/images").then(r => (r.ok ? r.json() : Promise.reject(r))),
          fetch("/api/comics").then(r => (r.ok ? r.json() : Promise.reject(r))),
          fetch("/api/web-search").then(r => (r.ok ? r.json() : Promise.reject(r))),
          fetch("/api/assessments").then(r => (r.ok ? r.json() : Promise.reject(r))),
        ]);

        const out = [];

        // Content → Lesson/Worksheet/Video/Quiz depending on contentType
        if (contentRes.status === "fulfilled" && Array.isArray(contentRes.value?.content)) {
          out.push(
            ...contentRes.value.content.map((item) => {
              const t = normalizeType(item.contentType);
              return {
                id: item._id,
                title: item.topic || "Untitled",
                type: t,
                subject: item.subject || "General",
                grade: normalizeGrade(item.grade),
                duration: "-",
                usage: 0,
                tags: cleanTags([
                  t,
                  item.instructionalDepth,
                  item.adaptiveLevel ? "Adaptive" : null,
                  item.includeAssessment ? "Includes Assessment" : null,
                  item.multimediaSuggestions ? "Multimedia" : null,
                  item.emotionalFlags ? `Emotion: ${item.emotionalFlags}` : null,
                ]),
                createdAt: item.createdAt,
                doc: item,
                source: "content",
              };
            })
          );
        }

        // Presentations → Slide
        if (presRes.status === "fulfilled" && Array.isArray(presRes.value?.presentations)) {
          out.push(
            ...presRes.value.presentations.map((p) => ({
              id: p._id,
              title: p.title || p.topic || "Untitled Presentation",
        type: "Slide",
              subject: "General",
              grade: "", // avoid "All" duplication; we treat blank as unassigned
              duration: p.slideCount ? `${p.slideCount} slides` : "-",
              usage: 0,
              tags: cleanTags([p.language, p.includeImages ? "Images" : "No Images", p.status]),
              createdAt: p.createdAt,
              doc: p,
              source: "presentation",
            }))
          );
        }

        // Images → Image
        if (imgRes.status === "fulfilled" && Array.isArray(imgRes.value?.items)) {
          out.push(
            ...imgRes.value.items.map((i) => ({
              id: i._id,
              title: i.topic || "Generated Image",
              type: "Image",
              subject: i.subject || "General",
              grade: normalizeGrade(i.gradeLevel),
              duration: "-",
              usage: 0,
              tags: cleanTags([
                i.visualType,
                i.difficultyFlag && i.difficultyFlag !== "false" ? i.difficultyFlag : null,
                i.status,
              ]),
              createdAt: i.createdAt,
              doc: i,
              source: "image",
            }))
          );
        }

        // Comics → Comic
        if (comicsRes.status === "fulfilled" && Array.isArray(comicsRes.value?.items)) {
          out.push(
            ...comicsRes.value.items.map((c) => ({
              id: c._id,
              title: `Comic: ${truncate(c.instructions || "Story", 40)}`,
              type: "Comic",
              subject: "General",
              grade: normalizeGrade(c.gradeLevel),
              duration: "-",
              usage: 0,
              tags: cleanTags([`Panels: ${c.numPanels}`, c.status]),
              createdAt: c.createdAt,
              doc: c,
              source: "comic",
            }))
          );
        }

        // Web Search → Web Search
        if (webRes.status === "fulfilled" && Array.isArray(webRes.value?.items)) {
          out.push(
            ...webRes.value.items.map((w) => ({
              id: w._id,
              title: w.topic || "Web Search",
              type: "Web Search",
              subject: w.subject || "General",
              grade: normalizeGrade(w.gradeLevel),
              duration: "-",
              usage: 0,
              tags: cleanTags([w.contentType, `Max ${w.maxResults}`]),
              createdAt: w.createdAt,
              doc: w,
              source: "web",
            }))
          );
        }

        // Assessments → Quiz
        if (assessRes.status === "fulfilled" && Array.isArray(assessRes.value?.assessments)) {
          out.push(
            ...assessRes.value.assessments.map((a) => ({
              id: a._id,
              title: a.title || "Assessment",
        type: "Quiz",
              subject: a.subject || "General",
              grade: normalizeGrade(a.grade),
              duration: a.duration ? `${a.duration} min` : "-",
              usage: 0,
              tags: cleanTags([a.status, Array.isArray(a.questions) ? `${a.questions.length} questions` : null]),
              createdAt: a.createdAt,
              doc: a,
              source: "assessment",
            }))
          );
        }

        if (!cancelled) {
          out.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
          setResources(out);
        }
      } catch {
        if (!cancelled) setResources([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // Dynamic filter options from real data
  const allTypes = useMemo(
    () => ["All", ...uniq(resources.map((r) => r.type)).sort()],
    [resources]
  );
  const subjects = useMemo(
    () => ["All", ...uniq(resources.map((r) => r.subject)).sort()],
    [resources]
  );
  const grades = useMemo(
    () =>
      ["All", ...uniq(resources.map((r) => normalizeGrade(r.grade))).filter(Boolean).sort(sortGrades)],
    [resources]
  );

  // Apply text/subject/grade filters first
  const baseFiltered = resources.filter((r) => {
    const byQ = q
      ? r.title.toLowerCase().includes(q.toLowerCase()) ||
        (Array.isArray(r.tags) && r.tags.some((t) => t.toLowerCase().includes(q.toLowerCase())))
      : true;
    const bySubject = subject === "All" ? true : r.subject === subject;
    const byGrade = grade === "All" ? true : r.grade === grade;
    return byQ && bySubject && byGrade;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 bg-gradient-to-br from-rose-50 via-fuchsia-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Teaching Library</h1>
          <p className="text-sm text-muted-foreground">
            Curate lessons, slides, images, quizzes, comics, and web findings in one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow hover:opacity-90">
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <UploadDialog />
          </Dialog>
        </div>
      </div>

      {/* Search + Filters */}
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="flex flex-col gap-3 p-0 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search resources, tags, keywords…"
              className="pl-10 bg-white/70 backdrop-blur dark:bg-gray-800/60 border-0 shadow-sm"
            />
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          {/* Removed Type dropdown — using tabs */}
          <FilterSelect label="Subject" value={subject} onValueChange={setSubject} options={subjects} />
          <FilterSelect label="Grade" value={grade} onValueChange={setGrade} options={grades} />
        </CardContent>
      </Card>

      {/* Type Tabs (driven by real data) */}
      <Tabs value={activeType} onValueChange={setActiveType} className="w-full">
        <TabsList className="flex w-full overflow-x-auto rounded-xl bg-white/70 dark:bg-gray-800/60 p-1 shadow-sm">
          {allTypes.map((t) => (
            <TabsTrigger
              key={t}
              value={t}
              className="px-3 py-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-violet-500 data-[state=active]:text-white rounded-lg"
            >
              {t}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* All */}
        <TabsContent value="All" className="mt-4">
          <TypeSection
            list={baseFiltered}
            loading={loading}
            onPreview={setPreview}
          />
        </TabsContent>

        {/* One content grid per type */}
        {allTypes
          .filter((t) => t !== "All")
          .map((t) => (
            <TabsContent key={t} value={t} className="mt-4">
              <TypeSection
                list={baseFiltered.filter((r) => r.type === t)}
                loading={loading}
                onPreview={setPreview}
              />
            </TabsContent>
          ))}
      </Tabs>

      {/* Preview Modal */}
      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="w-[92vw] max-w-[1200px] max-h-[88vh] bg-white/95 dark:bg-gray-900/95 backdrop-blur p-0">
          <DialogHeader className="flex flex-row items-start justify-between px-4 pt-4">
            <div>
              <DialogTitle className="text-xl">{preview?.title}</DialogTitle>
              <DialogDescription className="mt-1">
                {preview ? `${preview.type} • ${preview.subject}${preview.grade ? ` • Grade ${preview.grade}` : ""}` : ""}
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="px-4 pb-4">
            <div className="h-[70vh] overflow-auto">
              {preview && <PreviewBody r={preview} />}
          </div>
        </div>
          <DialogFooter className="gap-2 px-4 pb-4">
                  <Button
                    size="sm"
                  variant="secondary"
              className="bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800"
              onClick={() => setPreview(null)}
                >
              Close
                </Button>
                <Button
                  size="sm"
              className="bg-gradient-to-r from-pink-500 to-violet-500 text-white"
                >
              Add to lesson
                </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* tiny credit to inspiration */}
      <div className="text-xs text-muted-foreground text-center pt-2">
        UI inspired by design patterns on Dribbble: https://dribbble.com/
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onValueChange, options }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-[140px] bg-white/70 dark:bg-gray-800/60 border-0 shadow-sm">
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

function TypeSection({ list, loading, onPreview }) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-36 bg-white/60 dark:bg-gray-800/60 animate-pulse" />
        ))}
      </div>
    );
  }
  if (!list.length) {
    return <div className="text-sm text-muted-foreground">No items to show.</div>;
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {list.map((r) => (
        <ResourceCard key={r.id} r={r} onPreview={() => onPreview(r)} />
      ))}
    </div>
  );
}

function ResourceCard({ r, onPreview }) {
  return (
    <Card className="overflow-hidden bg-white/80 dark:bg-gray-800/80 border-0 shadow hover:shadow-md transition-shadow rounded-2xl">
      <div className="h-20 bg-gradient-to-r from-rose-200 via-fuchsia-200 to-indigo-200 dark:from-gray-700 dark:via-gray-700 dark:to-gray-700" />
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-gradient-to-r from-pink-500 to-violet-500 text-white">{r.type}</Badge>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{r.subject}</span>
          </div>
          <div className="text-xs text-muted-foreground">{r.duration}</div>
        </div>

        <div className="text-sm font-medium">{r.title}</div>

        <div className="flex flex-wrap gap-2">
          {(r.tags || []).map((t) => (
            <Badge
              key={t}
              variant="outline"
              className="bg-gradient-to-r from-rose-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800"
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
            <MiniUsage value={r.usage || 0} />
            <span className="text-foreground">{r.usage || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              className="bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800"
            >
              Add to lesson
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-gradient-to-r from-pink-500/10 to-violet-500/10 text-foreground"
              onClick={onPreview}
            >
              Preview
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PreviewBody({ r }) {
  const t = r.type;
  const doc = r.doc || {};
  if (t === "Slide") {
    return (
      <div className="space-y-3">
        <div className="text-sm text-muted-foreground">
          {doc.status ? `Status: ${doc.status}` : null}
        </div>
        <div className="flex gap-2">
          {doc.presentationUrl && (
            <Button asChild className="bg-gradient-to-r from-pink-500 to-violet-500 text-white">
              <a href={doc.presentationUrl} target="_blank" rel="noreferrer">Open presentation</a>
            </Button>
          )}
          {doc.downloadUrl && (
            <Button variant="secondary" asChild>
              <a href={doc.downloadUrl} target="_blank" rel="noreferrer">Download</a>
            </Button>
          )}
        </div>
      </div>
    );
  }
  if (t === "Image") {
    return (
      <div className="space-y-2 h-full overflow-auto">
        {doc.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={doc.imageUrl} alt={r.title} className="w-full rounded-lg border" />
        ) : (
          <div className="text-sm text-muted-foreground">No image available.</div>
        )}
        <div className="text-xs text-muted-foreground">{doc.instructions}</div>
      </div>
    );
  }
  if (t === "Comic") {
    const images = doc.images || (Array.isArray(doc.panels) ? doc.panels.map((p) => p.imageUrl) : []);
    return images.length ? (
      <div className="grid grid-cols-2 gap-2 h-full overflow-auto">
        {images.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={url} alt={`Panel ${i + 1}`} className="w-full rounded-md border" />
        ))}
      </div>
    ) : (
      <div className="text-sm text-muted-foreground">No panels available.</div>
    );
  }
  if (t === "Web Search") {
    return (
      <div className="prose dark:prose-invert h-full overflow-auto border rounded-md p-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
          {doc.searchResults || "No search results content."}
        </ReactMarkdown>
      </div>
    );
  }
  if (t === "Quiz") {
    const qs = Array.isArray(doc.questions) ? doc.questions : [];
    return (
      <div className="space-y-3 h-full overflow-auto">
        {qs.length ? (
          qs.map((q, i) => (
            <div key={i} className="rounded-md border p-3">
              <div className="text-sm font-medium">{i + 1}. {q.question}</div>
              {Array.isArray(q.options) && q.options.length ? (
                <ul className="mt-2 text-sm list-disc pl-5">
                  {q.options.map((opt, j) => <li key={j}>{opt}</li>)}
                </ul>
              ) : null}
            </div>
          ))
        ) : (
          <div className="text-sm text-muted-foreground">No questions found.</div>
        )}
      </div>
    );
  }
  // Default (content/lesson/worksheet/video etc.)
  return (
    <div className="prose dark:prose-invert h-full overflow-auto border rounded-md p-4">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownStyles}>
        {doc.generatedContent || "No preview available."}
      </ReactMarkdown>
    </div>
  );
}

function MiniUsage({ value }) {
  const v = Math.max(0, Math.min(100, (value / 200) * 100));
  return (
    <span className="inline-flex h-1 w-16 overflow-hidden rounded-full bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
      <span className="bg-gradient-to-r from-pink-500 to-violet-500" style={{ width: `${v}%` }} />
    </span>
  );
}

/* helpers */
function uniq(arr) {
  return Array.from(new Set(arr.filter(Boolean)));
}
function truncate(s, n) {
  if (!s) return "";
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
function normalizeType(t) {
  if (!t) return "Lesson";
  const s = String(t).toLowerCase();
  if (s.startsWith("slide") || s.startsWith("present")) return "Slide";
  if (s.includes("quiz") || s.includes("assessment")) return "Quiz";
  if (s.includes("worksheet")) return "Worksheet";
  if (s.includes("video")) return "Video";
  if (s.includes("lesson")) return "Lesson";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
function normalizeGrade(g) {
  if (!g) return "";
  const s = String(g).trim();
  if (!s) return "";
  if (s.toLowerCase() === "all") return "";
  return s;
}
function cleanTags(tags) {
  return uniq(tags.map((t) => (t ? String(t) : null)));
}
function sortGrades(a, b) {
  const na = Number(a),
    nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return String(a).localeCompare(String(b));
}

/* Upload dialog (unchanged stub) */
function UploadDialog() {
  return (
    <DialogContent className="bg-white/90 dark:bg-gray-900/90 backdrop-blur">
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
        <Button variant="outline" className="bg-white/70 dark:bg-gray-800/60 border-0 shadow-sm">
          Cancel
        </Button>
        <Button className="bg-gradient-to-r from-pink-500 to-violet-500 text-white">Upload</Button>
      </DialogFooter>
    </DialogContent>
  );
}
function LabeledInput({ label, placeholder }) {
  return (
    <label className="text-xs">
      <div className="mb-1 text-muted-foreground">{label}</div>
      <Input placeholder={placeholder} className="bg-white/70 dark:bg-gray-800/60 border-0 shadow-sm" />
    </label>
  );
}