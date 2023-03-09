import { observer } from 'mobx-react-lite';
import React, { useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { useGradeAnswers } from '../../api/tests';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { QuestionDetailDisclosure } from '../../components/TestDetailTabs/QuestionsTab';
import { useTakeTest } from './useTakeTest';

const CompleteTestView = () => {
  const {
    questions,
    config,
    incompleteQuestions,
    nav: { goToQuestion },
    setShowCompleteTestView,
    disableFocus,
    setTestAsEnded,
    testInvite,
    isForceEnded
  } = useTakeTest();
  const { mutate: gradeAnswers, isLoading, error, isSuccess, data: response } = useGradeAnswers();

  const handleGradeAnswers = async () => {
    if (testInvite && questions) {
      const answers = questions.map((q) => ({
        questionID: q.id,
        answerID: q.selectedAnswerOption
      }));

      gradeAnswers(
        { invite: testInvite, answers },
        {
          onSuccess: () => {
            setTestAsEnded && setTestAsEnded();
            disableFocus();
          }
        }
      );
    } else {
      console.error('Requisites missing from upstream initializer.');
    }
  };

  useEffect(() => {
    if (isForceEnded && !isSuccess && !isLoading) {
      handleGradeAnswers();
    }
  }, [isForceEnded]);

  return (
    <div>
      <h1 className="font-bold text-2xl mb-8 text-center underline">{config?.testName}</h1>
      {isSuccess && response ? (
        <div className="flex flex-col items-center justify-center">
          <p className="mb-8">
            Your test has been submitted and your score recorded, you can leave this page now
          </p>

          {response?.score && (
            <div className="w-full">
              <div className="text-center text-2xl">
                <b>Your Score</b>
                <div className="flex flex-col text-left items-center gap-4 font-bold text-5xl my-4">
                  <div className="space-y-6">
                    <p className="">
                      <span className="text-8xl">{response?.score.correct}</span> /{' '}
                      {response?.score.total}
                    </p>
                    <p className="text-6xl">
                      {((response?.score.correct / response?.score.total) * 100).toFixed(2)} %
                    </p>
                    {'isPassed' in response && (
                      <div className="pt-8">
                        <p className="text-2xl text-center mb-2">GRADE</p>

                        {response?.isPassed ? (
                          <p className="text-4xl text-center text-green-400">PASS</p>
                        ) : (
                          <p className="text-4xl text-center text-red-400">FAIL</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {response?.answers && response?.score && <hr className="w-full my-8" />}

          {response?.answers && (
            <div className="w-full">
              <div className="text-center text-2xl">
                <b>Review Your Answers</b>
                <div className="flex flex-col text-left items-center gap-4 font-bold  text-base my-4">
                  <div className="space-y-2 w-full">
                    {response?.answers.map((answer) => (
                      <QuestionDetailDisclosure
                        key={answer.questionID}
                        question={answer.question}
                        answer={answer.correctAnswer}
                        isCorrect={answer.isCorrect}
                        submittedAnswerID={answer.answerID}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <h1 className="font-bold text-xl text-center mb-[4vh]">Submit Test</h1>
          {config?.skipQuestions && incompleteQuestions?.length > 0 && (
            <div className="flex flex-col">
              <h2 className="text-center mb-8 text-red-500">
                WARNING: You have {incompleteQuestions?.length} unanswered questions
              </h2>

              <div className="flex flex-col border rounded-lg max-h-[80vh] overflow-y-scroll">
                {incompleteQuestions?.map((question) => (
                  <div
                    key={question.id}
                    className="flex justify-between items-center gap-8 border-b p-4"
                  >
                    <div className="flex gap-2 items-center">
                      <b>{question.questionNumber}.</b>
                      <div className="line-clamp-3">
                        <MarkdownRenderer>{question.text}</MarkdownRenderer>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        goToQuestion(question.id);
                        if (setShowCompleteTestView) setShowCompleteTestView(false); // Hide this view
                      }}
                      className="max-h-9 rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      Answer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isForceEnded && (
            <p className="text-red-500 text-center">
              You have run out of time, your test will be submitted automatically.
            </p>
          )}
          <div className="my-[6vh] flex flex-col gap-4 items-center">
            <>
              {isLoading && (
                <div className="flex items-center justify-center ">
                  <TailSpin color="#4353ff" width={36} height={36} />
                </div>
              )}
              {error && <div className="text-red-500">{String((error as any)?.message)}</div>}
              {!isForceEnded && (
                <p className="text-center">Click the button below to submit your test.</p>
              )}
              <button
                type="button"
                disabled={isLoading}
                onClick={handleGradeAnswers}
                className="max-w-sm py-4 bg-green-500 hover:bg-green-700 text-white font-bold px-4 rounded w-full disabled:grayscale disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
              >
                Submit Test
              </button>
            </>
          </div>
        </>
      )}
    </div>
  );
};

export default observer(CompleteTestView);
