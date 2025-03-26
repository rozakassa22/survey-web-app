import {
  registerSchema,
  loginSchema,
  surveySchema,
  responseSchema,
  generateQuestionsSchema
} from '../validation';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate a valid registration input', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        gender: 'male'
      };
      
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });
    
    it('should validate without optional gender field', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
    
    it('should reject when name is too short', () => {
      const invalidData = {
        name: 'T', // Too short
        email: 'test@example.com',
        password: 'password123'
      };
      
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['name']);
      }
    });
    
    it('should reject invalid email format', () => {
      const invalidData = {
        name: 'Test User',
        email: 'invalid-email', // Invalid email
        password: 'password123'
      };
      
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['email']);
      }
    });
    
    it('should reject when password is too short', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123' // Too short
      };
      
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['password']);
      }
    });
  });
  
  describe('loginSchema', () => {
    it('should validate a valid login input', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });
    
    it('should reject invalid email format', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123'
      };
      
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['email']);
      }
    });
    
    it('should reject empty password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: ''
      };
      
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['password']);
      }
    });
  });
  
  describe('surveySchema', () => {
    it('should validate a valid survey input', () => {
      const validData = {
        title: 'Test Survey',
        questions: ['Question 1', 'Question 2', 'Question 3']
      };
      
      const result = surveySchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });
    
    it('should reject when title is too short', () => {
      const invalidData = {
        title: 'Te', // Too short
        questions: ['Question 1', 'Question 2']
      };
      
      const result = surveySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['title']);
      }
    });
    
    it('should reject when questions array is empty', () => {
      const invalidData = {
        title: 'Test Survey',
        questions: [] // Empty
      };
      
      const result = surveySchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['questions']);
      }
    });
  });
  
  describe('responseSchema', () => {
    it('should validate a valid response input', () => {
      const validData = {
        surveyId: 'survey-123',
        answers: [
          { questionId: 'q1', text: 'Answer 1' },
          { questionId: 'q2', text: 'Answer 2' }
        ]
      };
      
      const result = responseSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });
    
    it('should reject when surveyId is empty', () => {
      const invalidData = {
        surveyId: '',
        answers: [{ questionId: 'q1', text: 'Answer 1' }]
      };
      
      const result = responseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['surveyId']);
      }
    });
    
    it('should reject when answers array is empty', () => {
      const invalidData = {
        surveyId: 'survey-123',
        answers: [] // Empty
      };
      
      const result = responseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['answers']);
      }
    });
    
    it('should reject when answer text is empty', () => {
      const invalidData = {
        surveyId: 'survey-123',
        answers: [{ questionId: 'q1', text: '' }] // Empty text
      };
      
      const result = responseSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['answers', 0, 'text']);
      }
    });
  });
  
  describe('generateQuestionsSchema', () => {
    it('should validate a valid title input', () => {
      const validData = {
        title: 'Test Topic'
      };
      
      const result = generateQuestionsSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validData);
      }
    });
    
    it('should reject when title is too short', () => {
      const invalidData = {
        title: 'Te' // Too short
      };
      
      const result = generateQuestionsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].path).toEqual(['title']);
      }
    });
  });
}); 