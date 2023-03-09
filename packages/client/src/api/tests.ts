import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  Unsubscribe,
  updateDoc,
  where
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import { ParticipantStatus } from '../components/TestDetailTabs/ParticipantsTab';
import {
  db,
  getTestDetailsCallable,
  GetTestDetailsResponse,
  gradeAnswersCallable,
  GradeAnswersResponse,
  joinTestCallable,
  JoinTestResponse,
  processInviteCallable,
  ProcessInviteResponse,
  startTestCallable,
  StartTestResponse
} from '../firebase';
import { User } from '../models/User';
import { obfuscate } from '../utils';
import { axios } from './common';
import { MockExamDoc } from './mocks';

export const useCreateOnlineTest = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ ...body }: CreateTestSchema) => {
      try {
        const res = await axios.post('/create-test', body);
        return res.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          throw new Error(error?.response?.data?.message || 'Something went wrong');
        }
        throw new Error('Something went wrong creating the test. Try again');
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['createdTests']);
      }
    }
  );
};

export const useFetchCreatedTests = () => {
  const queryClient = useQueryClient();

  return useQuery<{ docs: Test[]; unsubscribe: Unsubscribe }>(['createdTests'], async () => {
    const q = query(collection(db, 'onlineTests'), where('createdBy', '==', User.data.uid));
    const querySnapshot = await getDocs(q);

    const tests = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    // Get participants, results and answers for each test
    const testsWithParticipantsAndAnswers = await Promise.all(
      tests.map(async (test) => {
        const participants = await getDocs(
          query(collection(db, 'onlineTests', test.id, 'participants'))
        );
        const participantData = participants.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        const answers = await getDocs(
          query(collection(db, 'onlineTests', test.id, 'sectionAnswers'))
        );
        const results = await getDocs(query(collection(db, 'onlineTests', test.id, 'submissions')));
        const resultsData = results.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

        // Add participant data to results
        const resultsWithParticipants = resultsData.map((result) => {
          const participant = participantData.find((p) => p.id === result.id);

          return {
            ...result,
            participant
          };
        });

        return {
          ...test,
          participants: participantData,
          sectionAnswers: answers.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
          results: resultsWithParticipants.reverse()
        };
      })
    );

    // Register listeners for each test
    const unsubscribe = onSnapshot(q, async (newSnap) => {
      const tests = newSnap.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      // Get participants and answers subcollections for each test
      const testsWithParticipantsAndAnswers = await Promise.all(
        tests.map(async (test) => {
          const participants = await getDocs(
            query(collection(db, 'onlineTests', test.id, 'participants'))
          );
          const participantData = participants.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
          const answers = await getDocs(
            query(collection(db, 'onlineTests', test.id, 'sectionAnswers'))
          );
          const results = await getDocs(
            query(collection(db, 'onlineTests', test.id, 'submissions'))
          );
          const resultsData = results.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

          // Add participant data to results
          const resultsWithParticipants = resultsData.map((result) => {
            const participant = participantData.find((p) => p.id === result.id);

            return {
              ...result,
              participant
            };
          });

          return {
            ...test,
            participants: participantData,
            sectionAnswers: answers.docs.map((doc) => ({ ...doc.data(), id: doc.id })),
            results: resultsWithParticipants.reverse()
          };
        })
      );

      queryClient.setQueryData(['createdTests'], {
        docs: testsWithParticipantsAndAnswers,
        unsubscribe
      });
    });

    // Workaround to unsubscribe from listeners
    return { docs: testsWithParticipantsAndAnswers as unknown as Test[], unsubscribe };
  });
};

export const useAddParticipantsToTest = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      testID,
      participants,
      sendEmails
    }: {
      testID: string;
      participants: {
        email: string;
        name: string;
        phone: string;
      }[];
      sendEmails: boolean;
    }) => {
      try {
        const res = await axios.post(`/add-participants/${testID}`, { participants, sendEmails });
        return res.data;
      } catch (error) {
        console.error(error);
        if (error instanceof AxiosError) {
          throw error?.response?.data.message;
        }
        throw new Error('Something went wrong adding the participants. Try again');
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['createdTests']);
      }
    }
  );
};

export const useRemoveParticipantFromTest = () => {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ testID, participantID }: { testID: string; participantID: string }) => {
      await deleteDoc(doc(db, 'onlineTests', testID, 'participants', participantID));
    },
    {
      onSuccess: (data, vars: { testID: string; participantID: string }) => {
        queryClient.setQueryData(
          ['createdTests'],
          (data: { docs: Test[]; unsubscribe: Unsubscribe } | undefined) => {
            if (!data) {
              return undefined;
            }

            const test = data?.docs?.find((t) => t.id === vars.testID);
            if (!test) {
              return undefined;
            }

            return {
              unsubscribe: data.unsubscribe,
              docs: [
                ...data.docs.filter((t) => t.id !== vars.testID),
                {
                  ...test,
                  participants: test.participants.filter((p) => p.id !== vars.participantID)
                }
              ]
            };
          }
        );

        toast.success('Participant removed');
        queryClient.invalidateQueries(['createdTests']);
      }
    }
  );
};

