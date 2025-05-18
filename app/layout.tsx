import type React from "react"
import { Inter } from "next/font/google"
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import "./globals.css"
import type { Metadata } from "next"
import { ThemeProvider } from "@/components/theme-provider"
import { SonnerProvider } from "@/components/sonner-provider"

import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

// Conditionally import ClerkProvider
import { ClerkProvider } from "@clerk/nextjs"
import Navbar from "@/components/navbar";

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
                        <NextSSRPlugin
                            /**
                             * The `extractRouterConfig` will extract **only** the route configs
                             * from the router to prevent additional information from being
                             * leaked to the client. The data passed to the client is the same
                             * as if you were to fetch `/api/uploadthing` directly.
                             */
                            routerConfig={extractRouterConfig(ourFileRouter)}
                        />
                        <Navbar />
                        {children}
                        <SonnerProvider />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}
