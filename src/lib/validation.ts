import { z } from 'zod';

/**
 * User registration data interface
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  gender?: string;
}

/**
 * User registration schema
 */
export const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .email('Invalid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(50, 'Email must be less than 50 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(50, 'Password must be less than 50 characters'),
  gender: z.string().optional(),
});

/**
 * Login data interface
 */
export interface LoginData {
  email: string;
  password: string;
}

/**
 * Login schema
 */
export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Survey creation data interface
 */
export interface SurveyData {
  title: string;
  questions: string[];
}

/**
 * Survey creation schema
 */
export const surveySchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  questions: z.array(z.string())
    .min(1, 'At least one question is required')
    .max(20, 'Maximum 20 questions allowed'),
});

/**
 * Survey response data interface
 */
export interface ResponseData {
  surveyId: string;
  answers: Array<{
    questionId: string;
    text: string;
  }>;
}

/**
 * Survey response schema
 */
export const responseSchema = z.object({
  surveyId: z.string().min(1, 'Survey ID is required'),
  answers: z.array(
    z.object({
      questionId: z.string().min(1, 'Question ID is required'),
      text: z.string().min(1, 'Answer text is required'),
    })
  ).min(1, 'At least one answer is required'),
});

/**
 * Question generation data interface
 */
export interface GenerateQuestionsData {
  title: string;
}

/**
 * Question generation schema
 */
export const generateQuestionsSchema = z.object({
  title: z.string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
}); 