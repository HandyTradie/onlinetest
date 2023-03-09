import { Tab } from '@headlessui/react';
import InviteParticipantsTab from './InviteParticipantsTab';
import ParticipantsTab from './ParticipantsTab';
import { Test } from '../../api/tests';
import QuestionsTab from './QuestionsTab';
import ResultsTab from './ResultsTab';
import StatsTab from './StatsTab';
import { useMemo } from 'react';
import { useCreatedParticipantGroups } from '../../api/participants';
import PerformanceTab from './PerformanceTab';
import { StyledTab, StyledTabPanel } from '../Tabs';

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

type Props = {
  test: Test;
};

export type GroupedParticipantsResults = {
  group: {
    id: string;
    name: string;
    owner: string;
    participants: {
      name: string;
      email: string;
      phone: string;
    }[];
  };
  participantsResults: Test['results'];
}[];

const TestDetailTabs = ({ test }: Props) => {
  const { data: participantGroups } = useCreatedParticipantGroups();

  const groupedParticipantsResults = useMemo(() => {
    // For each participant group, get the results of the participants in that group
    // If there are no participants in the group with results, don't include the group
    return participantGroups?.map((group) => {
      const participantsResults = test?.results?.filter(
        (result) =>
          group.participants.filter((participant) => participant.name === result.participant.name)
            .length > 0
      );
      return {
        group,
        participantsResults
      };
    });
  }, [test?.results, participantGroups]);

  return (
    <div className="w-full  px-2 py-8 sm:px-0">
      <Tab.Group>
        <Tab.List className="flex space-x-1 bg-blue-50 rounded-lg p-1 overflow-x-auto">
          <StyledTab>Participants</StyledTab>
          <StyledTab>Invite</StyledTab>
          <StyledTab>Questions</StyledTab>
          <StyledTab>Results</StyledTab>
          <StyledTab>Stats</StyledTab>
          <StyledTab>Performance</StyledTab>
        </Tab.List>
        <Tab.Panels className="mt-2">
          <StyledTabPanel>
            <ParticipantsTab participants={test?.participants} testID={test.id} />
          </StyledTabPanel>
          <StyledTabPanel>
            <InviteParticipantsTab
              participants={test?.participants}
              testInviteCode={test?.inviteCode}
            />
          </StyledTabPanel>
          <StyledTabPanel>
            <QuestionsTab
              sectionQuestions={test?.sectionQuestions}
              sectionAnswers={test?.sectionAnswers}
            />
          </StyledTabPanel>
          <StyledTabPanel>
            <ResultsTab
              results={(test as any)?.results}
              testID={test?.id}
              groupedParticipantsResults={groupedParticipantsResults}
            />
          </StyledTabPanel>
          <StyledTabPanel>
            <StatsTab
              results={test.results}
              groupedParticipantsResults={groupedParticipantsResults}
            />
          </StyledTabPanel>
          <StyledTabPanel>
            <PerformanceTab
              results={test.results}
              groupedParticipantsResults={groupedParticipantsResults}
            />
          </StyledTabPanel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default TestDetailTabs;
