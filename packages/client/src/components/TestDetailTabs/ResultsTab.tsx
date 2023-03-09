import React from 'react';
import { SectionAnswer, Test, useSendResultsMail } from '../../api/tests';
import { Disclosure as HeadlessDisclosure, Tab, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/solid';
import { QuestionDetailDisclosure } from './QuestionsTab';
import { TailSpin } from 'react-loader-spinner';
import toast from 'react-hot-toast';
import { GroupedParticipantsResults } from '.';
import { StyledTab, StyledTabPanel } from '../Tabs';
import ListBox from '../ListBox';

type Props = {
  results: Test['results'];
  testID: Test['id'];
  groupedParticipantsResults: GroupedParticipantsResults | undefined;
};

export const objectiveLetterOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

const sortOptions = [
  {
    id: 'asc',
    name: 'Highest to lowest'
  },
  {
    id: 'desc',
    name: 'Lowest to highest'
  }
];

const ResultsTab = ({ results, testID, groupedParticipantsResults }: Props) => {
  const [selectedEntries, setSelectedEntries] = React.useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = React.useState(false);
  const { mutate: sendMail, error, isLoading } = useSendResultsMail();
  const [selectedSort, setSelectedSort] = React.useState(sortOptions[0]);

  const handleSend = () => {
    sendMail(
      { testID, participantIDs: selectedEntries },
      {
        onSuccess: () => {
          toast.success('Emails sent successfully');
        }
      }
    );
  };

  const sortedResultsWithPassMarker = React.useMemo(() => {
    if (!results) return [];

    const sorted = [...results].sort((a, b) => {
      if (selectedSort.id === 'asc') {
        return a.results.slice(-1)[0].correctAnswers > b.results.slice(-1)[0].correctAnswers
          ? -1
          : 1;
      }
      return a.results.slice(-1)[0].correctAnswers > b.results.slice(-1)[0].correctAnswers ? 1 : -1;
    });

    const sortedWithScore = sorted.map((result) => {
      const score =
        (result.results.slice(-1)[0].correctAnswers /
          result.results.slice(-1)[0].totalNumberOfQuestions) *
        100;

      const isPassed = score >= result.results.slice(-1)[0].passingScore;
      return {
        ...result,
        score,
        isPassed
      };
    });

    return sortedWithScore;
  }, [results, selectedSort]);

  return (
    <div>
      <div className="my-4">
        <p className="">Results from student submissions in this test.</p>
        <div className="flex justify-between items-end mt-4 mb-8">
          <label className="flex items-center pl-2">
            <input
              type="checkbox"
              className="rounded-sm"
              checked={isAllSelected}
              onChange={(e) => {
                setIsAllSelected(e.target.checked);
                setSelectedEntries(e.target.checked ? results?.map((r) => r.id) || [] : []);
              }}
            />
            <span className="ml-2">Select all</span>
          </label>
          <button
            onClick={handleSend}
            disabled={isLoading || selectedEntries.length === 0}
            className="py-2 bg-blue-500 hover:bg-blue-700 text-white px-4 rounded-lg disabled:grayscale disabled:hover:bg-blue-500 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? <TailSpin width={24} height={24} /> : 'Send Result Emails'}
          </button>
        </div>
        <>{error && <p className="text-red-500 mb-8 -mt-2 pl-2">{(error as any)?.message}</p>}</>

        <div>
          {!results || results?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-4 space-y-4 text-gray-500">
              <p className="text-xl font-medium">No results</p>
              <p className="text-sm">Check back after your students have taken this test.</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div>
                <Tab.Group>
                  <Tab.List className="flex space-x-1 bg-blue-50 rounded-lg p-1 overflow-x-auto">
                    <StyledTab>All Participants</StyledTab>
                    <StyledTab>Participants by Group</StyledTab>
                  </Tab.List>
                  <Tab.Panels className="mt-4">
                    <StyledTabPanel>
                      <div className="flex justify-between items-center mb-6">
                        <p className="mt-4 mb-4">
                          Ranked by latest result score - {selectedSort.name.toLowerCase()}
                        </p>
                        <div className="w-full max-w-sm">
                          <ListBox
                            selected={selectedSort}
                            setSelected={setSelectedSort}
                            options={sortOptions}
                          />
                        </div>
                      </div>
                      <div className="flex flex-col space-y-4">
                        {(() => {
                          const elements = sortedResultsWithPassMarker.map((result, idx) => (
                            <ParticipantResults
                              key={idx}
                              result={result}
                              isSelected={selectedEntries.includes(result.id)}
                              onSelect={(isSelected) => {
                                if (isSelected) {
                                  setSelectedEntries([...selectedEntries, result.id]);
                                } else {
                                  setSelectedEntries(
                                    selectedEntries.filter((id) => id !== result.id)
                                  );
                                }
                              }}
                            />
                          ));
                          // Add marker for passing score
                          // Find the last participant that has passed
                          const passed = sortedResultsWithPassMarker.filter((r) => r.isPassed);
                          const firstPassedIndex = passed
                            ? sortedResultsWithPassMarker.indexOf(passed[passed.length - 1])
                            : -1;
                          const lastPassedIndex = passed
                            ? sortedResultsWithPassMarker.indexOf(passed[0])
                            : -1;

                          const passingScore =
                            sortedResultsWithPassMarker[0].results[0].passingScore;

                          if (firstPassedIndex !== -1) {
                            elements.splice(
                              selectedSort.id === 'asc' ? firstPassedIndex + 1 : lastPassedIndex,
                              0,
                              <PassMarkBar passingScore={passingScore} />
                            );
                          } else {
                            if (selectedSort.id === 'asc') {
                              elements.unshift(<PassMarkBar passingScore={passingScore} />);
                            } else {
                              elements.push(<PassMarkBar passingScore={passingScore} />);
                            }
                          }
                          return elements;
                        })()}
                      </div>
                    </StyledTabPanel>
                    <StyledTabPanel>
                      {groupedParticipantsResults?.length ? (
                        <div className="flex flex-col space-y-4">
                          {groupedParticipantsResults?.map((groupWithResults) => (
                            <GroupDisclosure
                              key={groupWithResults.group.id}
                              groupWithResults={groupWithResults}
                              isSelected={
                                // Check if all the participants in the group are selected
                                groupWithResults.participantsResults?.every((result) =>
                                  selectedEntries.includes(result.id)
                                ) ?? false
                              }
                              onSelect={(isSelected) => {
                                if (isSelected) {
                                  // If the group is selected, add all the participants in the group to the selected entries
                                  setSelectedEntries([
                                    ...selectedEntries,
                                    ...(groupWithResults.participantsResults?.map(
                                      (result) => result.id
                                    ) ?? [])
                                  ]);
                                } else {
                                  // If the group is not selected, remove all the participants in the group from the selected entries
                                  setSelectedEntries(
                                    selectedEntries.filter(
                                      (entry) =>
                                        !groupWithResults.participantsResults
                                          ?.map((result) => result.id)
                                          .includes(entry)
                                    )
                                  );
                                }
                              }}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-4 space-y-4 text-gray-500">
                          <p className="text-xl font-medium">No grouped results</p>
                          <p className="text-sm">
                            Create a participant group on the dashboard and add its participants to
                            this test.
                          </p>
                        </div>
                      )}
                    </StyledTabPanel>
                  </Tab.Panels>
                </Tab.Group>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PassMarkBar = ({ passingScore }: { passingScore: number }) => {
  return (
    <div className="flex flex-col justify-between my-2">
      <p className="text-center">
        Passing Score: <b>{passingScore}%</b>
      </p>
      <div className="w-full h-2 bg-red-300 rounded-full" />
    </div>
  );
};

export default ResultsTab;

const ParticipantResults = ({
  result,
  isSelected,
  onSelect,
  hideSelect = false
}: {
  result: NonNullable<Test['results']>[0];
  isSelected?: boolean;
  hideSelect?: boolean;
  onSelect?: (isSelected: boolean) => void;
}) => {
  const latestResult = result.results[result.results.length - 1];
  const latestResultScore = (
    (latestResult.correctAnswers / latestResult.totalNumberOfQuestions) *
    100
  ).toFixed(2);

  return (
    <div className="w-full rounded-lg bg-white">
      <HeadlessDisclosure>
        {({ open }) => (
          <>
            <HeadlessDisclosure.Button className="flex w-full justify-between rounded-lg bg-blue-50 p-2 text-left font-medium text-blue-900 hover:bg-blue-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
              <label className="flex items-center space-x-2">
                {!hideSelect && (
                  <input
                    type="checkbox"
                    className="rounded-sm"
                    checked={isSelected}
                    onChange={(e) => onSelect && onSelect(e.target.checked)}
                  />
                )}
                <span>
                  {[result.participant.name, result.participant.email, result.participant.phone]
                    .filter(Boolean)
                    .join(' - ')}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <p>{latestResultScore}%</p>
                <ChevronUpIcon
                  className={`${open ? '' : 'rotate-180 transform'} h-5 w-5 text-blue-500`}
                />
              </div>
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
                <div className="pl-4 py-2 mt-2 rounded-lg">
                  <div className="mt-2 flex flex-col gap-4">
                    {[...result.results].reverse()?.map((result, idx) => (
                      <ResultDisclosure key={idx} result={result} />
                    ))}
                  </div>
                </div>{' '}
              </HeadlessDisclosure.Panel>
            </Transition>
          </>
        )}
      </HeadlessDisclosure>
    </div>
  );
};

export const ResultDisclosure = ({
  result
}: {
  result: NonNullable<Test['results']>[0]['results'][0];
}) => {
  return (
    <HeadlessDisclosure>
      {({ open }) => (
        <>
          <HeadlessDisclosure.Button className="flex w-full justify-between rounded-lg bg-blue-50 p-2 px-4 text-left font-medium text-blue-900 hover:bg-blue-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
            <div className="flex gap-4">
              <div>
                {result.correctAnswers} / {result.totalNumberOfQuestions} -{' '}
                {((result.correctAnswers / result.totalNumberOfQuestions) * 100).toFixed(2)}%
              </div>
            </div>
            <div className="flex items-center gap-2">
              {new Date(result.submittedAt.seconds * 1000).toLocaleString()}
              <ChevronUpIcon
                className={`${open ? '' : 'rotate-180 transform'} h-5 w-5 text-blue-500`}
              />
            </div>
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
              <div className="px-4 space-y-2">
                {result.submissions?.map((submission) => (
                  <QuestionDetailDisclosure
                    key={submission.questionID}
                    question={submission.question}
                    answer={submission.correctAnswer as SectionAnswer}
                    isCorrect={submission.isCorrect}
                    submittedAnswerID={submission.answerID}
                    adminView
                  />
                ))}
              </div>
            </HeadlessDisclosure.Panel>
          </Transition>
        </>
      )}
    </HeadlessDisclosure>
  );
};

export const GroupDisclosure = ({
  groupWithResults,
  isSelected,
  onSelect
}: {
  groupWithResults: {
    group: {
      id: string;
      name: string;
      owner: string;
      participants: {
        name: string;
        email: string;
      }[];
    };
    participantsResults: Test['results'];
  };
  isSelected: boolean;
  onSelect: (isSelected: boolean) => void;
}) => {
  return (
    <div className="w-full rounded-lg bg-white">
      <HeadlessDisclosure>
        {({ open }) => (
          <>
            <HeadlessDisclosure.Button className="flex w-full justify-between rounded-lg bg-blue-50 p-2 text-left font-medium text-blue-900 hover:bg-blue-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded-sm"
                  checked={isSelected}
                  onChange={(e) => onSelect(e.target.checked)}
                />
                <span>{groupWithResults.group.name}</span>
              </label>
              <div className="flex items-center gap-2">
                <ChevronUpIcon
                  className={`${open ? '' : 'rotate-180 transform'} h-5 w-5 text-blue-500`}
                />
              </div>
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
                <div className="pl-4 py-2 mt-2 rounded-lg">
                  <div className="mt-2 flex flex-col gap-4">
                    {groupWithResults.participantsResults?.map((result, idx) => (
                      <ParticipantResults key={idx} result={result} hideSelect={true} />
                    ))}
                  </div>
                </div>{' '}
              </HeadlessDisclosure.Panel>
            </Transition>
          </>
        )}
      </HeadlessDisclosure>
    </div>
  );
};
