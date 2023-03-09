import { z } from 'zod';

export const createOnlineTestFromMockSchema = z.object({
  testName: z.string(),
  testDescription: z.string(),
  testDuration: z.string(),
  timing: z.enum(['timePerQuestion', 'timePerTest']),
  testStartDate: z.string(),
  testEndDate: z.string(),
  showScore: z.boolean(),
  emailScores: z.boolean(),
  randomizeQuestions: z.boolean(),
  allowMultipleAttempts: z.boolean(),
  allowReview: z.boolean(),
  skipQuestions: z.boolean(),
  participants: z.optional(
    z.array(
      z.object({
        email: z.string(),
        name: z.string(),
        phone: z.string()
      })
    )
  ),
  passingScore: z.number().min(0).max(100),
  mockID: z.string()
});

export type CreateOnlineTestFromMockSchema = z.infer<typeof createOnlineTestFromMockSchema>;
