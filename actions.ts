"use server"

import { z } from "zod"
import { createInterview, updateInterviewResults, updateUserProfile as updateUserProfileDb } from "@/lib/db"
import { currentUser } from "@clerk/nextjs/server"
import { generateInterview, convertToPythonBackendFormat } from "@/lib/api-client"

// Schema for interview creation
const interviewSchema = z.object({
  type: z.enum(["job", "sales", "english"]),
  clerkId: z.string(),
  subType: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  projectDetails: z.string().optional(),
  pdfUrl: z.string().optional(),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  questionCount: z.number().min(3).max(20),
  difficulty: z.enum(["easy", "medium", "hard"]),
})

// Create interview action
export async function createInterviewAction(formData: FormData) {
  try {
    // Parse form data
    const rawData = Object.fromEntries(formData.entries())

    // Handle technologies array
    let technologies: string[] = []
    if (rawData.technologies) {
      technologies = Array.isArray(rawData.technologies) ? rawData.technologies : [rawData.technologies.toString()]
    }

    // Prepare data for validation
    const user = await currentUser()
    if(!user){
        throw new Error("user not found")
        console.log(user)
    }
    console.log(user)

    const data = {
      type: rawData.type as string,
      subType: rawData.subType as string,
      technologies,
      clerkId: user.id,
      projectDetails: rawData.projectDetails as string,
      pdfUrl: rawData.pdfUrl as string,
      level: rawData.level as string,
      questionCount: Number.parseInt(rawData.questionCount as string, 10),
      difficulty: rawData.difficulty as string,
    }

    // Validate data
    const validatedData = interviewSchema.parse(data)

    // Generate questions first using the API
    const { questions, metadata } = await generateInterview(validatedData.type, convertToPythonBackendFormat(validatedData));

    const { clerkId, ...dataWithoutClerkId } = validatedData;

    const interview = await createInterview({
      ...dataWithoutClerkId,
      questions: questions,
      metadata: metadata,
    });
    return { success: true, interviewId: interview.id }
  } catch (error) {
    console.error("Error creating interview:", error)
    return { success: false, error: "Failed to create interview" }
  }
}

// Schema for interview results
const resultsSchema = z.object({
  score: z.number().min(0).max(100),
  confidenceScore: z.number().min(0).max(100),
  enthusiasmScore: z.number().min(0).max(20),
  communicationScore: z.number().min(0).max(20),
  selfAwarenessScore: z.number().min(0).max(20),
  successRate: z.number().min(0).max(100),
  feedback: z.any(), // This would be more strictly typed in a real app
  userResponses: z
    .array(
      z.object({
        questionId: z.string(),
        response: z.string(),
      }),
    )
    .optional(),
})

// Update interview results action
export async function updateInterviewResultsAction(interviewId: string, results: any) {
  try {
    // Validate results
    const validatedResults = resultsSchema.parse(results)

    // Update interview in database
    await updateInterviewResults(interviewId, validatedResults)

    return { success: true }
  } catch (error) {
    console.error("Error updating interview results:", error)
    return { success: false, error: "Failed to update interview results" }
  }
}

// Schema for user profile update
const userProfileSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  bio: z
    .string()
    .max(500, {
      message: "Bio must not be longer than 500 characters.",
    })
    .optional(),
})

// Update user profile action
export async function updateUserProfileAction(data: any) {
  try {
    // Validate data
    const validatedData = userProfileSchema.parse(data)

    // Update user profile in database
    await updateUserProfileDb(validatedData)

    return { success: true }
  } catch (error) {
    console.error("Error updating user profile:", error)
    return { success: false, error: "Failed to update user profile" }
  }
}
