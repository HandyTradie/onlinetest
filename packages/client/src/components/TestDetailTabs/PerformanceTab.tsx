import { Disclosure as HeadlessDisclosure, Tab, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/outline';
import { useState } from 'react';
import { GroupedParticipantsResults } from '.';
import { Participant, SectionAnswer, Submission, Test } from '../../api/tests';
import Disclosure from '../Disclosure';
import ListBox from '../ListBox';
import { StyledTab, StyledTabPanel } from '../Tabs';
import { QuestionDetailDisclosure } from './QuestionsTab';
import { StatCard } from './StatsTab';

type Props = {
  results: Test['results'];
  groupedParticipantsResults: GroupedParticipantsResults | undefined;
};

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

const PerformanceTab = ({ results, groupedParticipantsResults }: Props) => {
  const [selectedSort, setSelectedSort] = useState(sortOptions[0]);

  const participantSubmissions = results?.map((r) => ({
    participant: r.participant,
    submissions: r.results[r.results.length - 1].submissions
  }));

  const topicMasteries = calculateTopicMastery(participantSubmissions);

  const sortedTopicMasteries = [...topicMasteries].sort((a, b) =>
    selectedSort.id === 'asc' ? b.percentage - a.percentage : a.percentage - b.percentage
  );

  const sortedParticipantSubmissions = [...(participantSubmissions || [])].sort((a, b) =>
    selectedSort.id === 'asc'
      ? b.submissions.filter((s) => s.isCorrect).length -
        a.submissions.filter((s) => s.isCorrect).length
      : a.submissions.filter((s) => s.isCorrect).length -
        b.submissions.filter((s) => s.isCorrect).length
  );

  return (
    <div>
      <div>
        <div className="my-4">
          <p className="">Participant performance in topics.</p>
        </div>

        {!results || results?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 space-y-4 text-gray-500">
            <p className="text-xl font-medium">No results</p>
            <p className="text-sm">Check back after your students have taken this test.</p>
          </div>
        ) : (
          <div>
            <Tab.Group>
              <Tab.List className="flex space-x-1 bg-blue-50 rounded-lg p-1 overflow-x-auto">
                <StyledTab>All Participants</StyledTab>
                <StyledTab>Individual Participants</StyledTab>
                <StyledTab>Participants by Group</StyledTab>
              </Tab.List>
              <Tab.Panels>
                <StyledTabPanel>
                  <div className="flex justify-between items-center mb-6">
                    <p className="mt-4 mb-4">
                      Ranked by average participant mastery - {selectedSort.name.toLowerCase()}
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
                    {sortedTopicMasteries?.map((topicMastery) => (
                      <TopicMasteryCard key={topicMastery.topicID} topicMastery={topicMastery} />
                    ))}
                  </div>
                </StyledTabPanel>
                <StyledTabPanel>
                  <div className="flex justify-between items-center mb-6">
                    <p className="mt-4 mb-4">
                      Ranked by individual participant mastery - {selectedSort.name.toLowerCase()}
                    </p>
                    <div className="w-full max-w-sm">
                      <ListBox
                        selected={selectedSort}
                        setSelected={setSelectedSort}
                        options={sortOptions}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col space-y-4 pt-4">
                    {sortedParticipantSubmissions?.map((submission) => (
                      <ParticipantMasteryDisclosure
                        key={submission.participant.id}
                        participant={submission.participant}
                        submissions={submission.submissions}
                      />
                    ))}
                  </div>
                </StyledTabPanel>
                <StyledTabPanel>
                  <div className="flex flex-col space-y-4 pt-4">
                    {groupedParticipantsResults?.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-4 space-y-4 text-gray-500">
                        <p className="text-xl font-medium">No grouped results</p>
                        <p className="text-sm">
                          Create a participant group on the dashboard and add its participants to
                          this test.
                        </p>
                      </div>
                    ) : (
                      groupedParticipantsResults?.map((groupedResults) => (
                        <GroupMasteryDisclosure
                          key={groupedResults.group.id}
                          groupName={groupedResults.group.name}
                          participantResults={groupedResults.participantsResults}
                        />
                      ))
                    )}
                  </div>
                </StyledTabPanel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        )}
      </div>
    </div>
  );
};

