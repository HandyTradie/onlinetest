import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import Countdown, { zeroPad } from 'react-countdown';
import ProgressBar from '@ramonak/react-progress-bar';

import MarkdownRenderer from '../../components/MarkdownRenderer';
import QuestionView from './QuestionView';
import { useTakeTest } from './useTakeTest';
import { addMilliseconds } from 'date-fns';
import { ClockIcon } from '@heroicons/react/outline';
import CompleteTestView from './CompleteTestView';
import { getSynchronizedServerTime } from '../../utils/time';
import clsx from 'clsx';

const TakeTestView = () => {
  const {
    submitAnswer,
    handleCompleteTest,
    showCompleteTestView,
    isCompleteTestViewDirty,
    currentQuestion,
    currentQuestionIndex,
    config,
    numberOfQuestions,
    isTakingTest,
    isTestEnded,
    isLastQuestion,
    forceEndTest,
    nav
  } = useTakeTest();
  const [serverTime] = React.useState(new Date(getSynchronizedServerTime()));
  const [selectedAnswerOption, setSelectedAnswerOption] = React.useState<number | null>(null);

  const testDuration = Number(config?.testDuration) ?? 0;
  const interval =
    config?.timing === 'timePerTest' ? testDuration * 1000 * 60 : testDuration * 1000; // Interval in milliseconds
  const testTime =
    config?.timing === 'timePerTest'
      ? testDuration * 1000 * 60
      : testDuration * 1000 * (numberOfQuestions ?? 0); // Interval in milliseconds
  const d = new Date();

  const hasLessThanAvailableTime =
    new Date(config?.testEndDate ?? 0).getTime() - serverTime.getTime() < testTime;

  const remainingTime = hasLessThanAvailableTime
    ? new Date(config?.testEndDate ?? 0).getTime() - serverTime.getTime()
    : testTime;

  const [testTimerEnd] = React.useState(addMilliseconds(d, remainingTime));
  const [timerEnd, setTimerEnd] = React.useState(addMilliseconds(d, interval));

  const handleSubmitAnswer = () => {
    // Reset timer if timePerQuestion
    if (config?.timing === 'timePerQuestion') {
      setTimerEnd(addMilliseconds(new Date(), interval));
    }
    submitAnswer(selectedAnswerOption);
    setSelectedAnswerOption(null);

    // If this is the last question, handle the test completion
    if (currentQuestionIndex + 1 === numberOfQuestions || isCompleteTestViewDirty) {
      handleCompleteTest();
    }
  };

  const onCountdownComplete = () => {
    if (config?.timing === 'timePerQuestion') {
      handleSubmitAnswer();
    }
  };

  // useEffect(() => {
  //   console.log('Number of questions:', numberOfQuestions)
  // }, [])

  if (!isTakingTest) return null;

  return (
    <div>
      {!isTestEnded && (
        <div className="mb-4">
          <Countdown
            date={testTimerEnd}
            daysInHours
            onComplete={forceEndTest}
            renderer={({ total, formatted }) => {
              return (
                <div
                  className={`flex gap-1 items-center justify-center text-xl font-bold ${
                    // Add red color if less than 10 seconds
                    total < 10 * 1000 && 'text-red-500 animate-pulse'
                  }`}
                >
                  <ClockIcon className="w-6 h-6" />
                  <span>
                    {formatted?.days && `${formatted.days}:`}
                    {formatted?.hours && `${formatted.hours}:`}
                    {formatted.minutes}:{formatted.seconds}
                  </span>
                </div>
              );
            }}
          />
        </div>
      )}
      {showCompleteTestView ? (
        <CompleteTestView />
      ) : (
        <div className="flex flex-col items-center justify-center">
          <h1 className="font-bold text-xl mb-2">
            {config?.testName} - {currentQuestion?.sectionName}
          </h1>
          {currentQuestion?.sectionInstructions && (
            <div className="text-center">
              <b className="underline">Section Instructions</b>
              <MarkdownRenderer>{currentQuestion?.sectionInstructions}</MarkdownRenderer>
            </div>
          )}
          <hr className="w-full my-8" />
          <div className="flex items-center gap-4 justify-center mb-8">
            <div
              title="Current question / Total questions"
              className="flex items-center gap-2 text-xl font-bold"
            >
              {currentQuestionIndex + 1} / {numberOfQuestions}
            </div>
            {config?.timing === 'timePerQuestion' && (
              <>
                |
                <Countdown
                  key={currentQuestion?.id}
                  date={timerEnd}
                  daysInHours
                  onComplete={onCountdownComplete}
                  renderer={({ total }) => {
                    return (
                      <div
                        className={`
                      -scale-x-100
                      ${
                        // Add red color if less than 10 seconds
                        total < 10 * 1000 && 'text-red-500 animate-pulse'
                      }`}
                      >
                        <ProgressBar
                          completed={(total / interval) * 100}
                          bgColor="#EF4444"
                          height="1rem"
                          width="10rem"
                          borderRadius="0.5rem"
                          labelAlignment="outside"
                          transitionTimingFunction="linear"
                          labelColor="#000"
                          isLabelVisible={false}
                        />
                      </div>
                    );
                  }}
                />
              </>
            )}
          </div>
          <div>
            <QuestionView question={currentQuestion} />
          </div>
          <div className="flex flex-col xl:flex-row items-center w-full gap-4 mt-8">
            {currentQuestion?.resource && (
              <div className="my-6 text-center flex flex-col items-center justify-center w-full max-h-[55vh] overflow-y-auto">
                <MarkdownRenderer forceRerenders>{currentQuestion.resource}</MarkdownRenderer>
              </div>
            )}
            <div className="flex flex-col w-full mt-10 items-center">
              <p>Choose the right answer to the question</p>
              {currentQuestion?.answerOptions && (
                <div className="w-full h-full">
                  <div className="mt-10 flex flex-shrink-0 flex-wrap gap-4 w-full justify-center items-stretch">
                    {currentQuestion.answerOptions.map((answerOption) => {
                      const isAlreadySelected =
                        currentQuestion?.selectedAnswerOption === Number(answerOption?.id);
                      const isSelected =
                        isAlreadySelected || selectedAnswerOption === Number(answerOption?.id);

                      return (
                        <button
                          disabled={isSelected}
                          key={String(answerOption?.id)}
                          onClick={() => setSelectedAnswerOption(Number(answerOption?.id))}
                          // style={{
                          //   backgroundColor: isSelected ? '#EF4444' : '#F9FAFB',
                          //   color: isSelected ? '#F9FAFB' : '#374151'
                          // }}
                          className={clsx(
                            'w-full self-stretch py-4 rounded-lg min-h-[75px] max-w-[545px]',
                            'hover:bg-opacity-20 disabled:hover:bg-opacity-100 hover:bg-primary-blue transition-all ease-in-out duration-50',
                            isSelected ? 'bg-primary-blue text-white' : 'bg-gray-200'
                          )}
                        >
                          <MarkdownRenderer>{String(answerOption?.option)}</MarkdownRenderer>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-12 flex flex-col w-full items-center gap-4 max-w-[545px] m-auto">
            <button
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswerOption}
              className="w-full py-6 rounded-lg  disabled:bg-gray-300 bg-green-500 text-white text-lg transition-all ease-in-out duration-50"
            >
              {
                // If last question, show "Submit Test" button
                currentQuestionIndex + 1 === numberOfQuestions || isCompleteTestViewDirty
                  ? 'Complete Test'
                  : 'Submit'
              }
            </button>
            {config?.skipQuestions && (
              <div className="flex w-full gap-2">
                <button
                  onClick={() => {
                    setSelectedAnswerOption(null);
                    nav.goToPreviousQuestion();
                  }}
                  className="w-full py-6 rounded-lg max-w-[545px] disabled:bg-gray-300 bg-primary-blue bg-opacity-50 hover:bg-opacity-100 text-white text-lg transition-all ease-in-out duration-50"
                >
                  Go Back
                </button>
                {!isLastQuestion && (
                  <button
                    onClick={() => {
                      setSelectedAnswerOption(null);
                      nav.skipQuestion();
                    }}
                    className="w-full py-6 rounded-lg max-w-[545px] disabled:bg-gray-300 bg-primary-blue bg-opacity-50 hover:bg-opacity-100 text-white text-lg transition-all ease-in-out duration-50"
                  >
                    Skip
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default observer(TakeTestView);
