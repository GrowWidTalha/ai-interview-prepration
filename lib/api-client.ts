import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000/api/v1';

console.log("[Debug] API Base URL:", API_BASE_URL);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface InterviewQuestion {
  text: string;
  difficulty: string;
  skill_tag: string;
  explanation: string;
  answer?: string;
}

export interface InterviewResponse {
  questions: InterviewQuestion[];
  metadata: {
    skill_distribution: Record<string, number>;
    role_summary?: string;
    skill_coverage?: Record<string, number>;
    scope_summary?: string;
    key_points?: string[];
    potential_challenges?: string[];
    topic_focus?: string;
    learning_objectives?: string[];
  };
}

const endpointMap: Record<string, string> = {
  'job': 'interview',    // Maps to /api/v1/interview
  'sales': 'sales',      // Maps to /api/v1/sales
  'english': 'english'   // Maps to /api/v1/english
};

export const convertDifficulty = (frontendDifficulty: string): string => {
  const difficultyMap: Record<string, string> = {
    'easy': 'beginner',
    'medium': 'intermediate',
    'hard': 'advanced'
  };
  const result = difficultyMap[frontendDifficulty] || frontendDifficulty;
  console.log("[Debug] Converting difficulty:", { from: frontendDifficulty, to: result });
  return result;
};

const ensureMinLength = (text: string, minLength: number, defaultText: string): string => {
  if (!text || text.length < minLength) {
    console.log("[Debug] Text too short, using default:", { original: text, default: defaultText });
    return defaultText;
  }
  return text;
};

export const convertToPythonBackendFormat = (formData: any) => {
  console.log("[Debug] Converting form data to backend format. Input:", formData);
  
  const baseData = {
    difficulty: convertDifficulty(formData.difficulty),
    num_questions: formData.questionCount
  };

  let result;
  switch (formData.type) {
    case 'job': {
      const defaultJobDesc = "Looking for a skilled professional with experience in software development.";
      const defaultResume = "Experienced software developer with strong technical skills.";
      
      // Convert any hyphenated skill tags to underscore format
      const formattedSkills = formData.technologies?.map((skill: string) => 
        skill.replace(/-/g, '_')
      );
      
      result = {
        ...baseData,
        job_description: ensureMinLength(formData.jobDescription, 50, defaultJobDesc),
        resume: ensureMinLength(formData.resume, 50, defaultResume),
        skills: formattedSkills?.length > 0 
          ? formattedSkills.slice(0, 10) 
          : ['general_programming']
      };
      break;
    }

    case 'sales': {
      const defaultScope = "Project scope includes software development and implementation requirements.";
      result = {
        ...baseData,
        project_scope: ensureMinLength(formData.projectDetails, 50, defaultScope)
      };
      break;
    }

    case 'english': {
      result = {
        ...baseData,
        topic: formData.topic || undefined,
      };
      break;
    }

    default:
      throw new Error('Invalid interview type');
  }

  console.log("[Debug] Converted data:", result);
  return result;
};

export const generateInterview = async (type: string, data: any): Promise<InterviewResponse> => {
  try {
    const endpoint = `/${endpointMap[type] || type}`;
    console.log("[Debug] Making API request to:", API_BASE_URL + endpoint);
    console.log("[Debug] Request payload:", data);

    const response = await apiClient.post(endpoint, data);
    console.log("[Debug] API Response:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("[Debug] API Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.config?.data
      }
    });
    throw error;
  }
};

export default apiClient; 