"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import {
  ArrowUpRight,
  Bell,
  Lock,
  Shield,
  ShieldCheck,
  Zap,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  PieChartIcon,
  LineChartIcon,
  Activity,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sample data for charts
const accuracyData = [
  { name: "Our Model", accuracy: 98.7, color: "#8b5cf6" },
  { name: "Model B", accuracy: 92.3, color: "#3b82f6" },
  { name: "Model C", accuracy: 87.5, color: "#10b981" },
  { name: "Model D", accuracy: 84.2, color: "#f59e0b" },
]

const detectionTypeData = [
  { name: "Email Links", value: 98.2, color: "#8b5cf6" },
  { name: "Website URLs", value: 97.8, color: "#3b82f6" },
  { name: "Document Links", value: 96.5, color: "#10b981" },
  { name: "Embedded Links", value: 95.3, color: "#f59e0b" },
]

const timeSeriesData = [
  { name: "Jan", ourModel: 97.2, competitorAvg: 89.5 },
  { name: "Feb", ourModel: 97.5, competitorAvg: 90.1 },
  { name: "Mar", ourModel: 97.8, competitorAvg: 90.3 },
  { name: "Apr", ourModel: 98.1, competitorAvg: 90.8 },
  { name: "May", ourModel: 98.3, competitorAvg: 91.2 },
  { name: "Jun", ourModel: 98.5, competitorAvg: 91.5 },
  { name: "Jul", ourModel: 98.7, competitorAvg: 91.9 },
]

const radarData = [
  { subject: "Accuracy", A: 98, B: 88, fullMark: 100 },
  { subject: "Precision", A: 97, B: 85, fullMark: 100 },
  { subject: "Recall", A: 96, B: 83, fullMark: 100 },
  { subject: "F1 Score", A: 97, B: 84, fullMark: 100 },
  { subject: "Speed", A: 95, B: 90, fullMark: 100 },
]

