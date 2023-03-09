import React, { useMemo } from 'react';
import { MockExamDoc } from '../api/mocks';

type Props = {
  mock: MockExamDoc;
};

const MockDetailPreview = ({ mock }: Props) => {
  // Computed properties
  // Memo is mostly redundant but I expect the deps to be extended so going to leave it for now.
  const objectiveSections = useMemo(
    () => mock.questions.filter((e) => e.questionType === 'multiple').length,
    [mock]
  );
  const numberOfQuestions = useMemo(
    () =>
      mock.questions
        ?.filter((q) => q.questionType === 'multiple')
        ?.map((e) => e.questionIDs)
        ?.flat()?.length || 0,
    [mock]
  );
  const numberOfQuestionTopics = useMemo(() => {
    // Get flat list of all question topics used in the mock
    const topicsFromSections = mock.sectionBlock.map((section) => section.topicPercentages).flat();
    // Remove duplicates
    const topics = [...new Set(topicsFromSections)];
    // Rturn the number of topics excluding those with a "value" (n0. of questions) less than 1
    return topics.filter((topic) => topic.value > 0).length;
  }, [mock]);

  return (
    <div className="bg-blue-50 rounded-lg py-4 px-2">
      <h1 className="text-center font-bold">Test Details</h1>

      <div className="flex flex-col gap-6 mt-6">
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <b>School</b>
            <p className="text-center line-clamp-2">{mock.schoolName}</p>
          </div>
          <div className="flex flex-col items-center">
            <b>Course</b>
            <p className="text-center line-clamp-2">{mock.courseName}</p>
          </div>
          <div className="flex flex-col items-center">
            <b>Exam Title</b>
            <p className="text-center line-clamp-2">{mock.examTitle}</p>
          </div>
          <div className="flex flex-col items-center">
            <b>Sections</b>
            <p className="text-center line-clamp-2">{objectiveSections}</p>
          </div>
          <div className="flex flex-col items-center">
            <b>Questions</b>
            <p className="text-center line-clamp-2">{numberOfQuestions}</p>
          </div>
          <div className="flex flex-col items-center">
            <b>Topics</b>
            <p className="text-center line-clamp-2">{numberOfQuestionTopics}</p>
          </div>
        </div>
      </div>
      <p className="text-center text-sm mt-6">
        *Quizmine Online only supports MCQs for now.
        <br />
        This test will only includes objective sections and questions.
      </p>
    </div>
  );
};

export default MockDetailPreview;
