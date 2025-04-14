"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Mic, MicOff, Video, VideoOff, MessageSquare, Loader2 } from "lucide-react"
import { getInterviewById } from "@/lib/db"
import { updateInterviewResultsAction } from "@/actions"
import { toast } from "sonner"

export function InterviewContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const interviewId = searchParams.get("id")

    const [isMuted, setIsMuted] = useState(false)
    const [isVideoOff, setIsVideoOff] = useState(false)
    const [captions, setCaptions] = useState<string[]>([])
    const [currentQuestion, setCurrentQuestion] = useState("")
    const [isInterviewStarted, setIsInterviewStarted] = useState(false)
    const [isInterviewEnded, setIsInterviewEnded] = useState(false)
    const [interview, setInterview] = useState<any>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [questions, setQuestions] = useState<string[]>([])
    const [userResponses, setUserResponses] = useState<string[]>([])
    const captionsRef = useRef<HTMLDivElement>(null)

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

                // Generate questions based on the interview data
                const generatedQuestions = generateQuestions(interviewData)
                setQuestions(generatedQuestions)
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

    // Scroll to bottom of captions when new ones are added
    useEffect(() => {
        if (captionsRef.current) {
            captionsRef.current.scrollTop = captionsRef.current.scrollHeight
        }
    }, [captions])

    // Generate questions based on interview type
    const generateQuestions = (interviewData: any) => {
        // In a real app, this would be handled by your AI model
        // Here we're just using mock questions based on the interview type

        if (!interviewData) return []

        const baseQuestions = [
            "Tell me about yourself and your experience.",
            "Why are you interested in this position?",
            "What are your strengths and weaknesses?",
            "Describe a challenging situation you faced and how you resolved it.",
            "Do you have any questions for me?",
        ]

        if (interviewData.type === "job") {
            if (interviewData.subType === "technical") {
                const techQuestions = [
                    "Explain how you would implement a caching system.",
                    "What's your approach to testing code?",
                    "Describe a complex technical problem you solved recently.",
                    "How do you stay updated with the latest technologies?",
                    "Explain the concept of asynchronous programming.",
                    "What design patterns are you familiar with?",
                    "How would you optimize a slow-performing application?",
                ]

                // Add technology-specific questions if available
                if (interviewData.technologies && interviewData.technologies.includes("React")) {
                    techQuestions.push(
                        "Explain the virtual DOM in React.",
                        "What are React hooks and why were they introduced?",
                        "How do you manage state in a React application?",
                    )
                } else if (interviewData.technologies && interviewData.technologies.includes("Node.js")) {
                    techQuestions.push(
                        "How does the event loop work in Node.js?",
                        "What are streams in Node.js?",
                        "How would you handle authentication in a Node.js application?",
                    )
                }

                return [...baseQuestions, ...techQuestions].slice(0, interviewData.questionCount)
            } else if (interviewData.subType === "behavioral") {
                return [
                    ...baseQuestions,
                    "Tell me about a time you had a conflict with a team member.",
                    "How do you handle tight deadlines?",
                    "Describe a situation where you had to learn something new quickly.",
                    "Tell me about a time you failed and what you learned from it.",
                    "How do you prioritize your work?",
                    "Describe a time when you went above and beyond for a project.",
                    "How do you handle criticism?",
                ].slice(0, interviewData.questionCount)
            } else {
                // Mixed questions
                return [
                    ...baseQuestions,
                    "Tell me about a time you had a conflict with a team member.",
                    "What's your approach to testing code?",
                    "How do you handle tight deadlines?",
                    "Explain how you would implement a caching system.",
                    "Describe a situation where you had to learn something new quickly.",
                ].slice(0, interviewData.questionCount)
            }
        } else if (interviewData.type === "sales") {
            return [
                "Tell me about your freelance services.",
                "How do you typically approach new clients?",
                "What makes your services different from others?",
                "How do you handle objections about pricing?",
                "Can you walk me through your process for delivering projects?",
                "How do you ensure client satisfaction?",
                "Tell me about a challenging client situation and how you resolved it.",
                "How do you follow up with potential clients?",
                "What questions do you ask to understand a client's needs?",
                "How do you handle scope creep in projects?",
            ].slice(0, interviewData.questionCount)
        } else if (interviewData.type === "english") {
            const difficultyMap: Record<string, string[]> = {
                beginner: [
                    "Tell me about your hometown.",
                    "What do you enjoy doing in your free time?",
                    "Describe your family.",
                    "What is your favorite food?",
                    "Tell me about your daily routine.",
                    "What kind of movies do you like?",
                    "Describe your best friend.",
                ],
                intermediate: [
                    "Tell me about a memorable trip you took.",
                    "What are your plans for the future?",
                    "Describe a challenge you've overcome.",
                    "What changes would you like to see in your city?",
                    "Discuss a book or movie that influenced you.",
                    "What are the advantages and disadvantages of social media?",
                    "How has technology changed education?",
                ],
                advanced: [
                    "Discuss the impact of artificial intelligence on society.",
                    "What measures should be taken to address climate change?",
                    "Analyze the pros and cons of remote work.",
                    "How does globalization affect local cultures?",
                    "Discuss the ethical implications of genetic engineering.",
                    "What role should government play in healthcare?",
                    "Analyze the future of transportation in urban areas.",
                ],
            }

            const levelQuestions = difficultyMap[interviewData.level || "intermediate"] || difficultyMap.intermediate
            return levelQuestions.slice(0, interviewData.questionCount)
        }

        return baseQuestions.slice(0, interviewData.questionCount)
    }

    // Simulate interview start
    const startInterview = () => {
        setIsInterviewStarted(true)
        askNextQuestion(0)
    }

    // Simulate asking questions
    const askNextQuestion = (index: number) => {
        if (index < questions.length) {
            setCurrentQuestionIndex(index)
            setCurrentQuestion(questions[index])
            addCaption(`Interviewer: ${questions[index]}`)

            // In a real app, this would be handled by your VAPI integration
        } else {
            endInterview()
        }
    }

    // Add caption to the list
    const addCaption = (text: string) => {
        setCaptions((prev) => [...prev, text])
    }

    // End the interview
    const endInterview = async () => {
        setIsInterviewEnded(true)

        // Generate results based on the interview
        const results = generateResults()

        try {
            // Update interview results in database
            if (interviewId) {
                await updateInterviewResultsAction(interviewId, results)
            }

            toast.success("Interview completed", {
                description: "Your interview has been completed. Redirecting to results...",
            })

            // Redirect to results page
            setTimeout(() => {
                router.push(`/interview-results?id=${interviewId}`)
            }, 2000)
        } catch (error) {
            console.error("Error updating interview results:", error)
            toast.error("Error", {
                description: "Failed to save interview results",
            })
        }
    }

    // Generate mock results
    const generateResults = () => {
        // In a real app, this would be based on AI analysis of the user's responses
        const difficultyFactor = interview.difficulty === "easy" ? 1.2 : interview.difficulty === "hard" ? 0.8 : 1

        // Generate random scores with some variance based on difficulty
        const baseScore = Math.floor(Math.random() * 20) + 65 // Base score between 65-85
        const score = Math.min(100, Math.floor(baseScore * difficultyFactor))

        return {
            score,
            confidenceScore: Math.floor(Math.random() * 30) + 60, // Random score between 60-90
            enthusiasmScore: Math.floor(Math.random() * 6) + 12, // Random score between 12-18
            communicationScore: Math.floor(Math.random() * 6) + 12, // Random score between 12-18
            selfAwarenessScore: Math.floor(Math.random() * 6) + 12, // Random score between 12-18
            successRate: Math.min(100, Math.floor(score * 0.9 + Math.random() * 10)), // Slightly lower than score
            feedback: {
                strengths: [
                    "Good communication skills",
                    "Clear and concise answers",
                    "Demonstrated relevant experience",
                    "Showed enthusiasm for the role",
                ],
                improvements: [
                    "Could provide more specific examples",
                    "Consider structuring answers using the STAR method",
                    "Prepare more questions to ask the interviewer",
                    "Work on conciseness in responses",
                ],
            },
        }
    }

    // Toggle mute
    const toggleMute = () => {
        setIsMuted(!isMuted)
    }

    // Toggle video
    const toggleVideo = () => {
        setIsVideoOff(!isVideoOff)
    }

    // Handle user response
    const handleUserResponse = () => {
        // In a real app, this would capture the user's voice response
        // For now, we'll just simulate a response and move to the next question

        // Generate a mock response based on the question type
        const mockResponses = [
            "I have over 5 years of experience in software development, specializing in web applications.",
            "I'm interested in this position because it aligns with my career goals and the company culture seems great.",
            "My greatest strength is my ability to learn quickly. My weakness is sometimes being too detail-oriented.",
            "When faced with a challenging deadline, I prioritize tasks and communicate clearly with stakeholders.",
            "I implemented a caching system using Redis to improve performance by 40%.",
            "I approach testing with a combination of unit, integration, and end-to-end tests.",
            "I stay updated by following industry blogs, attending conferences, and participating in online communities.",
            "I resolved a conflict with a team member by having an open conversation and finding common ground.",
        ]

        const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)]

        // Add the response to the list
        setUserResponses((prev) => [...prev, randomResponse])
        addCaption(`You: ${randomResponse}`)

        // Move to the next question after a delay
        setTimeout(() => {
            askNextQuestion(currentQuestionIndex + 1)
        }, 1000)
    }

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

    return (
        <div className="flex flex-col h-screen bg-black">
            {/* Main content */}
            <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">
                {/* Interviewer video */}
                <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-800">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Avatar className="h-32 w-32">
                            <img src="/placeholder.svg?height=128&width=128" alt="AI Interviewer" />
                        </Avatar>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-md text-white">AI Interviewer</div>
                </div>

                {/* User video */}
                <div className="flex-1 relative rounded-xl overflow-hidden bg-gray-800">
                    {isVideoOff ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Avatar className="h-32 w-32">
                                <img src="/placeholder.svg?height=128&width=128" alt="You" />
                            </Avatar>
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-gray-700">
                            {/* In a real app, this would be your webcam feed */}
                            <div className="h-full w-full flex items-center justify-center text-white">
                                Camera feed would appear here
                            </div>
                        </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-md text-white">You</div>
                </div>
            </div>

            {/* Captions */}
            <div className="bg-gray-900 p-4 h-32 overflow-y-auto" ref={captionsRef}>
                <div className="text-white space-y-2">
                    {captions.map((caption, index) => (
                        <p key={index}>{caption}</p>
                    ))}
                    {!isInterviewStarted && <p className="text-gray-400">Click "Start Interview" to begin...</p>}
                    {isInterviewEnded && <p className="text-gray-400">Interview completed. Redirecting to results...</p>}
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-900 p-4 border-t border-gray-800">
                <div className="flex justify-center space-x-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-full ${isMuted ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-800 hover:bg-gray-700"}`}
                        onClick={toggleMute}
                    >
                        {isMuted ? <MicOff /> : <Mic />}
                    </Button>

                    <Button
                        variant="outline"
                        size="icon"
                        className={`rounded-full ${isVideoOff ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-800 hover:bg-gray-700"}`}
                        onClick={toggleVideo}
                    >
                        {isVideoOff ? <VideoOff /> : <Video />}
                    </Button>

                    {!isInterviewStarted ? (
                        <Button className="rounded-full px-6 bg-green-600 hover:bg-green-700" onClick={startInterview}>
                            Start Interview
                        </Button>
                    ) : !isInterviewEnded ? (
                        <Button className="rounded-full px-6 bg-blue-600 hover:bg-blue-700" onClick={handleUserResponse}>
                            Submit Response
                        </Button>
                    ) : (
                        <Button className="rounded-full px-6 bg-red-600 hover:bg-red-700" disabled>
                            Interview Ended
                        </Button>
                    )}

                    <Button variant="outline" size="icon" className="rounded-full bg-gray-800 hover:bg-gray-700">
                        <MessageSquare />
                    </Button>
                </div>
            </div>
        </div>
    )
}