const recentDetections = [
  { id: 1, type: "Email", threat: "Credential Phishing", confidence: 98.7, time: "2 mins ago", status: "blocked" },
  { id: 2, type: "URL", threat: "Fake Login Page", confidence: 99.2, time: "5 mins ago", status: "blocked" },
  { id: 3, type: "Document", threat: "Malicious Macro", confidence: 97.5, time: "12 mins ago", status: "blocked" },
  { id: 4, type: "Email", threat: "Spear Phishing", confidence: 96.8, time: "18 mins ago", status: "blocked" },
  { id: 5, type: "URL", threat: "Legitimate", confidence: 99.1, time: "25 mins ago", status: "allowed" },
]

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex min-h-screen w-full flex-col bg-gradient-to-b from-slate-950 to-slate-900 text-white pt-16">
      
      <main className="flex-1 p-4 md:p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Analytics Dashboard</h1>
              <p className="text-slate-400">Comprehensive performance metrics of our phishing detection model</p>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList className="grid w-full grid-cols-3 md:w-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Overall Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-white">98.7%</div>
                  <Badge className="bg-green-500/10 text-green-500">+2.3%</Badge>
                </div>
                <Progress value={98.7} className="mt-4 h-2 bg-slate-800" indicatorClassName="bg-purple-500" />
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-xs text-slate-400">Outperforming industry average by 8.2%</p>
              </CardFooter>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Detection Speed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">12ms</div>
                  <Badge className="bg-green-500/10 text-green-500">-5ms</Badge>
                </div>
                <Progress value={92} className="mt-4 h-2 bg-slate-800" indicatorClassName="bg-blue-500" />
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-xs text-slate-400">5x faster than the nearest competitor</p>
              </CardFooter>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">False Positives</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">0.8%</div>
                  <Badge className="bg-green-500/10 text-green-500">-1.2%</Badge>
                </div>
                <Progress value={8} className="mt-4 h-2 bg-slate-800" indicatorClassName="bg-green-500" />
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-xs text-slate-400">Industry leading low false positive rate</p>
              </CardFooter>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Threats Blocked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">15.4K</div>
                  <Badge className="bg-green-500/10 text-green-500">+12%</Badge>
                </div>
                <Progress value={78} className="mt-4 h-2 bg-slate-800" indicatorClassName="bg-amber-500" />
              </CardContent>
              <CardFooter className="pt-0">
                <p className="text-xs text-slate-400">This month, preventing potential breaches</p>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="bg-slate-900/50 border-slate-800 lg:col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Accuracy Comparison</CardTitle>
                  <LineChartIcon className="h-4 w-4 text-slate-400" />
                </div>
                <CardDescription className="text-slate-400">
                  Performance over time compared to competitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" domain={[80, 100]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="ourModel"
                        name="Our Model"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="competitorAvg"
                        name="Competitor Avg"
                        stroke="#94a3b8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800 lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Detection by Type</CardTitle>
                  <PieChartIcon className="h-4 w-4 text-slate-400" />
                </div>
                <CardDescription className="text-slate-400">Accuracy across different phishing vectors</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={detectionTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                        {detectionTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", borderColor: "#334155" }}
                        labelStyle={{ color: "#e2e8f0" }}
                        formatter={(value) => [`${value}%`, "Accuracy"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="bg-slate-900/50 border-slate-800 lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Model Comparison</CardTitle>
                  <BarChart3 className="h-4 w-4 text-slate-400" />
                </div>
                <CardDescription className="text-slate-400">
                  Accuracy comparison with leading competitors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={accuracyData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis type="number" domain={[80, 100]} stroke="#94a3b8" />
                      <YAxis dataKey="name" type="category" stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", borderColor: "#334155" }}
                        labelStyle={{ color: "#000000" }}
                        formatter={(value) => [`${value}%`, "Accuracy"]}
                      />
                      <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
                        {accuracyData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800 lg:col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Detections</CardTitle>
                  <Activity className="h-4 w-4 text-slate-400" />
                </div>
                <CardDescription className="text-slate-400">Live feed of recent phishing attempts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDetections.map((detection) => (
                    <div
                      key={detection.id}
                      className="flex items-center justify-between border-b border-slate-800 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`rounded-full p-2 ${
                            detection.status === "blocked"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-green-500/10 text-green-500"
                          }`}
                        >
                          {detection.status === "blocked" ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{detection.threat}</p>
                          <p className="text-xs text-slate-400">
                            {detection.type} • {detection.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${
                            detection.status === "blocked"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-green-500/10 text-green-500"
                          }`}
                        >
                          {detection.status === "blocked" ? "Blocked" : "Allowed"}
                        </Badge>
                        <div className="text-sm font-medium">{detection.confidence}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  View All Detections
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="bg-slate-900/50 border-slate-800 lg:col-span-3">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Performance Metrics</CardTitle>
                  <Activity className="h-4 w-4 text-slate-400" />
                </div>
                <CardDescription className="text-slate-400">Comprehensive model evaluation metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" stroke="#94a3b8" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" />
                      <Radar name="Our Model" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                      <Radar name="Competitor Avg" dataKey="B" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.3} />
                      <Legend />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-800 lg:col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Key Features</CardTitle>
                  <ShieldCheck className="h-4 w-4 text-slate-400" />
                </div>
                <CardDescription className="text-slate-400">
                  What makes our phishing detection model superior
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="rounded-full bg-purple-500/10 p-1.5">
                        <Zap className="h-4 w-4 text-purple-500" />
                      </div>
                      <h3 className="font-medium">Real-time Detection</h3>
                    </div>
                    <p className="text-sm text-slate-400">
                      Identifies and blocks phishing attempts in milliseconds, before users can interact with them.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="rounded-full bg-blue-500/10 p-1.5">
                        <Shield className="h-4 w-4 text-blue-500" />
                      </div>
                      <h3 className="font-medium">Multi-vector Protection</h3>
                    </div>
                    <p className="text-sm text-slate-400">
                      Protects against phishing in emails, websites, documents, and embedded links with equal
                      effectiveness.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="rounded-full bg-green-500/10 p-1.5">
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      </div>
                      <h3 className="font-medium">Continuous Learning</h3>
                    </div>
                    <p className="text-sm text-slate-400">
                      Self-improving algorithm that adapts to new phishing techniques as they emerge.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-800 bg-slate-950/50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="rounded-full bg-amber-500/10 p-1.5">
                        <Lock className="h-4 w-4 text-amber-500" />
                      </div>
                      <h3 className="font-medium">Enterprise Security</h3>
                    </div>
                    <p className="text-sm text-slate-400">
                      Seamless integration with existing security infrastructure and compliance with industry standards.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Request Technical Whitepaper</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <footer className="border-t border-slate-800 bg-slate-950 p-6 text-center text-sm text-slate-500">
        <p>© 2023 PhishGuard AI. All rights reserved. Real-time data updated every 60 seconds.</p>
      </footer>
    </div>
  )
}

