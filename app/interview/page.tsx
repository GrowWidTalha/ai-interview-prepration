"use client"

import { Suspense } from "react"
import { InterviewContent } from "./interview-content"
import { Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export default function InterviewPage() {
    return (
        <Suspense
            fallback={
                <motion.div
                    className="flex items-center justify-center h-screen bg-black"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex flex-col items-center space-y-4 text-white">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <div>Loading interview...</div>
                    </div>
                </motion.div>
            }
        >
            <InterviewContent />
        </Suspense>
    )
}