export const useResendInvite = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ testID, participantIDs }: { testID: string; participantIDs: string[] }) => {
      try {
        const res = await axios.post('/resend-invite/', { testID, participantIDs });
        return res.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          throw new Error(error?.response?.data.message);
        }
        throw new Error('Failed to send invite. Try again');
      }
    },
    {
      onSuccess: () => {
        toast.success('Invite sent');
        queryClient.invalidateQueries(['createdTests']);
      },
      onError: (error) => {
        toast.error(String((error as any).message));
      }
    }
  );
};

export const useSendResultsMail = () => {
  return useMutation(
    async ({ testID, participantIDs }: { testID: string; participantIDs: string[] }) => {
      try {
        const res = await axios.post('/send-results/', { testID, participantIDs });
        return res.data;
      } catch (error) {
        if (error instanceof AxiosError) {
          throw new Error(error?.response?.data.message);
        }
        throw new Error('Failed to send results mail. Try again');
      }
    }
  );
};

export const useProcessInvite = () => {
  return useMutation(async ({ invite }: { invite: string }) => {
    try {
      const res = await processInviteCallable({ invite });

      // Deobfuscate the test data
      const d = obfuscate(res.data, 10204, false);

      return JSON.parse(d) as ProcessInviteResponse;
    } catch (error: any) {
      throw new Error(error.message);
    }
  });
};

export const useGradeAnswers = () => {
  return useMutation(
    async ({
      invite,
      answers
    }: {
      invite: string;
      answers: { questionID: number; answerID: number | undefined | null }[];
    }) => {
      try {
        const res = await gradeAnswersCallable({ invite, answers });

        // Deobfuscate the response
        const d = obfuscate(res.data, 10204, false);

        return JSON.parse(d) as GradeAnswersResponse;
      } catch (error: any) {
        throw String(error.message);
      }
    }
  );
};

export const useReportTestStart = () => {
  return useMutation(async ({ invite }: { invite: string }) => {
    try {
      const res = await startTestCallable({ invite });

      // Deobfuscate the response
      const d = obfuscate(res.data, 10204, false);
      return JSON.parse(d) as StartTestResponse;
    } catch (error: any) {
      throw new Error(error.message);
    }
  });
};

export const useGetTestDetails = (invite: string) => {
  return useQuery(
    ['testDetails', invite],
    async () => {
      if (!invite) {
        return undefined;
      }

      const res = await getTestDetailsCallable({ invite });

      // Deobfuscate the response
      const d = obfuscate(res.data, 10204, false);
      return JSON.parse(d).test as GetTestDetailsResponse['test'];
    },
    {
      refetchOnWindowFocus: false
    }
  );
};

export const useJoinTest = (testInvite: string) => {
  return useMutation(
    async ({ name, email, phone }: { name: string; email: string; phone: string }) => {
      try {
        const res = await joinTestCallable({ invite: testInvite, name, email, phone });

        // Deobfuscate the response
        const d = obfuscate(res.data, 10204, false);
        return JSON.parse(d) as JoinTestResponse;
      } catch (error: any) {
        throw new Error(error.message);
      }
    }
  );
};

// For testing only
export const triggerWrite = async (docID: string) => {
  // Write random value to firestore doc
  const docRef = doc(db, 'onlineTests', docID);
  await updateDoc(docRef, {
    random: Math.random()
  });
};

export interface CreateTestSchema {
  testName: string;
  testDescription: string;
  testDuration: number;
  timing: 'timePerTest' | 'timePerQuestion';
  testStartDate: Date;
  testEndDate: Date;
  showScore: boolean;
  emailScores: boolean;
  randomizeQuestions: boolean;
  allowMultipleAttempts: boolean;
  allowReview: boolean;
  skipQuestions: boolean;
  participants: Participant[];
  passingScore: number;
  mockID: string;
}

export interface Participant {
  name: string;
  email: string;
  phone: string;
  addedAt: string;
  status: ParticipantStatus;
  id: string;
  inviteCode: string;
  lastInvitedAt: string | null;
  emailInvitationDoc: string | null;
}

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
  numberOfQuestions?: number;
  sectionQuestions?: SectionQuestion[];
  passingScore?: number;
  sectionAnswers: [
    {
      [key: number]: SectionAnswer;
    }
  ];
  processingStatus: 'pending' | 'processed' | 'failed';
  inviteCode?: string;
  id: string;
  participants: Participant[];
  results?: {
    id: string;
    participant: Participant;
    results: {
      correctAnswers: number;
      totalNumberOfQuestions: number;
      isPassed: boolean;
      timeTaken: number;
      passingScore: number;
      submittedAt: {
        seconds: number;
        nanoseconds: number;
      };
      submitted: {
        seconds: number;
        nanoseconds: number;
      };
      submissions: Submission[];
    }[];
  }[];
}

export interface Submission {
  answerID: number;
  questionID: number;
  isCorrect: boolean;
  question: QuestionSectionQuestion;
  correctAnswer: AnswerOption & { solution?: string };
  participant: Participant;
  topic: {
    id: string;
    name: string;
  };
}

export interface TestResult {
  correctAnswers: number;
  totalNumberOfQuestions: number;
  submittedAt: {
    nanoseconds: number;
    seconds: number;
  };
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
