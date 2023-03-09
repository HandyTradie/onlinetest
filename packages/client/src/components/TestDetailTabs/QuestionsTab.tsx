import React from 'react';
import { QuestionSectionQuestion, SectionAnswer, Test } from '../../api/tests';
import { Disclosure as HeadlessDisclosure, Transition } from '@headlessui/react';
import Disclosure from '../Disclosure';
import { ChevronUpIcon } from '@heroicons/react/solid';
import { CheckCircleIcon } from '@heroicons/react/outline';
import MarkdownRenderer from '../MarkdownRenderer';

type Props = {
  sectionQuestions: Test['sectionQuestions'];
  sectionAnswers: Test['sectionAnswers'];
};

export const objectiveLetterOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const QuestionsTab = ({ sectionQuestions, sectionAnswers }: Props) => {
  return (
    <div>
      <div className="my-4">
        <div>
          {sectionQuestions && sectionQuestions?.length > 0 && (
            <p className="mb-4">Questions students will see in this test.</p>
          )}
        </div>

        <div className="flex flex-col space-y-4">
          {!sectionQuestions || sectionQuestions?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-4 space-y-4 text-gray-500">
              <p className="text-xl font-medium">No questions</p>
              <p className="text-sm">Your questions are processing, check back soon.</p>
            </div>
          ) : (
            sectionQuestions.map((section, idx) => (
              <SectionDetails
                key={idx}
                questions={section}
                title={`Section ${idx + 1}`}
                answers={sectionAnswers[idx]}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionsTab;

const SectionDetails = ({
  questions,
  title,
  answers
}: {
  questions: NonNullable<Test['sectionQuestions']>[0];
  answers: NonNullable<Test['sectionAnswers']>[0];
  title: string;
}) => {
  return (
    <Disclosure buttonClassName="" title={title}>
      <div className="pl-4 py-2 mt-2 rounded-lg">
        <div className="mt-2 flex flex-col gap-4">
          {questions.questions?.map((question) => (
            <QuestionDetailDisclosure
              key={question.id}
              question={question}
              answer={answers[question.id]}
            />
          ))}
        </div>
      </div>
    </Disclosure>
  );
};

export const QuestionDetailDisclosure = ({
  question,
  answer,
  isCorrect,
  submittedAnswerID,
  adminView,
  title
}: {
  question: QuestionSectionQuestion;
  answer: SectionAnswer;
  isCorrect?: boolean;
  submittedAnswerID?: number | null;
  adminView?: boolean;
  title?: string;
}) => {
  const submittedAnswer =
    submittedAnswerID === null
      ? { option: 'NIL: You did not choose an answer' } // Don't judge, writing this at 4 am
      : submittedAnswerID && question.answerOptions?.find((a) => a.id === submittedAnswerID);

  return (
    <HeadlessDisclosure>
      {({ open }) => (
        <>
          <HeadlessDisclosure.Button
            style={{
              backgroundColor:
                isCorrect !== undefined ? (isCorrect ? '#dcfce7' : '#fef2f2') : undefined
            }}
            className="flex w-full justify-between rounded-lg bg-blue-50 p-2 px-4 text-left font-medium text-blue-900 hover:bg-blue-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75"
          >
            <div className="flex gap-4">
              {/* <div className="">{question.questionNumber}.</div> */}
              {title ? (
                <p>{title}</p>
              ) : (
                <div>
                  <MarkdownRenderer>{question.text.trim()}</MarkdownRenderer>
                </div>
              )}
            </div>
            <ChevronUpIcon
              className={`${open ? '' : 'rotate-180 transform'} h-5 w-5 text-blue-500`}
            />
          </HeadlessDisclosure.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <HeadlessDisclosure.Panel>
              <div className="px-4">
                <div>
                  <b>Question</b>
                  <div>
                    <MarkdownRenderer>{question.text}</MarkdownRenderer>
                  </div>
                </div>
                {submittedAnswer && (
                  <div className="mt-4">
                    <b>{adminView ? 'Their' : 'Your'} Answer</b>
                    <div>
                      <MarkdownRenderer>{submittedAnswer.option}</MarkdownRenderer>
                    </div>
                  </div>
                )}
                {question?.resource && (
                  <div className="mt-4 mb-8">
                    <b>Resource</b>
                    <div className="mt-2">
                      <MarkdownRenderer>{question.resource}</MarkdownRenderer>
                    </div>
                  </div>
                )}
                {question?.answerOptions && (
                  <div className="mt-4">
                    <div className="mt-2">
                      <AnswerListDisclosure
                        answerOptions={question.answerOptions}
                        correctAnswer={answer}
                      />
                    </div>
                  </div>
                )}
              </div>
            </HeadlessDisclosure.Panel>
          </Transition>
        </>
      )}
    </HeadlessDisclosure>
  );
};

const AnswerListDisclosure = ({
  answerOptions,
  correctAnswer
}: {
  answerOptions: QuestionSectionQuestion['answerOptions'];
  correctAnswer: SectionAnswer;
}) => {
  return (
    <HeadlessDisclosure>
      {({ open }) => (
        <>
          <HeadlessDisclosure.Button className="flex w-full justify-between rounded-lg bg-blue-50 p-2 text-left font-medium text-blue-900 hover:bg-blue-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
            <span>Answer Options</span>
            <ChevronUpIcon
              className={`${open ? '' : 'rotate-180 transform'} h-5 w-5 text-blue-500`}
            />
          </HeadlessDisclosure.Button>
          <Transition
            enter="transition duration-100 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <HeadlessDisclosure.Panel>
              <div className="flex flex-col gap-2 pl-4 mt-2">
                {answerOptions.map((answerOption, idx) => {
                  const isCorrect = correctAnswer?.id === answerOption?.id;
                  return (
                    <div
                      className={`rounded-lg relative p-2 ${{}}`}
                      title={isCorrect ? 'Correct answer' : 'Incorrect answer'}
                      key={answerOption.id}
                    >
                      {isCorrect && (
                        <div className="absolute right-2 top-2">
                          <CheckCircleIcon className="w-6 h-6 text-green-700" />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <span className="">{objectiveLetterOptions[idx]}.</span>
                        <div className={isCorrect ? 'text-green-700' : ''}>
                          <MarkdownRenderer>{answerOption.option}</MarkdownRenderer>
                        </div>
                      </div>
                      {isCorrect && correctAnswer?.solution && (
                        <div className="my-4">
                          <blockquote className="mt-2 leading-8">
                            <MarkdownRenderer>{correctAnswer.solution}</MarkdownRenderer>
                          </blockquote>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </HeadlessDisclosure.Panel>
          </Transition>
        </>
      )}
    </HeadlessDisclosure>
  );
};
