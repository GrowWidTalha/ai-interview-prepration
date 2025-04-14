"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock, BarChart2, ArrowUpRight, Loader2 } from "lucide-react"
import { getUserInterviews } from "@/lib/db"
import { toast } from "sonner"

// Helper function to format date
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

// Helper function to format time
const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    })
}

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

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState("all")
    const [interviews, setInterviews] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Fetch interviews from the database
    useEffect(() => {
        async function fetchInterviews() {
            try {
                const data = await getUserInterviews()
                setInterviews(data)
            } catch (error) {
                console.error("Error fetching interviews:", error)
                toast.error("Error", {
                    description: "Failed to load your interviews",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchInterviews()
    }, [])

    // Filter interviews based on active tab
    const filteredInterviews =
        activeTab === "all" ? interviews : interviews.filter((interview) => interview.type === activeTab)

    // Calculate statistics
    const totalInterviews = interviews.length
    const completedInterviews = interviews.filter((interview) => interview.status === "completed")
    const averageScore =
        completedInterviews.length > 0
            ? Math.round(
                completedInterviews.reduce((acc, interview) => acc + (interview.score || 0), 0) / completedInterviews.length,
            )
            : 0
    const bestScore =
        completedInterviews.length > 0 ? Math.max(...completedInterviews.map((interview) => interview.score || 0)) : 0

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground">View your past interviews and practice sessions</p>
                </div>
                <Link href="/create-interview">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> New Interview
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Total Interviews</CardTitle>
                        <CardDescription>Your practice sessions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading...</span>
                            </div>
                        ) : (
                            <div className="text-3xl font-bold">{totalInterviews}</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Average Score</CardTitle>
                        <CardDescription>Across all interviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading...</span>
                            </div>
                        ) : (
                            <div className="text-3xl font-bold">{averageScore || "N/A"}%</div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Best Performance</CardTitle>
                        <CardDescription>Your highest score</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Loading...</span>
                            </div>
                        ) : (
                            <div className="text-3xl font-bold">{bestScore || "N/A"}%</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="all">All Interviews</TabsTrigger>
                    <TabsTrigger value="job">Job Interviews</TabsTrigger>
                    <TabsTrigger value="sales">Sales Calls</TabsTrigger>
                    <TabsTrigger value="english">English Practice</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                    {isLoading ? (
                        <Card>
                            <CardContent className="flex items-center justify-center py-10">
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span>Loading your interviews...</span>
                                </div>
                            </CardContent>
                        </Card>
                    ) : filteredInterviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredInterviews.map((interview) => (
                                <Card key={interview.id} className="overflow-hidden">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            {interview.score ? (
                                                <Badge

                                                    variant={
                                                        interview.score >= 80 ? "outline" : interview.score >= 60 ? "default" : "destructive"
                                                    }
                                                    className={interview.score >= 80 ? "bg-green-500" : interview.score >= 60 ? "" : "bg-red-500"}
                                                >
                                                    {interview.score}%
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline">{interview.status}</Badge>
                                            )}
                                            <Avatar className="h-10 w-10">
                                                {interview.type === "job" && <img src="/placeholder.svg?height=40&width=40" alt="Job" />}
                                                {interview.type === "sales" && <img src="/placeholder.svg?height=40&width=40" alt="Sales" />}
                                                {interview.type === "english" && (
                                                    <img src="/placeholder.svg?height=40&width=40" alt="English" />
                                                )}
                                            </Avatar>
                                        </div>
                                        <CardTitle className="text-lg mt-2">{getInterviewTypeLabel(interview)}</CardTitle>
                                        <CardDescription className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {formatDate(interview.createdAt)}
                                            <span className="mx-1">•</span>
                                            <Clock className="h-3 w-3" /> {formatTime(interview.createdAt)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-2">
                                        <div className="flex items-center gap-2 text-sm">
                                            <BarChart2 className="h-4 w-4 text-muted-foreground" />
                                            <span>
                                                {interview.status === "completed"
                                                    ? interview.score >= 80
                                                        ? "Excellent performance"
                                                        : interview.score >= 60
                                                            ? "Good performance"
                                                            : "Needs improvement"
                                                    : interview.status === "scheduled"
                                                        ? "Scheduled"
                                                        : "Not started"}
                                            </span>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        {interview.status === "completed" ? (
                                            <Link href={`/interview-results?id=${interview.id}`} className="w-full">
                                                <Button variant="outline" className="w-full">
                                                    View Results <ArrowUpRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        ) : (
                                            <Link href={`/interview?id=${interview.id}`} className="w-full">
                                                <Button variant="outline" className="w-full">
                                                    Continue Interview <ArrowUpRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex flex-col items-center justify-center py-10">
                                <div className="text-center space-y-2">
                                    <h3 className="text-lg font-medium">No interviews found</h3>
                                    <p className="text-muted-foreground">
                                        You haven't completed any {activeTab !== "all" ? activeTab : ""} interviews yet.
                                    </p>
                                    <Link href="/create-interview">
                                        <Button className="mt-4">
                                            <Plus className="mr-2 h-4 w-4" /> Start a New Interview
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
