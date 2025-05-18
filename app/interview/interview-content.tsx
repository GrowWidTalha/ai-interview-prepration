"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getInterviewById } from "@/lib/db"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import Agent from "@/components/Agent"

export function InterviewContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const interviewId = searchParams.get("id")

    const [interview, setInterview] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [userName, setUserName] = useState("Candidate")

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

                // If interview is already completed, redirect to results
                if (interviewData.status === "completed") {
                    toast.info("Interview completed", {
                        description: "This interview has already been completed. Redirecting to results.",
                    })
                    router.push(`/interview-results?id=${interviewId}`)
                    return
                }

                setInterview(interviewData)

                // Get user name from localStorage if available
                const storedName = localStorage.getItem("userName")
                if (storedName) {
                    setUserName(storedName)
                }
            } catch (error) {
                console.error("Error fetching interview:", error)
                toast.error("Error", {
                    description: "Failed to load interview",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchInterview()
    }, [interviewId, router])

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black">
                <div className="flex flex-col items-center space-y-4 text-white">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <div>Loading interview...</div>
                </div>
            </div>
        )
    }

    // Determine interview title and subtitle
    const getInterviewTitle = () => {
        if (interview.type === "job") {
            if (interview.subType === "technical") {
                return `${interview.role || "Frontend Developer"} Interview`
            } else {
                return `${interview.subType || "Job"} Interview`
            }
        } else if (interview.type === "sales") {
            return "Sales Call"
        } else {
            return "English Practice"
        }
    }

    const getInterviewSubtitle = () => {
        if (interview.type === "job") {
            return interview.subType || "Technical Interview"
        } else if (interview.type === "sales") {
            return "Sales Pitch"
        } else {
            return interview.level || "Conversation"
        }
    }

    return (
        <Agent
            userName={userName}
            interviewId={interviewId || ""}
            type={interview.type}
            interviewTitle={getInterviewTitle()}
            interviewSubtitle={getInterviewSubtitle()}
            questions={interview.questions || []}
        />
    )
}
