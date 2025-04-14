"use client"

import { Suspense } from "react"
import { InterviewResultsContent } from "./interview-results-content"
import { Loader2 } from "lucide-react"

export default function InterviewResultsPage() {
    return (
        <Suspense
            fallback={
                <div className="container mx-auto py-10 px-4 flex items-center justify-center">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>Loading interview results...</p>
                    </div>
                </div>
            }
        >
            <InterviewResultsContent />
        </Suspense>
    )
}
