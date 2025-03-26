import { prisma } from './prisma';
import { Survey, Question, Response, User } from '@prisma/client';

// Define extended types for nested data structures
export interface SurveyWithQuestions extends Survey {
  questions: Question[];
}

export interface SurveyWithQuestionsAndResponses extends Survey {
  questions: (Question & {
    responses: Response[];
  })[];
}

// Define user type without password
export type UserWithoutPassword = Omit<User, 'password'>;

// Define order direction type
export type OrderDirection = 'asc' | 'desc';

// Define options for user queries
export interface UserQueryOptions {
  skip?: number;
  take?: number;
  orderBy?: 'name' | 'createdAt' | 'email';
  orderDirection?: OrderDirection;
  includeEmail?: boolean;
}

// Define statistics interface
export interface SurveyStatistics {
  surveyCount: number;
  questionCount: number;
  responseCount: number;
}

/**
 * Get all surveys with their questions and responses
 */
export async function getAllSurveys(): Promise<SurveyWithQuestionsAndResponses[]> {
  return prisma.survey.findMany({
    include: {
      questions: {
        include: {
          responses: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

/**
 * Create a new survey with questions
 */
export async function createSurvey(
  title: string, 
  questions: string[]
): Promise<SurveyWithQuestionsAndResponses> {
  return prisma.survey.create({
    data: {
      title,
      questions: {
        create: questions.map(text => ({ text })),
      },
    },
    include: {
      questions: {
        include: {
          responses: true,
        },
      },
    },
  });
}

/**
 * Get all users with pagination and sorting options
 */
export async function getUsers({
  skip = 0,
  take = 50,
  orderBy = 'createdAt',
  orderDirection = 'desc',
  includeEmail = true,
}: UserQueryOptions = {}): Promise<UserWithoutPassword[]> {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: includeEmail,
      role: true,
      createdAt: true,
      gender: true,
    },
    skip,
    take,
    orderBy: {
      [orderBy]: orderDirection,
    },
  });
}

/**
 * Get user by ID
 */
export async function getUserById(
  id: string
): Promise<UserWithoutPassword | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      gender: true,
      createdAt: true,
    },
  });

  return user;
}

/**
 * Submit responses for a survey
 */
export async function submitSurveyResponses(
  surveyId: string, 
  answers: Array<{questionId: string; text: string}>
): Promise<Response[]> {
  // Create responses for each question using the provided questionId
  return Promise.all(
    answers.map(answer => 
      prisma.response.create({
        data: {
          surveyId,
          questionId: answer.questionId,
          text: answer.text || '',
        },
      })
    )
  );
}

/**
 * Get survey statistics
 */
export async function getSurveyStatistics(): Promise<SurveyStatistics> {
  const [surveyCount, questionCount, responseCount] = await Promise.all([
    prisma.survey.count(),
    prisma.question.count(),
    prisma.response.count(),
  ]);

  return {
    surveyCount,
    questionCount,
    responseCount,
  };
} 