"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
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
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts"
import { ArrowLeft, Download, Share2, Loader2, CheckCircle2, XCircle } from "lucide-react"
import { getInterviewById } from "@/lib/db"
import { toast } from "sonner"

const COLORS = ["#4f46e5", "#e5e7eb"]
const RADAR_COLORS = ["#4f46e5", "#10b981", "#f59e0b"]

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

    // Prepare radar data based on interview type
    const getRadarData = () => {
        if (!interview) return []

        if (interview.type === "job") {
            return [
                {
                    subject: "Technical",
                    A: interview.metrics?.technicalKnowledge || 15,
                    fullMark: 20,
                },
                {
                    subject: "Communication",
                    A: interview.communicationScore || 16,
                    fullMark: 20,
                },
                {
                    subject: "Problem Solving",
                    A: interview.metrics?.problemSolving || 14,
                    fullMark: 20,
                },
                {
                    subject: "Cultural Fit",
                    A: interview.metrics?.culturalFit || 17,
                    fullMark: 20,
                },
                {
                    subject: "Leadership",
                    A: interview.metrics?.leadershipPotential || 13,
                    fullMark: 20,
                },
            ]
        } else if (interview.type === "sales") {
            return [
                {
                    subject: "Product Knowledge",
                    A: interview.metrics?.productKnowledge || 16,
                    fullMark: 20,
                },
                {
                    subject: "Objection Handling",
                    A: interview.metrics?.objectionHandling || 14,
                    fullMark: 20,
                },
                {
                    subject: "Closing Ability",
                    A: interview.metrics?.closingAbility || 13,
                    fullMark: 20,
                },
                {
                    subject: "Relationship",
                    A: interview.metrics?.relationshipBuilding || 17,
                    fullMark: 20,
                },
                {
                    subject: "Value Proposition",
                    A: interview.metrics?.valuePropositionClarity || 15,
                    fullMark: 20,
                },
            ]
        } else if (interview.type === "english") {
            return [
                {
                    subject: "Grammar",
                    A: interview.metrics?.grammarAccuracy || 15,
                    fullMark: 20,
                },
                {
                    subject: "Vocabulary",
                    A: interview.metrics?.vocabularyRange || 16,
                    fullMark: 20,
                },
                {
                    subject: "Pronunciation",
                    A: interview.metrics?.pronunciation || 14,
                    fullMark: 20,
                },
                {
                    subject: "Fluency",
                    A: interview.metrics?.fluency || 17,
                    fullMark: 20,
                },
                {
                    subject: "Comprehension",
                    A: interview.metrics?.comprehension || 18,
                    fullMark: 20,
                },
            ]
        }

        // Default radar data
        return [
            {
                subject: "Communication",
                A: interview.communicationScore || 16,
                fullMark: 20,
            },
            {
                subject: "Enthusiasm",
                A: interview.enthusiasmScore || 14,
                fullMark: 20,
            },
            {
                subject: "Self-Awareness",
                A: interview.selfAwarenessScore || 15,
                fullMark: 20,
            },
            {
                subject: "Confidence",
                A: interview.confidenceScore / 5 || 14,
                fullMark: 20,
            },
            {
                subject: "Overall",
                A: interview.score / 5 || 15,
                fullMark: 20,
            },
        ]
    }

    const radarData = getRadarData()

    // Get metrics based on interview type
    const getMetricsData = () => {
        if (!interview) return []

        const baseMetrics = [
            { name: "Communication", score: interview.communicationScore || 15 },
            { name: "Enthusiasm", score: interview.enthusiasmScore || 14 },
            { name: "Self-Awareness", score: interview.selfAwarenessScore || 16 },
        ]

        if (interview.type === "job") {
            return [
                ...baseMetrics,
                { name: "Technical Knowledge", score: interview.metrics?.technicalKnowledge || 15 },
                { name: "Problem Solving", score: interview.metrics?.problemSolving || 14 },
            ]
        } else if (interview.type === "sales") {
            return [
                ...baseMetrics,
                { name: "Product Knowledge", score: interview.metrics?.productKnowledge || 16 },
                { name: "Objection Handling", score: interview.metrics?.objectionHandling || 14 },
            ]
        } else if (interview.type === "english") {
            return [
                ...baseMetrics,
                { name: "Grammar", score: interview.metrics?.grammarAccuracy || 15 },
                { name: "Vocabulary", score: interview.metrics?.vocabularyRange || 16 },
            ]
        }

        return baseMetrics
    }

    const metricsData = getMetricsData()

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

    if (!interview) {
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
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4"
            >
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
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
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
                                            strokeDasharray={`${interview.score * 3.65} 365`}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="58"
                                            cx="64"
                                            cy="64"
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-3xl font-bold">{interview.score}%</span>
                                        <span className="text-sm text-muted-foreground">
                                            {interview.score >= 80 ? "Excellent" : interview.score >= 60 ? "Good" : "Needs Improvement"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
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
                                            strokeDasharray={`${interview.successRate * 3.65} 365`}
                                            strokeLinecap="round"
                                            stroke="currentColor"
                                            fill="transparent"
                                            r="58"
                                            cx="64"
                                            cy="64"
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-3xl font-bold">{interview.successRate}%</span>
                                        <span className="text-sm text-muted-foreground">
                                            {interview.successRate >= 80
                                                ? "Excellent"
                                                : interview.successRate >= 60
                                                    ? "Promising"
                                                    : "Needs Work"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
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
                                            animationBegin={300}
                                            animationDuration={1500}
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
                </motion.div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="feedback">Detailed Feedback</TabsTrigger>
                    <TabsTrigger value="tips">Improvement Tips</TabsTrigger>
                    <TabsTrigger value="responses">Your Responses</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Performance Summary</CardTitle>
                                <CardDescription>Overall assessment of your interview performance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-muted/20 p-4 rounded-lg border mb-6">
                                    <p className="text-lg italic">{interview.feedback?.summary || "No summary available."}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-3">Key Strengths</h3>
                                        <ul className="space-y-2">
                                            {interview.feedback?.strengths?.map((strength: string, index: number) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>{strength}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium mb-3">Areas for Improvement</h3>
                                        <ul className="space-y-2">
                                            {interview.feedback?.improvements?.map((improvement: string, index: number) => (
                                                <li key={index} className="flex items-start gap-2">
                                                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                                    <span>{improvement}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance Metrics</CardTitle>
                                    <CardDescription>Breakdown of your performance across key areas</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6">
                                        {Object.entries(interview.feedback?.metrics || {}).map(
                                            ([key, value]: [string, any], index: number) => (
                                                <div key={key} className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="capitalize">{key.replace(/([A-Z])/g, " $1").trim()}</span>
                                                        <span>{value}/20</span>
                                                    </div>
                                                    <Progress value={(value / 20) * 100} className="h-2" />
                                                </div>
                                            ),
                                        )}

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Communication Skills</span>
                                                <span>{interview.communicationScore}/20</span>
                                            </div>
                                            <Progress value={(interview.communicationScore / 20) * 100} className="h-2" />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Enthusiasm & Interest</span>
                                                <span>{interview.enthusiasmScore}/20</span>
                                            </div>
                                            <Progress value={(interview.enthusiasmScore / 20) * 100} className="h-2" />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span>Self-Awareness</span>
                                                <span>{interview.selfAwarenessScore}/20</span>
                                            </div>
                                            <Progress value={(interview.selfAwarenessScore / 20) * 100} className="h-2" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Skills Assessment</CardTitle>
                                    <CardDescription>Visual representation of your skills</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                <PolarGrid />
                                                <PolarAngleAxis dataKey="subject" />
                                                <PolarRadiusAxis angle={30} domain={[0, 20]} />
                                                <Radar
                                                    name="Performance"
                                                    dataKey="A"
                                                    stroke="#4f46e5"
                                                    fill="#4f46e5"
                                                    fillOpacity={0.6}
                                                    animationBegin={300}
                                                    animationDuration={1500}
                                                />
                                                <Tooltip />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </TabsContent>

                <TabsContent value="feedback" className="space-y-4">
                    {interview.feedback?.strengths && interview.feedback?.improvements && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detailed Feedback</CardTitle>
                                    <CardDescription>Comprehensive analysis of your interview performance</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-medium mb-3">Strengths</h3>
                                        <ul className="space-y-3">
                                            {interview.feedback.strengths.map((strength: string, index: number) => (
                                                <li
                                                    key={index}
                                                    className="flex items-start gap-3 bg-green-50 dark:bg-green-950/20 p-3 rounded-lg"
                                                >
                                                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p>{strength}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-medium mb-3">Areas for Improvement</h3>
                                        <ul className="space-y-3">
                                            {interview.feedback.improvements.map((improvement: string, index: number) => (
                                                <li key={index} className="flex items-start gap-3 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                                                    <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p>{improvement}</p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="pt-4">
                                        <h3 className="text-lg font-medium mb-3">Performance Metrics</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <BarChart
                                                        data={metricsData}
                                                        margin={{
                                                            top: 5,
                                                            right: 30,
                                                            left: 20,
                                                            bottom: 5,
                                                        }}
                                                        layout="vertical"
                                                    >
                                                        <CartesianGrid strokeDasharray="3 3" />
                                                        <XAxis type="number" domain={[0, 20]} />
                                                        <YAxis dataKey="name" type="category" width={150} />
                                                        <Tooltip />
                                                        <Bar dataKey="score" fill="#4f46e5" animationBegin={300} animationDuration={1500} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>

                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="font-medium mb-1">Overall Score</h4>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={interview.score} className="h-2 flex-1" />
                                                        <span className="text-sm font-medium w-10 text-right">{interview.score}%</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium mb-1">Confidence</h4>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={interview.confidenceScore} className="h-2 flex-1" />
                                                        <span className="text-sm font-medium w-10 text-right">{interview.confidenceScore}%</span>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="font-medium mb-1">Success Rate</h4>
                                                    <div className="flex items-center gap-2">
                                                        <Progress value={interview.successRate} className="h-2 flex-1" />
                                                        <span className="text-sm font-medium w-10 text-right">{interview.successRate}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </TabsContent>

                <TabsContent value="tips" className="space-y-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Improvement Tips</CardTitle>
                                <CardDescription>Actionable advice to help you improve your interview performance</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    {interview.feedback?.tips?.map((tip: string, index: number) => (
                                        <motion.li
                                            key={index}
                                            className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/20 transition-colors"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.1 }}
                                        >
                                            <div className="bg-primary/10 text-primary rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                {index + 1}
                                            </div>
                                            <span>{tip}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>

                <TabsContent value="responses" className="space-y-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Responses</CardTitle>
                                <CardDescription>Review your answers to the interview questions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {interview.userResponses?.map((response: any, index: number) => {
                                        const question = interview.questions?.find((q: any) => q.id === response.questionId)
                                        return (
                                            <div key={index} className="border rounded-lg p-4 hover:bg-muted/10 transition-colors">
                                                <h3 className="font-medium text-lg mb-2">Question {index + 1}:</h3>
                                                <p className="mb-4 text-muted-foreground">{question?.text || "Unknown question"}</p>

                                                <h4 className="font-medium mb-2">Your Response:</h4>
                                                <p className="bg-muted/20 p-3 rounded-md">{response.response}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
