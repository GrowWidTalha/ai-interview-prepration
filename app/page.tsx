"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Mic, BarChart2, Video } from "lucide-react"

// Conditionally import Clerk components
import dynamic from "next/dynamic"

// Dynamically import Clerk components to avoid errors if Clerk is not configured
const UserButton = dynamic(() => import("@clerk/nextjs").then((mod) => mod.UserButton), {
    ssr: false,
    loading: () => <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />,
})

const SignedIn = dynamic(() => import("@clerk/nextjs").then((mod) => mod.SignedIn), { ssr: false, loading: () => null })

const SignedOut = dynamic(() => import("@clerk/nextjs").then((mod) => mod.SignedOut), {
    ssr: false,
    loading: () => null,
})

// Check if Clerk is configured
const isClerkConfigured =
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "your_clerk_publishable_key"

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Navigation */}
            {/* Hero Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto text-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">Master Your Interviews with AI</h1>
                    <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                        Practice job interviews, sales calls, and English speaking with our AI-powered platform. Get real-time
                        feedback and improve your skills.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {isClerkConfigured ? (
                            <>
                                <SignedIn>
                                    <Link href="/create-interview">
                                        <Button size="lg" className="gap-2">
                                            Start Practicing <ArrowRight size={16} />
                                        </Button>
                                    </Link>
                                </SignedIn>
                                <SignedOut>
                                    <Link href="/sign-up">
                                        <Button size="lg" className="gap-2">
                                            Get Started <ArrowRight size={16} />
                                        </Button>
                                    </Link>
                                </SignedOut>
                            </>
                        ) : (
                            <Link href="/create-interview">
                                <Button size="lg" className="gap-2">
                                    Start Practicing <ArrowRight size={16} />
                                </Button>
                            </Link>
                        )}
                        <Link href="#features">
                            <Button size="lg" variant="outline">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-4 bg-muted/50">
                <div className="container mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Why Choose InterviewAI?</h2>

                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="bg-card p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                            <div className="bg-primary/10 p-3 rounded-full mb-4">
                                <Mic className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">AI-Powered Interviews</h3>
                            <p className="text-muted-foreground">
                                Practice with our realistic AI interviewer that adapts to your responses and provides natural
                                conversation.
                            </p>
                        </div>

                        <div className="bg-card p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                            <div className="bg-primary/10 p-3 rounded-full mb-4">
                                <BarChart2 className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Detailed Feedback</h3>
                            <p className="text-muted-foreground">
                                Get comprehensive analysis of your performance with actionable tips to improve your interview skills.
                            </p>
                        </div>

                        <div className="bg-card p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                            <div className="bg-primary/10 p-3 rounded-full mb-4">
                                <Video className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Multiple Interview Types</h3>
                            <p className="text-muted-foreground">
                                Practice job interviews, sales calls, or improve your English speaking skills - all in one platform.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>

                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="flex flex-col items-center text-center">
                            <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold mb-4">
                                1
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Choose Interview Type</h3>
                            <p className="text-muted-foreground">
                                Select from job interviews, sales calls, or English practice sessions.
                            </p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold mb-4">
                                2
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Customize Your Session</h3>
                            <p className="text-muted-foreground">Set difficulty level, number of questions, and specific topics.</p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold mb-4">
                                3
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Practice with AI</h3>
                            <p className="text-muted-foreground">Engage in a realistic interview with our AI interviewer.</p>
                        </div>

                        <div className="flex flex-col items-center text-center">
                            <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center font-bold mb-4">
                                4
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Get Detailed Feedback</h3>
                            <p className="text-muted-foreground">Review your performance and learn how to improve.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-primary text-primary-foreground">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Ace Your Next Interview?</h2>
                    <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
                        Join thousands of professionals who have improved their interview skills with InterviewAI.
                    </p>
                    {isClerkConfigured ? (
                        <>
                            <SignedIn>
                                <Link href="/create-interview">
                                    <Button size="lg" variant="secondary" className="gap-2">
                                        Start Practicing Now <ArrowRight size={16} />
                                    </Button>
                                </Link>
                            </SignedIn>
                            <SignedOut>
                                <Link href="/sign-up">
                                    <Button size="lg" variant="secondary" className="gap-2">
                                        Get Started for Free <ArrowRight size={16} />
                                    </Button>
                                </Link>
                            </SignedOut>
                        </>
                    ) : (
                        <Link href="/create-interview">
                            <Button size="lg" variant="secondary" className="gap-2">
                                Start Practicing Now <ArrowRight size={16} />
                            </Button>
                        </Link>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t py-10 px-4">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-6 md:mb-0">
                            <Link href="/" className="font-bold text-xl">
                                InterviewAI
                            </Link>
                            <p className="text-muted-foreground mt-2">© 2025 InterviewAI. All rights reserved.</p>
                        </div>
                        <div className="flex gap-8">
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                Privacy
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                Terms
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
