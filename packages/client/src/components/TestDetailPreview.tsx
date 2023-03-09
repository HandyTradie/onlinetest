import React, { useMemo } from 'react';
import { Test } from '../api/tests';

type Props = {
  test: Test;
};

const TestDetailPreview = ({ test }: Props) => {
  // Computed properties
  // Memo is mostly redundant but I expect the deps to be extended so going to leave it for now.
  const objectiveSections = useMemo(
    () => test.mockData.sectionBlock.filter((e) => e.questionType === 'multiple').length,
    [test]
  );
  const numberOfQuestionTopics = useMemo(() => {
    // Get flat list of all question topics used in the mock
    const topicsFromSections = test.mockData.sectionBlock
      .map((section) => section.topicPercentages)
      .flat();
    // Remove duplicates
    const topics = [...new Set(topicsFromSections)];
    // Rturn the number of topics excluding those with a "value" (n0. of questions) less than 1
    return topics.filter((topic) => topic.value > 0).length;
  }, [test]);

  return (
    <div className="bg-blue-50 rounded-lg py-4 px-2">
      <h1 className="text-center font-bold">Test Details</h1>

      <div className="flex flex-col gap-6 mt-6">
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 gap-4">
          <div className="flex flex-col items-center">
            <b>Test Name</b>
            <p className="text-center line-clamp-2">{test.testName}</p>
          </div>
          <div className="flex flex-col items-center">
            <b>Duration (minutes)</b>
            <p className="text-center line-clamp-2">
              {test.timing === 'timePerTest'
                ? test.testDuration
                : test.timing === 'timePerQuestion'
                ? ((parseInt(test.testDuration) / 60) * Number(test?.numberOfQuestions)).toFixed(1)
                : test.testDuration}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <b>Participants</b>
            <p className="text-center line-clamp-2">{test?.participants?.length}</p>
          </div>
          <div className="flex flex-col items-center">
            <b>Sections</b>
            <p className="text-center line-clamp-2">{objectiveSections}</p>
          </div>
          <div className="flex flex-col items-center">
            <b>Questions</b>
            <p className="text-center line-clamp-2">{Number(test?.numberOfQuestions)}</p>
          </div>
          <div className="flex flex-col items-center">
            <b>Topics</b>
            <p className="text-center line-clamp-2">{numberOfQuestionTopics}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDetailPreview;
