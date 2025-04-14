import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { SonnerProvider } from "@/components/sonner-provider"

// Conditionally import ClerkProvider
import { ClerkProvider } from "@clerk/nextjs"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "Interview AI Platform",
    description: "AI-powered interview preparation platform",
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {

    // If Clerk is configured, render with ClerkProvider
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={inter.className}>
                    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                        {children}
                        <SonnerProvider />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}