const GroupMasteryDisclosure = ({
  groupName,
  participantResults
}: {
  groupName: string;
  participantResults: Test['results'];
}) => {
  const participantSubmissions = participantResults?.map((r) => ({
    participant: r.participant,
    submissions: r.results[r.results.length - 1].submissions
  }));

  return (
    <Disclosure title={groupName}>
      <div className="flex flex-col space-y-4 pt-4 pl-4">
        {participantSubmissions?.map((submission) => (
          <ParticipantMasteryDisclosure
            key={submission.participant.id}
            participant={submission.participant}
            submissions={submission.submissions}
          />
        ))}
      </div>
    </Disclosure>
  );
};

const ParticipantMasteryDisclosure = ({
  participant,
  submissions
}: {
  participant: Participant;
  submissions: Submission[];
}) => {
  const masteries = calculateTopicMastery([{ participant, submissions }]);

  return (
    <div>
      <Disclosure
        title={[participant.name, participant.email, participant.phone].filter(Boolean).join(' - ')}
      >
        <div className="flex flex-col space-y-4 mt-4 pl-4">
          {masteries?.map((topicMastery) => {
            return <TopicMasteryCard topicMastery={topicMastery} key={topicMastery.topicID} />;
          })}
        </div>
      </Disclosure>
    </div>
  );
};

const TopicMasteryCard = ({ topicMastery }: { topicMastery: Mastery }) => {
  return (
    <div className="w-full rounded-lg bg-white">
      <HeadlessDisclosure>
        {({ open }) => (
          <>
            <HeadlessDisclosure.Button className="flex w-full justify-between rounded-lg bg-blue-50 p-2 text-left font-medium text-blue-900 hover:bg-blue-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
              <label className="flex items-center space-x-2 capitalize">
                <span>
                  {[topicMastery.topicName, topicMastery.percentage].join(' - ').toLowerCase() +
                    '%'}
                </span>
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
                  <div className="flex gap-12">
                    <StatCard
                      title="# of topic questions"
                      value={Object.keys(topicMastery.submissions).length}
                    />
                    <StatCard title="Average Mastery" value={`${topicMastery.percentage}%`} />
                    <StatCard title="# of question submissions" value={topicMastery.total} />
                    <StatCard title="# of correct submissions" value={topicMastery.correct} />
                  </div>
                  <hr className="my-4" />
                  <div className="mt-4">
                    <p className="font-medium mb-4">Submissions to Topic Questions</p>
                    <div className="flex flex-col gap-2">
                      {Object.values(topicMastery.submissions)
                        .flat()
                        ?.map((submission) => (
                          <QuestionDetailDisclosure
                            key={submission.question.id}
                            question={submission.question}
                            answer={submission.correctAnswer as SectionAnswer}
                            isCorrect={submission.isCorrect}
                            submittedAnswerID={submission.answerID}
                            adminView
                          />
                        ))}
                    </div>
                  </div>
                </div>
              </HeadlessDisclosure.Panel>
            </Transition>
          </>
        )}
      </HeadlessDisclosure>
    </div>
  );
};

const calculateTopicMastery = (
  input: { participant: Participant; submissions: Submission[] }[] | undefined
) => {
  if (!input) return [];

  const submissionsWithParticipants = input.map(({ participant, submissions }) => {
    const results = submissions.map((submission) => ({
      ...submission,
      participant
    }));

    return results.flat();
  });

  const topicMastery = submissionsWithParticipants.flat().reduce((acc, submission) => {
    const { topic } = submission.question;
    const topicID = topic.id;
    const topicName = topic.name;
    const topicMastery = acc[topicID] || {
      topicID,
      topicName,
      total: 0,
      correct: 0,
      submissions: {}
    };

    topicMastery.total += 1;
    (topicMastery.submissions[submission.question.text] =
      topicMastery.submissions[submission.question.text] || []).push(submission);

    if (submission.isCorrect) {
      topicMastery.correct += 1;
    }

    acc[topicID] = {
      ...topicMastery,
      percentage: Math.round((topicMastery.correct / topicMastery.total) * 100)
    };

    return acc;
  }, {} as Record<string, Mastery>);

  return Object.values(topicMastery).sort((a, b) => b.percentage - a.percentage);
};

export default PerformanceTab;

type Mastery = {
  topicID: string;
  topicName: string;
  total: number;
  correct: number;
  percentage: number;
  submissions: { [key: string]: Submission[] };
};
