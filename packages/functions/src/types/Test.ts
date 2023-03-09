import { firestore } from 'firebase-admin';

export interface Test {
  testStartDate: Date;
  randomizeQuestions: boolean;
  showScore: boolean;
  skipQuestions: boolean;
  testDescription: string;
  emailScores: boolean;
  mockID: string;
  createdAt: Date;
  testEndDate: Date;
  mockData: MockExamDoc;
  createdBy: string;
  allowMultipleAttempts: boolean;
  testDuration: string;
  allowReview: boolean;
  testName: string;
  timing: 'timePerTest' | 'timePerQuestion';
  passingScore?: number;
  sectionQuestions?: SectionQuestion[];
  numberOfQuestions?: number;
  sectionAnswers: [
    {
      [key: number]: SectionAnswer;
    }
  ];
  processingStatus: 'pending' | 'processed' | 'failed';
  id: string;
  participants: Participant[];
}
export interface Participant {
  name: string;
  email: string;
  addedAt: string;
  status: ParticipantStatus;
  id: string;
  inviteCode: string;
  lastInvitedAt: string | null;
  lastStartedAt: firestore.Timestamp | null;
  emailInvitationDoc: string | null;
}
export enum ParticipantStatus {
  PENDING = 'PENDING', // default status for new participants
  INVITED = 'INVITED', // status for invited participants
  TAKEN = 'TAKEN', // status for when participant takes test
  GRADED = 'GRADED' // status for when test is graded
}

export interface SectionQuestion {
  topicPercentages: TopicPercentage[];
  questionTotal: number;
  possibleAnswerOrientation: string;
  questionOverrides: number[];
  questionType: string;
  sectionInstructions: string;
  sectionDuration: number;
  topicType: string;
  questions?: QuestionSectionQuestion[];
}

export interface SectionAnswer {
  solution: string;
  id: number;
  option: string;
}

export interface QuestionSectionQuestion {
  qtype: Qtype;
  resource: string;
  answerOptions: AnswerOption[];
  id: number;
  text: string;
  questionNumber: number;
  topic: {
    id: number;
    name: string;
  };
}

export enum Qtype {
  Single = 'SINGLE'
}

export interface AnswerOption {
  option: string;
  id: number;
}
export interface TopicPercentage {
  topicId: string;
  topic: string;
  value: number;
  selected: boolean;
}

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
  questionOverrides: unknown[];
  questionTotal: number;
  possibleAnswerOrientation: string;
  sectionDuration: number;
  sectionInstructions: string;
  topicPercentages: TopicPercentage[];
  questionType: string;
  topicType: string;
}
