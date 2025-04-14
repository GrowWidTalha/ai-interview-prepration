"use server"
import { db as prisma} from "./prisma"
import { auth, currentUser } from "@clerk/nextjs/server"

// Get the current user from Clerk and find or create the user in our database
export async function getCurrentUser() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return null
    }

    // Check if user exists in our database
    let user = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    })

    // If user doesn't exist in our database yet, create them
    if (!user) {
      // Get user details from Clerk
      const clerkUser = await currentUser()

      if (!clerkUser) {
        return null
      }

      // Get the primary email
      const primaryEmail = clerkUser.emailAddresses.find((email) => email.id === clerkUser.primaryEmailAddressId)

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: primaryEmail?.emailAddress || "user@example.com",
          name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "User",
          imageUrl: clerkUser.imageUrl,
        },
      })
    }

    return user
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

// Update user profile
export async function updateUserProfile(data: any) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        name: data.name,
        email: data.email,
        bio: data.bio,
      },
    })

    return updatedUser
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}

// Get all interviews for the current user
export async function getUserInterviews() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return []
    }

    const interviews = await prisma.interview.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return interviews
  } catch (error) {
    console.error("Error getting user interviews:", error)
    return []
  }
}

// Create a new interview
export async function createInterview(data: any) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const interview = await prisma.interview.create({
      data: {
        ...data,
        userId: user.id,
        status: "scheduled",
      },
    })

    return interview
  } catch (error) {
    console.error("Error creating interview:", error)
    throw error
  }
}

// Get interview by ID
export async function getInterviewById(id: string) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return null
    }

    const interview = await prisma.interview.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    return interview
  } catch (error) {
    console.error("Error getting interview:", error)
    return null
  }
}

// Update interview with results
export async function updateInterviewResults(id: string, results: any) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const interview = await prisma.interview.update({
      where: {
        id,
      },
      data: {
        status: "completed",
        completedAt: new Date(),
        ...results,
      },
    })

    return interview
  } catch (error) {
    console.error("Error updating interview results:", error)
    throw error
  }
}

// Schedule an interview for a future date
export async function scheduleInterview(id: string, scheduledFor: Date) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const interview = await prisma.interview.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        scheduledFor,
        status: "scheduled",
      },
    })

    return interview
  } catch (error) {
    console.error("Error scheduling interview:", error)
    throw error
  }
}
