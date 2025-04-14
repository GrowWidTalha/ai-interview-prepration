"use client"

import { Suspense } from "react"
import { InterviewContent } from "./interview-content"
import { Loader2 } from "lucide-react"

export default function InterviewPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-screen bg-black">
                    <div className="flex flex-col items-center space-y-4 text-white">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <div>Loading interview...</div>
                    </div>
                </div>
            }
        >
            <InterviewContent />
        </Suspense>
    )
}
