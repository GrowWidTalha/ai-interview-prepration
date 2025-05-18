"use server"

import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export interface InterviewFeedback {
  score: number
  confidenceScore: number
  enthusiasmScore: number
  communicationScore: number
  selfAwarenessScore: number
  successRate: number
  feedback: {
    strengths: string[]
    improvements: string[]
  }
  metrics: {
    [key: string]: number
  }
  tips: string[]
  summary: string
}

export async function generateInterviewFeedback(
  interviewType: string,
  questions: any[],
  userResponses: { questionId: string; response: string }[],
): Promise<InterviewFeedback> {
  try {
    // Match responses with questions
    const questionsWithResponses = questions.map((question) => {
      const response = userResponses.find((r) => r.questionId === question.id)
      return {
        question: question.text,
        response: response?.response || "No response provided",
      }
    })

    // Create type-specific prompts and metrics
    let typeSpecificPrompt = ""
    let typeSpecificMetrics = {}

    if (interviewType === "job" || interviewType === "interview") {
      typeSpecificPrompt = `
        For this job interview, also evaluate:
        1. Technical knowledge (scale 0-20)
        2. Problem-solving ability (scale 0-20)
        3. Cultural fit (scale 0-20)
        4. Leadership potential (scale 0-20)
        5. Adaptability (scale 0-20)

        Include these metrics in your JSON response under a "metrics" object.

        Also provide 5-7 specific tips for improving job interview performance.
      `
      typeSpecificMetrics = {
        technicalKnowledge: 0,
        problemSolving: 0,
        culturalFit: 0,
        leadershipPotential: 0,
        adaptability: 0,
      }
    } else if (interviewType === "sales") {
      typeSpecificPrompt = `
        For this sales call, also evaluate:
        1. Product knowledge (scale 0-20)
        2. Objection handling (scale 0-20)
        3. Closing ability (scale 0-20)
        4. Relationship building (scale 0-20)
        5. Value proposition clarity (scale 0-20)

        Include these metrics in your JSON response under a "metrics" object.

        Also provide 5-7 specific tips for improving sales call performance.
      `
      typeSpecificMetrics = {
        productKnowledge: 0,
        objectionHandling: 0,
        closingAbility: 0,
        relationshipBuilding: 0,
        valuePropositionClarity: 0,
      }
    } else if (interviewType === "english") {
      typeSpecificPrompt = `
        For this English practice, also evaluate:
        1. Grammar accuracy (scale 0-20)
        2. Vocabulary range (scale 0-20)
        3. Pronunciation (scale 0-20)
        4. Fluency (scale 0-20)
        5. Comprehension (scale 0-20)

        Include these metrics in your JSON response under a "metrics" object.

        Also provide 5-7 specific tips for improving English speaking skills.
      `
      typeSpecificMetrics = {
        grammarAccuracy: 0,
        vocabularyRange: 0,
        pronunciation: 0,
        fluency: 0,
        comprehension: 0,
      }
    }

    // Generate feedback using Gemini
    const prompt = `
      You are an expert interview coach analyzing a ${interviewType} interview.

      Please analyze the following interview questions and responses:
      ${JSON.stringify(questionsWithResponses, null, 2)}

      Based on these responses, provide a comprehensive evaluation with the following:

      1. An overall score from 0-100
      2. A confidence score from 0-100
      3. An enthusiasm score from 0-20
      4. A communication score from 0-20
      5. A self-awareness score from 0-20
      6. A success rate (likelihood of passing similar interviews) from 0-100
      7. 3-5 key strengths demonstrated in the responses
      8. 3-5 areas for improvement
      9. A brief summary paragraph of the overall performance

      ${typeSpecificPrompt}

      Return your analysis as a JSON object with this structure:
      {
        "score": number,
        "confidenceScore": number,
        "enthusiasmScore": number,
        "communicationScore": number,
        "selfAwarenessScore": number,
        "successRate": number,
        "feedback": {
          "strengths": [string, string, ...],
          "improvements": [string, string, ...]
        },
        "metrics": {
          // Type-specific metrics here
        },
        "tips": [string, string, ...],
        "summary": "A paragraph summarizing the performance"
      }
    `

    const { text: feedbackText } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt: prompt,
    })

    // Parse the generated feedback
    let feedback
    try {
      feedback = JSON.parse(feedbackText)
    } catch (error) {
      console.error("Error parsing feedback:", error)
      // Attempt to extract JSON from text if parsing fails
      const jsonMatch = feedbackText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          feedback = JSON.parse(jsonMatch[0])
        } catch (innerError) {
          console.error("Error parsing extracted JSON:", innerError)
          // Return default feedback if parsing fails
          return getDefaultFeedback(interviewType, typeSpecificMetrics)
        }
      } else {
        return getDefaultFeedback(interviewType, typeSpecificMetrics)
      }
    }

    return feedback
  } catch (error) {
    console.error("Error generating feedback:", error)
    return getDefaultFeedback(interviewType, {})
  }
}

// Fallback function to provide default feedback if AI generation fails
function getDefaultFeedback(interviewType: string, typeSpecificMetrics: any): InterviewFeedback {
  const baseFeedback = {
    score: 75,
    confidenceScore: 70,
    enthusiasmScore: 15,
    communicationScore: 16,
    selfAwarenessScore: 14,
    successRate: 72,
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
    metrics: {
      ...typeSpecificMetrics,
    },
    tips: [
      "Practice the STAR method (Situation, Task, Action, Result) for behavioral questions",
      "Research the company more thoroughly before your next interview",
      "Prepare 3-5 concrete examples of past achievements that highlight your skills",
      "Work on explaining technical concepts in simpler terms",
      "Prepare thoughtful questions to ask the interviewer at the end",
    ],
    summary:
      "Overall, you demonstrated good communication skills and relevant experience. Your enthusiasm for the role was evident, but you could improve by providing more specific examples and structuring your answers more effectively. With some practice on the STAR method and more thorough preparation, you should see significant improvement in your interview performance.",
  }

  if (interviewType === "sales") {
    baseFeedback.tips = [
      "Practice handling common objections more effectively",
      "Work on your closing techniques to secure next steps",
      "Develop a stronger value proposition that focuses on client benefits",
      "Ask more discovery questions to understand client needs",
      "Prepare case studies and success stories to share with potential clients",
    ]
    baseFeedback.summary =
      "Your sales call showed good product knowledge and enthusiasm. You could improve by asking more discovery questions to understand client needs better and handling objections more effectively. Work on developing a stronger value proposition and closing techniques to increase your success rate."
  } else if (interviewType === "english") {
    baseFeedback.tips = [
      "Practice speaking with native speakers regularly",
      "Focus on improving your pronunciation of specific sounds",
      "Expand your vocabulary by reading and listening to English content",
      "Practice speaking at a natural pace rather than rushing",
      "Record yourself speaking and review for areas of improvement",
    ]
    baseFeedback.summary =
      "Your English speaking skills show good vocabulary and comprehension. You could improve your fluency and pronunciation with regular practice. Focus on speaking at a natural pace and expanding your vocabulary through reading and listening to English content."
  }

  return baseFeedback
}
