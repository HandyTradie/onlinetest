import { makeAutoObservable, toJS } from 'mobx';
import { AnswerOption, QuestionSectionQuestion, Test } from '../api/tests';
import { shuffleArray } from '../utils';

export class TestModel {
  config: Test;
  id: string;
  questionMap: { [key: string]: TestQuestion } | undefined;
  currentQuestionIndex: number;
  showCompleteTestView: boolean;
  isCompleteTestViewDirty: boolean; // boolean for determining if user has  seen the complete test view
  keepFocus: boolean;
  testInvite: string;
  testForceEnded = false;
  isTestEnded = false;
  probablyShuffledQuestions: TestQuestion[];

  constructor(test: Test, invite: string) {
    makeAutoObservable(this);

    this.keepFocus = false;
    this.config = test;
    this.id = test.id;
    this.currentQuestionIndex = 0;
    this.showCompleteTestView = false;
    this.isCompleteTestViewDirty = false;
    this.testInvite = invite;

    // Generate question map
    const questions = test.sectionQuestions
      ?.map((section, sectionIdx) => {
        if (!section.questions) throw new Error('No questions found for section');

        let sectionQuestions: QuestionSectionQuestion[] = section.questions;

        // If randomize questions, shuffle questions
        if (test.randomizeQuestions) {
          sectionQuestions = shuffleArray(sectionQuestions);
        }

        const questions = sectionQuestions.map((question, idx) => {
          let mapId = Math.random().toString(32).substring(2);
          return {
            id: question.id,
            mapId: mapId,
            text: question.text,
            resource: question.resource,
            questionNumber: idx + 1,
            answerOptions: question.answerOptions,
            sectionID: sectionIdx,
            sectionName: `Section ${sectionIdx + 1}`,
            sectionInstructions: section.sectionInstructions,
            selectedAnswerOption: undefined,
            correctAnswerOption: undefined
          };
        });

        return questions;
      })
      .flat();

    this.probablyShuffledQuestions = questions || [];

    this.questionMap = questions?.reduce((map, obj) => {
      map[obj.mapId] = obj;
      return map;
    }, {} as { [key: string]: TestQuestion });

    // console.log('Question map generated:', this.questionMap, questions, questions?.length)
  }

  get numberOfQuestions() {
    return Object.keys(this.questionMap || {}).length;
  }

  get questions() {
    const questions = Object.values(this.questionMap || {}).map((question) => toJS(question));

    // Use order of probablyShuffledQuestions to sort questions, maintaining random order
    const sortedQuestions = questions.sort((a, b) => {
      const aIdx = this.probablyShuffledQuestions.findIndex((q) => q.id === a.id);
      const bIdx = this.probablyShuffledQuestions.findIndex((q) => q.id === b.id);

      return aIdx - bIdx;
    });

    return sortedQuestions;
  }

  get currentQuestion() {
    return this?.questions[this.currentQuestionIndex];
  }

  setSelectedAnswerOption = (mapId: string, answerID: AnswerOption['id'] | null) => {
    const question = this.questionMap?.[mapId];
    if (!question) throw new Error('Question not found');
    question.selectedAnswerOption = answerID;
  };

  setCorrectAnswerOption = (mapId: string, answerID: AnswerOption['id']) => {
    const question = this.questionMap?.[mapId];
    if (!question) throw new Error('Question not found');
    question.correctAnswerOption = answerID;
  };

  setCurrentQuestionIndex = (index: number) => {
    this.currentQuestionIndex = index;
  };

  incrementCurrentQuestionIndex = () => {
    this.currentQuestionIndex++;
  };

  decrementCurrentQuestionIndex = () => {
    this.currentQuestionIndex--;
  };

  setIsCompleteTestViewDirty = (dirty: boolean) => {
    this.isCompleteTestViewDirty = dirty;
  };

  setShowCompleteTestView = (show: boolean) => {
    this.showCompleteTestView = show;
    this.setIsCompleteTestViewDirty(true);
  };

  setKeepFocus = (keepFocus: boolean) => {
    this.keepFocus = keepFocus;
  };

  setForceEnded = (forceEnded: boolean) => {
    this.testForceEnded = forceEnded;
  };

  endTest = () => {
    this.isTestEnded = true;
  };
}

export class TestStore {
  activeTest: TestModel | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  beginTest(test: Test, invite: string) {
    this.activeTest = new TestModel(test, invite);
    this.activeTest.setKeepFocus(true);
  }

  resetTest() {
    this.activeTest = null;
  }
}

export type TestQuestion = {
  id: number;
  mapId: string;
  text: string;
  resource: string;
  questionNumber: number;
  answerOptions: AnswerOption[];
  sectionID: number;
  sectionName: string;
  sectionInstructions: string;
  selectedAnswerOption: number | undefined | null;
  correctAnswerOption: number | undefined | null;
};

export default new TestStore();
