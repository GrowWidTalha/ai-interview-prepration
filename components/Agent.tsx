"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { PhoneOff, Repeat } from "lucide-react"
import { useUser } from "@clerk/nextjs"
import { Skeleton } from "@/components/ui/skeleton"

import { cn } from "@/lib/utils"
import { vapi } from "@/lib/vapi.sdk"
import { jobInterviewer, salesCallAgent, englishPracticeAgent } from "@/lib/vapi-agents"
import { updateInterviewResults } from "@/lib/db"
import { generateInterviewFeedback } from "@/lib/generate-feedback"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

enum CallStatus {
    INACTIVE = "INACTIVE",
    CONNECTING = "CONNECTING",
    ACTIVE = "ACTIVE",
    FINISHED = "FINISHED",
}

interface SavedMessage {
    role: "user" | "system" | "assistant"
    content: string
}

interface Message {
    type: string
    transcriptType?: string
    role: "user" | "system" | "assistant"
    transcript: string
}

interface AgentProps {
    userName: string
    userId?: string
    interviewId: string
    type: string
    interviewTitle?: string
    interviewSubtitle?: string
    questions?: any[]
}

const Agent = ({
    userName,
    userId,
    interviewId,
    type,
    interviewTitle = "Frontend Developer Interview",
    interviewSubtitle = "Technical Interview",
    questions,
}: AgentProps) => {
    const router = useRouter()
    const { user } = useUser()
    const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE)
    const [messages, setMessages] = useState<SavedMessage[]>([])
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [lastMessage, setLastMessage] = useState<string>("")
    const [isMuted, setIsMuted] = useState(false)
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false)
    const transcriptRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom of transcript when new messages arrive
    useEffect(() => {
        if (transcriptRef.current) {
            transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight
        }
    }, [messages])

    useEffect(() => {
        const onCallStart = () => {
            setCallStatus(CallStatus.ACTIVE)
            toast.success("Interview started", {
                description: "You're now connected with the AI interviewer",
            })
        }

        const onCallEnd = () => {
            setCallStatus(CallStatus.FINISHED)
            toast.info("Interview ended", {
                description: "Generating your feedback...",
            })
        }

        const onMessage = (message: Message) => {
            if (message.type === "transcript" && message.transcriptType === "final") {
                const newMessage = { role: message.role, content: message.transcript }
                setMessages((prev) => [...prev, newMessage])
            }
        }

        const onSpeechStart = () => {
            console.log("speech start")
            setIsSpeaking(true)
        }

        const onSpeechEnd = () => {
            console.log("speech end")
            setIsSpeaking(false)
        }

        const onError = (error: Error) => {
            console.log("Error:", error)
            setCallStatus(CallStatus.INACTIVE)
            toast.error("Error", {
                description: "Something went wrong with the interview",
            })
        }

        vapi.on("call-start", onCallStart)
        vapi.on("call-end", onCallEnd)
        vapi.on("message", onMessage)
        vapi.on("speech-start", onSpeechStart)
        vapi.on("speech-end", onSpeechEnd)
        vapi.on("error", onError)

        return () => {
            vapi.off("call-start", onCallStart)
            vapi.off("call-end", onCallEnd)
            vapi.off("message", onMessage)
            vapi.off("speech-start", onSpeechStart)
            vapi.off("speech-end", onSpeechEnd)
            vapi.off("error", onError)
        }
    }, [])

    useEffect(() => {
        if (messages.length > 0) {
            setLastMessage(messages[messages.length - 1].content)
        }

        const handleGenerateFeedback = async (messages: SavedMessage[]) => {
            console.log("handleGenerateFeedback")
            setIsGeneratingFeedback(true)

            try {
                // Extract user responses from messages
                const userResponses = messages
                    .filter((msg) => msg.role === "user")
                    .map((msg, index) => ({
                        questionId: questions && questions[index] ? questions[index].id : `q${index}`,
                        response: msg.content,
                    }))

                // Generate feedback using AI
                const feedback = await generateInterviewFeedback(type, questions || [], userResponses)

                // Update interview results in the database
                await updateInterviewResults(interviewId, {
                    status: "completed",
                    score: feedback.score,
                    confidenceScore: feedback.confidenceScore,
                    enthusiasmScore: feedback.enthusiasmScore,
                    communicationScore: feedback.communicationScore,
                    selfAwarenessScore: feedback.selfAwarenessScore,
                    successRate: feedback.successRate,
                    feedback: {
                        strengths: feedback.feedback.strengths,
                        improvements: feedback.feedback.improvements,
                    },
                    // These will be included in the feedback JSON by the updateInterviewResults function
                    metrics: feedback.metrics,
                    tips: feedback.tips,
                    summary: feedback.summary,
                    userResponses: userResponses,
                    completedAt: new Date(),
                })
                toast.success("Feedback generated", {
                    description: "Redirecting to your results page",
                })

                // Redirect to results page
                router.push(`/interview-results?id=${interviewId}`)
            } catch (error) {
                console.error("Error generating feedback:", error)
                toast.error("Error", {
                    description: "Failed to generate feedback",
                })
                router.push("/dashboard")
            } finally {
                setIsGeneratingFeedback(false)
            }
        }

        if (callStatus === CallStatus.FINISHED && messages.length > 0) {
            handleGenerateFeedback(messages)
        }
    }, [messages, callStatus, interviewId, router, type, questions])

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING)
        toast.info("Connecting...", {
            description: "Establishing connection with AI interviewer",
        })

        try {
            let formattedQuestions = ""
            if (questions && questions.length > 0) {
                formattedQuestions = questions.map((question) => `- ${question.text}`).join("\n")
            }

            // Select the appropriate agent based on interview type
            let agent
            switch (type) {
                case "job":
                    agent = jobInterviewer
                    break
                case "sales":
                    agent = salesCallAgent
                    break
                case "english":
                    agent = englishPracticeAgent
                    break
                default:
                    agent = jobInterviewer
            }

            // Replace the questions placeholder in the agent's system message
            if (agent.model && agent.model.messages && agent.model.messages.length > 0) {
                for (let i = 0; i < agent.model.messages.length; i++) {
                    if (agent.model.messages[i].role === "system") {
                        agent.model.messages[i].content = agent.model.messages[i].content.replace(
                            "{{questions}}",
                            formattedQuestions,
                        )
                    }
                }
            }

            // Start the call with the selected agent
            const res = await vapi.start(agent, {
                variableValues: {
                    username: userName,
                },
            })

            // if (res.)
        } catch (error) {
            console.error("Error starting call:", error)
            toast.error("Connection failed", {
                description: "Failed to connect to the AI interviewer",
            })
            setCallStatus(CallStatus.INACTIVE)
        }
    }

    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED)
        vapi.stop()
        toast.info("Ending call", {
            description: "Your interview is being processed",
        })
    }

    const toggleMute = () => {
        if (callStatus === CallStatus.ACTIVE) {
            if (isMuted) {
                vapi.unmute()
                toast.success("Microphone unmuted")
            } else {
                vapi.mute()
                toast.success("Microphone muted")
            }
            setIsMuted(!isMuted)
        }
    }

    const handleRepeat = () => {
        // Implement repeat functionality
        if (callStatus === CallStatus.ACTIVE && messages.length > 0) {
            const lastAssistantMessage = [...messages].reverse().find((msg) => msg.role === "assistant")
            if (lastAssistantMessage) {
                toast.info("Repeating last question")
                // In a real implementation, you might want to use TTS to repeat the message
                // For now, we'll just show a toast with the message
                toast.info(lastAssistantMessage.content)
            }
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-black text-white">
            {/* Header */}
            <header className="flex justify-between items-center p-4">
                <div className="flex items-center gap-2">
                    <div className="text-xl font-semibold text-white/90">PrepWise</div>
                </div>
                <div className="w-10 h-10 rounded-full overflow-hidden">
                    {user?.imageUrl ? (
                        <Image
                            src={user.imageUrl || "/placeholder.svg"}
                            alt="User"
                            width={40}
                            height={40}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <span className="text-sm">{userName.charAt(0)}</span>
                        </div>
                    )}
                </div>
            </header>

            {/* Interview Title */}
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                        <span className="text-white font-medium">H</span>
                    </div>
                    <h1 className="text-xl font-semibold text-white">{interviewTitle}</h1>
                    <div className="flex gap-2">
                        <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-1 rounded">
                            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                            React
                        </span>
                        <span className="bg-blue-900/50 text-blue-400 text-xs px-2 py-1 rounded">
                            <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                            JS
                        </span>
                    </div>
                </div>
                <div className="bg-gray-800/80 text-white text-sm px-3 py-1 rounded-md">{interviewSubtitle}</div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-6 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* AI Interviewer Card */}
                    <div className="bg-gray-900/70 border border-gray-800 rounded-lg overflow-hidden p-6 flex flex-col items-center justify-center aspect-video">
                        {callStatus === CallStatus.CONNECTING ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <Skeleton className="w-24 h-24 rounded-full bg-gray-800/50" />
                                <Skeleton className="w-32 h-6 mt-4 bg-gray-800/50" />
                                <div className="text-gray-400 text-sm mt-2">Connecting...</div>
                            </div>
                        ) : (
                            <>
                                <div
                                    className={cn(
                                        "relative w-24 h-24 rounded-full flex items-center justify-center",
                                        isSpeaking ? "bg-purple-500/10" : "bg-gray-800",
                                    )}
                                >
                                    <div className={cn("absolute inset-0 rounded-full", isSpeaking && "animate-ping bg-purple-500/10")} />
                                    <div
                                        className={cn(
                                            "w-20 h-20 rounded-full flex items-center justify-center",
                                            isSpeaking ? "bg-purple-500/20" : "bg-gray-700",
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "w-16 h-16 rounded-full flex items-center justify-center",
                                                isSpeaking ? "bg-purple-500/30" : "bg-gray-600",
                                            )}
                                        >
                                            <div className="text-white">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="32"
                                                    height="32"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M14 9.3a4 4 0 0 0-5.3-5.3" />
                                                    <path d="M17 12a7 7 0 0 0-7-7" />
                                                    <path d="M13 19.1a7 7 0 0 1-9.3-9.3" />
                                                    <path d="M16.3 16.3a4 4 0 0 1-5.3 0" />
                                                    <path d="M12 15h.01" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="text-lg font-medium mt-4 text-white">AI Interviewer</h3>
                                {callStatus === CallStatus.ACTIVE && (
                                    <p className="text-gray-400 text-sm mt-1">{isSpeaking ? "Speaking..." : "Listening..."}</p>
                                )}
                            </>
                        )}
                    </div>

                    {/* User Card */}
                    <div className="bg-gray-900/70 border border-gray-800 rounded-lg overflow-hidden p-6 flex flex-col items-center justify-center aspect-video">
                        {user?.imageUrl ? (
                            <div className="w-24 h-24 rounded-full overflow-hidden">
                                <Image
                                    src={user.imageUrl || "/placeholder.svg"}
                                    alt={userName}
                                    width={96}
                                    height={96}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center">
                                <span className="text-2xl">{userName.charAt(0)}</span>
                            </div>
                        )}
                        <h3 className="text-lg font-medium mt-4 text-white">{userName} (You)</h3>
                        {callStatus === CallStatus.ACTIVE && (
                            <p className="text-gray-400 text-sm mt-1">{isMuted ? "Muted" : "Speaking..."}</p>
                        )}
                    </div>
                </div>

                {/* Transcript */}
                <div className="mt-4">
                    {callStatus === CallStatus.INACTIVE && !isGeneratingFeedback ? (
                        <div className="bg-gray-900/70 border border-gray-800 rounded-lg p-6 flex items-center justify-center h-16">
                            <p className="text-gray-400">Start the interview to begin</p>
                        </div>
                    ) : isGeneratingFeedback ? (
                        <div className="bg-gray-900/70 border border-gray-800 rounded-lg p-6">
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <div className="relative w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div
                                        className="absolute top-0 left-0 h-full bg-purple-500"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{
                                            duration: 3,
                                            repeat: Number.POSITIVE_INFINITY,
                                            ease: "linear",
                                        }}
                                    />
                                </div>
                                <p className="text-gray-300">Analyzing your interview and generating feedback...</p>
                                <p className="text-gray-400 text-sm">This may take a moment</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-900/70 border border-gray-800 rounded-lg p-4 min-h-16">
                            {messages.length > 0 ? (
                                <div className="text-white">
                                    {lastMessage && <div className="px-4 py-2 bg-gray-800/50 rounded-lg inline-block">{lastMessage}</div>}
                                </div>
                            ) : callStatus === CallStatus.CONNECTING ? (
                                <div className="flex justify-center">
                                    <Skeleton className="w-3/4 h-8 bg-gray-800/50" />
                                </div>
                            ) : (
                                <div className="text-gray-400 text-center">Waiting for the interview to start...</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4 pb-8">
                {callStatus === CallStatus.ACTIVE && (
                    <>
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-full bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                            onClick={handleRepeat}
                        >
                            <Repeat className="mr-2 h-4 w-4" />
                            Repeat
                        </Button>
                        <Button
                            variant="destructive"
                            size="lg"
                            className="rounded-full bg-red-500 hover:bg-red-600 text-white"
                            onClick={handleDisconnect}
                        >
                            <PhoneOff className="mr-2 h-4 w-4" />
                            Leave interview
                        </Button>
                    </>
                )}

                {callStatus === CallStatus.INACTIVE && !isGeneratingFeedback && (
                    <Button
                        variant="default"
                        size="lg"
                        className="rounded-full bg-green-600 hover:bg-green-700 text-white px-8"
                        onClick={handleCall}
                    >
                        Start Interview
                    </Button>
                )}

                {callStatus === CallStatus.CONNECTING && (
                    <Button variant="outline" size="lg" className="rounded-full bg-gray-800 border-gray-700 text-white" disabled>
                        <span className="mr-2">Connecting</span>
                        <span className="flex space-x-1">
                            <span className="animate-bounce delay-0">.</span>
                            <span className="animate-bounce delay-150">.</span>
                            <span className="animate-bounce delay-300">.</span>
                        </span>
                    </Button>
                )}
            </div>
        </div>
    )
}

export default Agent
