import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { QuestionSectionQuestion, Test } from '../api/tests';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

if (import.meta.env.DEV) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('6Ldi7kUjAAAAAJuuhbAj_0b7A38n8-dcq2TTu5mq'),
  isTokenAutoRefreshEnabled: true
});

// Enable auth persistence.
// setPersistence(auth, browserLocalPersistence);

// Callables
export const processInviteCallable = httpsCallable<{ invite: string }, string>(
  functions,
  'processInvite'
);

export const gradeAnswersCallable = httpsCallable<
  { invite: string; answers: { questionID: number; answerID: number | undefined | null }[] },
  string
>(functions, 'gradeAnswers');

export const startTestCallable = httpsCallable<{ invite: string }, string>(functions, 'startTest');

export const getTestDetailsCallable = httpsCallable<{ invite: string }, string>(
  functions,
  'getTestDetails'
);

export const joinTestCallable = httpsCallable<
  { name: string; phone: string; email: string; invite: string },
  string
>(functions, 'joinTest');

export type JoinTestResponse = {
  invite: string;
  time: number;
};

export type ProcessInviteResponse = {
  invite: string;
  participant: Test['participants'][0];
  test: Test;
};

export type GetTestDetailsResponse = {
  test: Test;
  time: number;
};

export type GradeAnswersResponse = {
  success: boolean;
  score:
    | {
        total: number;
        correct: number;
      }
    | undefined;
  isPassed: boolean | undefined;
  passingScore: number | undefined;
  timeTaken: number;
  answers:
    | {
        questionID: number;
        answerID: number | null;
        correctAnswer: {
          id: number;
          option: string;
          solution: string;
        };
        isCorrect: boolean;
        question: QuestionSectionQuestion;
      }[]
    | undefined;
};

export type StartTestResponse = {
  success: boolean;
  invite: string;
  time: number;
};
