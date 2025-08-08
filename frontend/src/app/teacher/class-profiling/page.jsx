"use client";

import { useMemo, useState } from "react";
import { Users, BarChart3, AlertTriangle, Brain, Wand2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function ClassProfiling() {
  const [timeframe, setTimeframe] = useState("week");
  const [manualMode, setManualMode] = useState(false);
  const [selectedClass, setSelectedClass] = useState("7A - Science");

  const stats = useMemo(
    () => [
      { label: "Active learners", value: "27", delta: "+8%", icon: Users },
      { label: "At-risk alerts", value: "4", delta: "−2", icon: AlertTriangle },
      { label: "Avg engagement", value: "78%", delta: "+5%", icon: BarChart3 },
      { label: "Groups", value: "5", delta: "auto", icon: Brain },
    ],
    []
  );

  const groups = useMemo(
    () => [
      {
        name: "Group A",
        count: 6,
        style: ["Visual", "Project-based"],
        motivation: "Peer-driven",
        engagement: 84,
        tips: ["Use visual anchors", "Rotate facilitator", "Offer stretch task"],
      },
      {
        name: "Group B",
        count: 5,
        style: ["Auditory", "Discussion"],
        motivation: "Recognition",
        engagement: 72,
        tips: ["Think-pair-share", "Verbal recap", "Gamify participation"],
      },
      {
        name: "Group C",
        count: 5,
        style: ["Kinesthetic", "Hands-on"],
        motivation: "Progress",
        engagement: 63,
        tips: ["Micro-labs", "Movement break", "Task board"],
      },
      {
        name: "Group D",
        count: 5,
        style: ["Reading/Writing"],
        motivation: "Autonomy",
        engagement: 51,
        tips: ["Choice reading", "Summary journal", "Quiet zone"],
      },
      {
        name: "Group E",
        count: 6,
        style: ["Mixed"],
        motivation: "Support",
        engagement: 41,
        tips: ["Goal contracts", "Feedback loops", "Peer mentor"],
      },
    ],
    []
  );

  const alerts = useMemo(
    () => [
      { level: "warning", text: "Group E engagement dropped −12% vs last week." },
      { level: "info", text: "3 students improved with peer-led tasks." },
      { level: "critical", text: "2 students at risk of disengagement trend." },
    ],
    []
  );

  return (
    <TooltipProvider>
      <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Class Profiling</h1>
            <p className="text-sm text-muted-foreground">
              Grouping by learning style, motivation, and behavior with live insights and AI strategies.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px] bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7A - Science">7A - Science</SelectItem>
                <SelectItem value="7B - Science">7B - Science</SelectItem>
                <SelectItem value="8A - Math">8A - Math</SelectItem>
              </SelectContent>
            </Select>

            <Tabs value={timeframe} onValueChange={setTimeframe} className="w-fit">
              <TabsList className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600">
                <TabsTrigger value="day">Today</TabsTrigger>
                <TabsTrigger value="week">This week</TabsTrigger>
                <TabsTrigger value="month">This month</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-2 rounded-lg border px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700">
              <Switch checked={manualMode} onCheckedChange={setManualMode} id="manual-mode" />
              <label htmlFor="manual-mode" className="text-sm">Manual mode</label>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Card
              key={s.label}
              className="border-dashed bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700"
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700 text-accent-foreground">
                  <s.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-semibold">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
                <Badge variant="outline" className="bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900 dark:to-green-800">
                  {s.delta}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Groups */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Groups</h2>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                AI suggestions
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {groups.map((g, idx) => (
                <Card
                  key={g.name}
                  className="transition-colors bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700"
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{g.name}</CardTitle>
                      {manualMode ? (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-gradient-to-r from-purple-200 to-purple-300 dark:from-purple-800 dark:to-purple-700"
                        >
                          Adjust
                        </Button>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-cyan-200 to-cyan-300 dark:from-cyan-800 dark:to-cyan-700"
                        >
                          Auto
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {g.count} students
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {g.style.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800"
                        >
                          {s}
                        </Badge>
                      ))}
                      <Badge
                        variant="outline"
                        className="bg-gradient-to-r from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800"
                      >
                        Motivation: {g.motivation}
                      </Badge>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Engagement</span>
                        <span className="text-foreground">{g.engagement}%</span>
                      </div>
                      <Progress value={g.engagement} />
                    </div>

                    <Separator />
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground">AI suggests</div>
                      <div className="space-y-2">
                        {g.tips.map((tip, i) => (
                          <div key={i} className="flex items-center justify-between rounded-md border p-2">
                            <span className="text-sm">{tip}</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700"
                                >
                                  Apply
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Quick apply to this group</TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs text-muted-foreground">
                      <span>#{idx + 1} profile</span>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 bg-gradient-to-r from-teal-200 to-teal-300 dark:from-teal-800 dark:to-teal-700"
                      >
                        View details →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right rail */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader>
                <CardTitle className="text-base">Engagement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <MeterRow label="Attention" value={76} />
                <MeterRow label="Participation" value={68} />
                <MeterRow label="Completion" value={81} />
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader>
                <CardTitle className="text-base">Alerts</CardTitle>
                <CardDescription>Trends & notices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.map((a, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border p-3">
                    <div className="flex items-center gap-2">
                      <AlertDot level={a.level} />
                      <span className="text-sm">{a.text}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
                    >
                      View
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700">
              <CardHeader>
                <CardTitle className="text-base">AI strategies</CardTitle>
                <CardDescription>One-click actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {["Differentiate instructions", "Generate visual anchor", "Create 10‑min micro-activity", "Plan re-balance for Group E"].map((t) => (
                  <div key={t} className="flex items-center justify-between rounded-md border p-2">
                    <span className="text-sm">{t}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700"
                    >
                      <Brain className="h-4 w-4" />
                      Run
                    </Button>
                  </div>
                ))}
                <p className="pt-1 text-xs text-muted-foreground">Data is anonymized. Manage in privacy settings.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

function MeterRow({ label, value }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="text-foreground">{value}%</span>
      </div>
      <Progress value={value} />
    </div>
  );
}

function AlertDot({ level }) {
  const color =
    level === "critical"
      ? "bg-gradient-to-r from-red-500 to-red-400"
      : level === "warning"
      ? "bg-gradient-to-r from-amber-500 to-amber-400"
      : "bg-gradient-to-r from-cyan-500 to-cyan-400";
  return <span className={`inline-block h-2.5 w-2.5 rounded-full ${color}`} />;
}