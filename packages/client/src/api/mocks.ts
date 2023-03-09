import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../models/User';

// Hook to return mocks created on quizmine.
export const useCreatedQuizmineMocks = () => {
  return useQuery(
    ['createdQuizmineMocks'],
    async () => {
      // Get paid for mocks created by the current user.
      const q = query(
        collection(db, 'examConfiguration'),
        where('status', '==', 'paid'),
        where('userId', '==', User.data?.uid)
      );

      const querySnapshot = await getDocs(q);
      const mocks = querySnapshot.docs.map((doc) => doc.data());
      return mocks as MockExamDoc[];
    },
    {
      // Don't refetch since this query is used as source of truth across multiple pages
      staleTime: Infinity
    }
  );
};

export interface MockExamDoc {
  schoolLogo: string;
  answerPreviewPDFURL: string;
  generatorPDFURL: string;
  sectionTotal: number;
  finalpdfUrl: string;
  templateCategory: string;
  useProfileLogo: boolean;
  frontpage: Frontpage;
  examDifficulty: number;
  pdfUrl: string;
  status: string;
  answerPDFURL: string;
  sectionBlock: SectionBlock[];
  repetition: string;
  updatedAt: Date;
  templateName: string;
  schoolLogoURL: string;
  examInstructions: string;
  userId: string;
  schoolName: string;
  course: string;
  createdAt: Date;
  templates: string[];
  sectionValidity: string[];
  isProduction: boolean;
  templateCreatedAt: Date;
  configId: string;
  generatorPDFBase64: string;
  examDate: string;
  examTitle: string;
  id: string;
  curriculum: string;
  level: string;
  questions: Question[];
  courseName: string;
}

export interface Frontpage {
  name: string;
  id: string;
  path: string;
}

export interface Question {
  section: string;
  questionIDs: number[];
  questionType: string;
}

export interface SectionBlock {
  questionOverrides: any[];
  questionTotal: number;
  possibleAnswerOrientation: string;
  sectionDuration: number;
  sectionInstructions: string;
  topicPercentages: TopicPercentage[];
  questionType: string;
  topicType: string;
}

export interface TopicPercentage {
  topic: string;
  topicId: string;
  selected: boolean;
  value: number;
}
