"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import { ArrowLeft, Download, Share2, Loader2 } from "lucide-react"
import { getInterviewById } from "@/lib/db"
import { toast } from "sonner"

const COLORS = ["#4f46e5", "#e5e7eb"]

// Helper function to get interview type label
const getInterviewTypeLabel = (interview: any) => {
    if (interview.type === "job") {
        return `Job Interview • ${interview.subType || "General"}${interview.technologies && interview.technologies.length > 0 ? ` • ${interview.technologies.join(", ")}` : ""
            }`
    } else if (interview.type === "sales") {
        return "Sales Call"
    } else if (interview.type === "english") {
        return `English Practice • ${interview.level || "General"}`
    }
    return "Interview"
}

export function InterviewResultsContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const interviewId = searchParams.get("id")

    const [activeTab, setActiveTab] = useState("overview")
    const [interview, setInterview] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Fetch interview data
    useEffect(() => {
        async function fetchInterview() {
            if (!interviewId) {
                toast.error("Error", {
                    description: "No interview ID provided",
                })
                router.push("/dashboard")
                return
            }

            try {
                const interviewData = await getInterviewById(interviewId)

                if (!interviewData) {
                    toast.error("Error", {
                        description: "Interview not found",
                    })
                    router.push("/dashboard")
                    return
                }

                if (interviewData.status !== "completed") {
                    toast.error("Error", {
                        description: "This interview has not been completed yet",
                    })
                    router.push("/dashboard")
                    return
                }

                setInterview(interviewData)
            } catch (error) {
                console.error("Error fetching interview:", error)
                toast.error("Error", {
                    description: "Failed to load interview results",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchInterview()
    }, [interviewId, router])

    // Prepare data for charts
    const confidenceData = interview
        ? [
            { name: "Confident", value: interview.confidenceScore || 65 },
            { name: "Uncertain", value: 100 - (interview.confidenceScore || 65) },
        ]
        : []

    const skillsData = interview
        ? [
            { name: "Technical Knowledge", score: interview.score || 75 },
            { name: "Communication", score: interview.communicationScore || 60 },
            { name: "Self-Awareness", score: interview.selfAwarenessScore || 80 },
            { name: "Enthusiasm", score: interview.enthusiasmScore || 90 },
        ]
        : []

    // Mock feedback data (in a real app, this would come from the database)
    const feedbackData = interview
        ? {
            overallScore: interview.score || 72,
            successRate: interview.successRate || 68,
            metrics: {
                enthusiasm: interview.enthusiasmScore || 14,
                communication: interview.communicationScore || 15,
                selfAwareness: interview.selfAwarenessScore || 16,
                technicalSkills: 17,
                problemSolving: 18,
            },
            feedback: [
                {
                    category: "Enthusiasm & Interest",
                    score: interview.enthusiasmScore || 14,
                    maxScore: 20,
                    comments: [
                        "You showed genuine interest in the role and company.",
                        "Consider researching more about the company's recent projects.",
                        "Your passion for the industry came through clearly.",
                    ],
                },
                {
                    category: "Communication Skills",
                    score: interview.communicationScore || 15,
                    maxScore: 20,
                    comments: [
                        "You articulated your thoughts clearly for most questions.",
                        "Try to use more concrete examples in your responses.",
                        "Your responses were concise but sometimes lacked depth.",
                    ],
                },
                {
                    category: "Self-Awareness & Reflection",
                    score: interview.selfAwarenessScore || 16,
                    maxScore: 20,
                    comments: [
                        "You demonstrated good awareness of your strengths.",
                        "Your discussion of weaknesses was honest but could be more strategic.",
                        "Good reflection on past experiences and lessons learned.",
                    ],
                },
                {
                    category: "Technical Skills",
                    score: 17,
                    maxScore: 20,
                    comments: [
                        "Strong understanding of core concepts.",
                        "Consider deepening knowledge in system design.",
                        "Good problem-solving approach to technical questions.",
                    ],
                },
                {
                    category: "Problem Solving",
                    score: 18,
                    maxScore: 20,
                    comments: [
                        "Excellent analytical thinking demonstrated.",
                        "You broke down complex problems effectively.",
                        "Consider exploring multiple solutions before settling on one.",
                    ],
                },
            ],
            tips: [
                "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions.",
                "Research the company more thoroughly before your next interview.",
                "Prepare 3-5 concrete examples of past achievements that highlight your skills.",
                "Work on explaining technical concepts in simpler terms.",
                "Prepare thoughtful questions to ask the interviewer at the end.",
            ],
        }
        : null

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 px-4 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p>Loading interview results...</p>
                </div>
            </div>
        )
    }

    if (!interview || !feedbackData) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Interview not found</h1>
                    <p className="mb-6">The interview you're looking for doesn't exist or you don't have access to it.</p>
                    <Link href="/dashboard">
                        <Button>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Interview Results</h1>
                    <p className="text-muted-foreground">
                        {getInterviewTypeLabel(interview)} •{" "}
                        {new Date(interview.completedAt || interview.createdAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" /> Download Report
                    </Button>
                    <Button variant="outline" size="sm">
                        <Share2 className="mr-2 h-4 w-4" /> Share Results
                    </Button>
                    <Link href="/dashboard">
                        <Button size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Overall Score</CardTitle>
                        <CardDescription>Your interview performance</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-32">
                            <div className="relative flex flex-col items-center justify-center">
                                <svg className="w-32 h-32">
                                    <circle
                                        className="text-muted stroke-current"
                                        strokeWidth="8"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="58"
                                        cx="64"
                                        cy="64"
                                    />
                                    <circle
                                        className="text-primary stroke-current"
                                        strokeWidth="8"
                                        strokeDasharray={`${feedbackData.overallScore * 3.65} 365`}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="58"
                                        cx="64"
                                        cy="64"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-3xl font-bold">{feedbackData.overallScore}%</span>
                                    <span className="text-sm text-muted-foreground">
                                        {feedbackData.overallScore >= 80
                                            ? "Excellent"
                                            : feedbackData.overallScore >= 60
                                                ? "Good"
                                                : "Needs Improvement"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Success Rate</CardTitle>
                        <CardDescription>Likelihood of passing similar interviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-32">
                            <div className="relative flex flex-col items-center justify-center">
                                <svg className="w-32 h-32">
                                    <circle
                                        className="text-muted stroke-current"
                                        strokeWidth="8"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="58"
                                        cx="64"
                                        cy="64"
                                    />
                                    <circle
                                        className="text-green-500 stroke-current"
                                        strokeWidth="8"
                                        strokeDasharray={`${feedbackData.successRate * 3.65} 365`}
                                        strokeLinecap="round"
                                        stroke="currentColor"
                                        fill="transparent"
                                        r="58"
                                        cx="64"
                                        cy="64"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-3xl font-bold">{feedbackData.successRate}%</span>
                                    <span className="text-sm text-muted-foreground">
                                        {feedbackData.successRate >= 80
                                            ? "Excellent"
                                            : feedbackData.successRate >= 60
                                                ? "Promising"
                                                : "Needs Work"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Confidence Analysis</CardTitle>
                        <CardDescription>How confident you appeared during the interview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-32">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={confidenceData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={60}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {confidenceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="feedback">Detailed Feedback</TabsTrigger>
                    <TabsTrigger value="tips">Improvement Tips</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                            <CardDescription>Breakdown of your performance across key areas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Enthusiasm & Interest</span>
                                        <span>{feedbackData.metrics.enthusiasm}/20</span>
                                    </div>
                                    <Progress value={(feedbackData.metrics.enthusiasm / 20) * 100} className="h-2" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Communication Skills</span>
                                        <span>{feedbackData.metrics.communication}/20</span>
                                    </div>
                                    <Progress value={(feedbackData.metrics.communication / 20) * 100} className="h-2" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Self-Awareness & Reflection</span>
                                        <span>{feedbackData.metrics.selfAwareness}/20</span>
                                    </div>
                                    <Progress value={(feedbackData.metrics.selfAwareness / 20) * 100} className="h-2" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Technical Skills</span>
                                        <span>{feedbackData.metrics.technicalSkills}/20</span>
                                    </div>
                                    <Progress value={(feedbackData.metrics.technicalSkills / 20) * 100} className="h-2" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Problem Solving</span>
                                        <span>{feedbackData.metrics.problemSolving}/20</span>
                                    </div>
                                    <Progress value={(feedbackData.metrics.problemSolving / 20) * 100} className="h-2" />
                                </div>
                            </div>

                            <div className="mt-8">
                                <h3 className="text-lg font-medium mb-4">Skills Assessment</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart
                                        data={skillsData}
                                        margin={{
                                            top: 5,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="score" fill="#4f46e5" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="feedback" className="space-y-4">
                    {feedbackData.feedback.map((item, index) => (
                        <Card key={index}>
                            <CardHeader>
                                <CardTitle>{item.category}</CardTitle>
                                <CardDescription>
                                    Score: {item.score}/{item.maxScore}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {item.comments.map((comment, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-primary mt-1">•</span>
                                            <span>{comment}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="tips" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Improvement Tips</CardTitle>
                            <CardDescription>Actionable advice to help you improve your interview performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-4">
                                {feedbackData.tips.map((tip, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {index + 1}
                                        </div>
                                        <span>{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
