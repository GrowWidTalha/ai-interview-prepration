import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { Button } from './ui/button'

const Navbar = () => {
    const isClerkConfigured =
        typeof window !== "undefined" &&
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== "your_clerk_publishable_key"

    return (
        <header className="border-b">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/" className="font-bold text-2xl">
                    InterviewAI
                </Link>
                <div className="flex items-center gap-4">
                    {isClerkConfigured ? (
                        <>
                            <SignedIn>
                                <Link href="/dashboard">
                                    <Button variant="ghost">Dashboard</Button>
                                </Link>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                            <SignedOut>
                                <Link href="/sign-in">
                                    <Button variant="ghost">Sign In</Button>
                                </Link>
                                <Link href="/sign-up">
                                    <Button>Get Started</Button>
                                </Link>
                            </SignedOut>
                        </>
                    ) : (
                        <>
                            <Link href="/dashboard">
                                <Button variant="ghost">Dashboard</Button>
                            </Link>
                            <Link href="/create-interview">
                                <Button>Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Navbar
