// This is a basic implementation. In a production app, you might want to
// use an AI service to generate more dynamic questions.
"use server"
export interface Question {
    id: string
    text: string
    type: string
    followUps?: Question[]
  }

  export function generateInterviewQuestions(interviewData: any): Question[] {
    if (!interviewData) return []

    // Base questions for all interview types
    const baseQuestions = [
      {
        id: "q1",
        text: "Tell me about yourself and your background.",
        type: "introduction",
      },
      {
        id: "q2",
        text: "Why are you interested in this position?",
        type: "motivation",
      },
      {
        id: "q3",
        text: "What are your strengths and weaknesses?",
        type: "self-assessment",
      },
      {
        id: "q4",
        text: "Describe a challenging situation you faced and how you resolved it.",
        type: "behavioral",
      },
      {
        id: "q5",
        text: "Do you have any questions for me?",
        type: "closing",
      },
    ]

    if (interviewData.type === "job") {
      if (interviewData.subType === "technical") {
        const techQuestions = [
          {
            id: "tech-q1",
            text: "Explain how you would implement a caching system.",
            type: "technical",
          },
          {
            id: "tech-q2",
            text: "What's your approach to testing code?",
            type: "technical",
          },
          {
            id: "tech-q3",
            text: "Describe a complex technical problem you solved recently.",
            type: "technical",
          },
          {
            id: "tech-q4",
            text: "How do you stay updated with the latest technologies?",
            type: "technical",
          },
          {
            id: "tech-q5",
            text: "Explain the concept of asynchronous programming.",
            type: "technical",
          },
          {
            id: "tech-q6",
            text: "What design patterns are you familiar with?",
            type: "technical",
          },
          {
            id: "tech-q7",
            text: "How would you optimize a slow-performing application?",
            type: "technical",
          },
        ]

        // Add technology-specific questions if available
        if (interviewData.technologies && interviewData.technologies.includes("react")) {
          techQuestions.push(
            {
              id: "react-q1",
              text: "Explain the virtual DOM in React.",
              type: "technical-react",
            },
            {
              id: "react-q2",
              text: "What are React hooks and why were they introduced?",
              type: "technical-react",
            },
            {
              id: "react-q3",
              text: "How do you manage state in a React application?",
              type: "technical-react",
            },
          )
        } else if (interviewData.technologies && interviewData.technologies.includes("node")) {
          techQuestions.push(
            {
              id: "node-q1",
              text: "How does the event loop work in Node.js?",
              type: "technical-node",
            },
            {
              id: "node-q2",
              text: "What are streams in Node.js?",
              type: "technical-node",
            },
            {
              id: "node-q3",
              text: "How would you handle authentication in a Node.js application?",
              type: "technical-node",
            },
          )
        }

        // Combine and slice to get the requested number of questions
        const allQuestions = [...baseQuestions, ...techQuestions]
        return allQuestions.slice(0, interviewData.questionCount)
      } else if (interviewData.subType === "behavioral") {
        const behavioralQuestions = [
          {
            id: "beh-q1",
            text: "Tell me about a time you had a conflict with a team member.",
            type: "behavioral",
          },
          {
            id: "beh-q2",
            text: "How do you handle tight deadlines?",
            type: "behavioral",
          },
          {
            id: "beh-q3",
            text: "Describe a situation where you had to learn something new quickly.",
            type: "behavioral",
          },
          {
            id: "beh-q4",
            text: "Tell me about a time you failed and what you learned from it.",
            type: "behavioral",
          },
          {
            id: "beh-q5",
            text: "How do you prioritize your work?",
            type: "behavioral",
          },
          {
            id: "beh-q6",
            text: "Describe a time when you went above and beyond for a project.",
            type: "behavioral",
          },
          {
            id: "beh-q7",
            text: "How do you handle criticism?",
            type: "behavioral",
          },
        ]

        // Combine and slice
        const allQuestions = [...baseQuestions, ...behavioralQuestions]
        return allQuestions.slice(0, interviewData.questionCount)
      } else {
        // Mixed questions
        const mixedQuestions = [
          {
            id: "mix-q1",
            text: "Tell me about a time you had a conflict with a team member.",
            type: "behavioral",
          },
          {
            id: "mix-q2",
            text: "What's your approach to testing code?",
            type: "technical",
          },
          {
            id: "mix-q3",
            text: "How do you handle tight deadlines?",
            type: "behavioral",
          },
          {
            id: "mix-q4",
            text: "Explain how you would implement a caching system.",
            type: "technical",
          },
          {
            id: "mix-q5",
            text: "Describe a situation where you had to learn something new quickly.",
            type: "behavioral",
          },
        ]

        // Combine and slice
        const allQuestions = [...baseQuestions, ...mixedQuestions]
        return allQuestions.slice(0, interviewData.questionCount)
      }
    } else if (interviewData.type === "sales") {
      const salesQuestions = [
        {
          id: "sales-q1",
          text: "Tell me about your freelance services.",
          type: "sales-intro",
        },
        {
          id: "sales-q2",
          text: "How do you typically approach new clients?",
          type: "sales-approach",
        },
        {
          id: "sales-q3",
          text: "What makes your services different from others?",
          type: "sales-value",
        },
        {
          id: "sales-q4",
          text: "How do you handle objections about pricing?",
          type: "sales-objection",
        },
        {
          id: "sales-q5",
          text: "Can you walk me through your process for delivering projects?",
          type: "sales-process",
        },
        {
          id: "sales-q6",
          text: "How do you ensure client satisfaction?",
          type: "sales-satisfaction",
        },
        {
          id: "sales-q7",
          text: "Tell me about a challenging client situation and how you resolved it.",
          type: "sales-challenge",
        },
        {
          id: "sales-q8",
          text: "How do you follow up with potential clients?",
          type: "sales-followup",
        },
        {
          id: "sales-q9",
          text: "What questions do you ask to understand a client's needs?",
          type: "sales-discovery",
        },
        {
          id: "sales-q10",
          text: "How do you handle scope creep in projects?",
          type: "sales-scope",
        },
      ]

      return salesQuestions.slice(0, interviewData.questionCount)
    } else if (interviewData.type === "english") {
      const difficultyMap: Record<string, Question[]> = {
        beginner: [
          {
            id: "eng-beg-q1",
            text: "Tell me about your hometown.",
            type: "english-conversation",
          },
          {
            id: "eng-beg-q2",
            text: "What do you enjoy doing in your free time?",
            type: "english-conversation",
          },
          {
            id: "eng-beg-q3",
            text: "Describe your family.",
            type: "english-conversation",
          },
          {
            id: "eng-beg-q4",
            text: "What is your favorite food?",
            type: "english-conversation",
          },
          {
            id: "eng-beg-q5",
            text: "Tell me about your daily routine.",
            type: "english-conversation",
          },
          {
            id: "eng-beg-q6",
            text: "What kind of movies do you like?",
            type: "english-conversation",
          },
          {
            id: "eng-beg-q7",
            text: "Describe your best friend.",
            type: "english-conversation",
          },
        ],
        intermediate: [
          {
            id: "eng-int-q1",
            text: "Tell me about a memorable trip you took.",
            type: "english-conversation",
          },
          {
            id: "eng-int-q2",
            text: "What are your plans for the future?",
            type: "english-conversation",
          },
          {
            id: "eng-int-q3",
            text: "Describe a challenge you've overcome.",
            type: "english-conversation",
          },
          {
            id: "eng-int-q4",
            text: "What changes would you like to see in your city?",
            type: "english-conversation",
          },
          {
            id: "eng-int-q5",
            text: "Discuss a book or movie that influenced you.",
            type: "english-conversation",
          },
          {
            id: "eng-int-q6",
            text: "What are the advantages and disadvantages of social media?",
            type: "english-conversation",
          },
          {
            id: "eng-int-q7",
            text: "How has technology changed education?",
            type: "english-conversation",
          },
        ],
        advanced: [
          {
            id: "eng-adv-q1",
            text: "Discuss the impact of artificial intelligence on society.",
            type: "english-conversation",
          },
          {
            id: "eng-adv-q2",
            text: "What measures should be taken to address climate change?",
            type: "english-conversation",
          },
          {
            id: "eng-adv-q3",
            text: "Analyze the pros and cons of remote work.",
            type: "english-conversation",
          },
          {
            id: "eng-adv-q4",
            text: "How does globalization affect local cultures?",
            type: "english-conversation",
          },
          {
            id: "eng-adv-q5",
            text: "Discuss the ethical implications of genetic engineering.",
            type: "english-conversation",
          },
          {
            id: "eng-adv-q6",
            text: "What role should government play in healthcare?",
            type: "english-conversation",
          },
          {
            id: "eng-adv-q7",
            text: "Analyze the future of transportation in urban areas.",
            type: "english-conversation",
          },
        ],
      }

      const levelQuestions = difficultyMap[interviewData.level || "intermediate"] || difficultyMap.intermediate
      return levelQuestions.slice(0, interviewData.questionCount)
    }

    return baseQuestions.slice(0, interviewData.questionCount)
  }
