import { Test } from '../../api/tests';
import TestStore from '../../models/Test';

export const useTakeTest = () => {
  const currentQuestionIndex = TestStore.activeTest?.currentQuestionIndex || 0;
  const isTakingTest = TestStore.activeTest !== null;
  const currentQuestion = TestStore.activeTest?.currentQuestion;
  const numberOfQuestions = TestStore.activeTest?.numberOfQuestions;
  const answeredQuestions = TestStore.activeTest?.questions.filter(
    (question) => question.selectedAnswerOption !== undefined
  );
  const isLastQuestion = currentQuestionIndex + 1 === TestStore.activeTest?.numberOfQuestions;
  const incompleteQuestions =
    TestStore.activeTest?.questions.filter(
      (question) =>
        question.selectedAnswerOption === undefined || question.selectedAnswerOption === null
    ) ?? [];

  function beginTest(test: Test, invite: string) {
    if (test) {
      TestStore.beginTest(test, invite);
    }
  }

  function resetTest() {
    TestStore.resetTest();
  }

  function submitAnswer(answerID: number | null) {
    // Update selected answer in test store
    if (currentQuestion) {
      TestStore.activeTest?.setSelectedAnswerOption(currentQuestion?.mapId, answerID);

      // Move to next question

      // If last question, submit test
      if (!isLastQuestion) {
        // If not last question, move to next question
        // Increment current question index
        TestStore.activeTest?.incrementCurrentQuestionIndex();
      }
    } else {
      throw new Error('No current question found');
    }
  }

  function handleCompleteTest() {
    TestStore.activeTest?.setShowCompleteTestView(true);
  }

  function forceEndTest() {
    TestStore.activeTest?.setForceEnded(true);
    handleCompleteTest();
  }

  function skipQuestion() {
    submitAnswer(currentQuestion?.selectedAnswerOption ?? null);
  }

  function goToPreviousQuestion() {
    // Decrement current question index if not first question
    if (currentQuestionIndex > 0) {
      TestStore.activeTest?.decrementCurrentQuestionIndex();
    }
  }

  function goToQuestion(questionID: number) {
    const questionIndex = TestStore.activeTest?.questions.findIndex(
      (question) => question.id === questionID
    );
    if (questionIndex !== undefined) {
      TestStore.activeTest?.setCurrentQuestionIndex(questionIndex);
    }
  }

  function disableFocus() {
    TestStore.activeTest?.setKeepFocus(false);
  }

  return {
    beginTest,
    resetTest,
    submitAnswer,
    handleCompleteTest,
    disableFocus,
    setShowCompleteTestView: TestStore.activeTest?.setShowCompleteTestView,
    setTestAsEnded: TestStore.activeTest?.endTest,
    forceEndTest,
    nav: { skipQuestion, goToPreviousQuestion, goToQuestion },
    config: TestStore.activeTest?.config,
    questions: TestStore.activeTest?.questions,
    currentQuestion,
    currentQuestionIndex,
    isTakingTest,
    showCompleteTestView: TestStore.activeTest?.showCompleteTestView,
    isCompleteTestViewDirty: TestStore.activeTest?.isCompleteTestViewDirty,
    numberOfQuestions,
    answeredQuestions,
    incompleteQuestions,
    isForceEnded: TestStore.activeTest?.testForceEnded,
    isTestEnded: TestStore.activeTest?.isTestEnded,
    testInvite: TestStore.activeTest?.testInvite,
    keepFocus: TestStore.activeTest?.keepFocus,
    isLastQuestion
  };
};
