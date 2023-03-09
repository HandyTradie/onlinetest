import { Disclosure, Tab, Transition } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/outline';
import React, { useMemo } from 'react';
import { GroupedParticipantsResults } from '.';
import { Test } from '../../api/tests';
import { getStandardDeviation } from '../../utils';
import { StyledTab, StyledTabPanel } from '../Tabs';

type Props = {
  results: Test['results'];
  groupedParticipantsResults: GroupedParticipantsResults | undefined;
};

const StatsTab = ({ results, groupedParticipantsResults }: Props) => {
  const {
    total,
    percentagePassed,
    passed,
    median,
    average,
    standardDeviation,
    averageTimePerQuestion
  } = useMemo(() => calculateStats(results), [results]);

  return (
    <div>
      <div className="my-4">
        <p className="">Result statistics.</p>
      </div>

      {!results || results?.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 space-y-4 text-gray-500">
          <p className="text-xl font-medium">No results</p>
          <p className="text-sm">Check back after your students have taken this test.</p>
        </div>
      ) : (
        <Tab.Group>
          <Tab.List className="flex space-x-1 bg-blue-50 rounded-lg p-1 overflow-x-auto">
            <StyledTab>All Participants</StyledTab>
            <StyledTab>Participants by Group</StyledTab>
          </Tab.List>
          <Tab.Panels className="mt-4">
            <StyledTabPanel>
              <div className="my-8 gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                <StatCard title="# Of Participants" value={total} />
                <StatCard title="# Passed" value={passed} />
                <StatCard title="% Passed" value={percentagePassed} />
                <StatCard title="Median Score (%)" value={median.toFixed(2)} />
                <StatCard title="Average Score (%)" value={average.toFixed(2)} />
                <StatCard title="Standard Deviation (%)" value={standardDeviation.toFixed(2)} />
                <StatCard
                  title="Average Time Taken per Question (s)"
                  value={averageTimePerQuestion.toFixed(2)}
                />
              </div>
            </StyledTabPanel>
            <StyledTabPanel>
              {groupedParticipantsResults?.length ? (
                groupedParticipantsResults.map((groupedParticipantsResult) => (
                  <GroupResultsDisclosure
                    key={groupedParticipantsResult.group.id}
                    groupedParticipantsResult={groupedParticipantsResult}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center p-4 space-y-4 text-gray-500">
                  <p className="text-xl font-medium">No grouped results</p>
                  <p className="text-sm">
                    Create a participant group on the dashboard and add its participants to this
                    test.
                  </p>
                </div>
              )}
            </StyledTabPanel>
          </Tab.Panels>
        </Tab.Group>
      )}
    </div>
  );
};

export const StatCard = ({ title, value }: { title: string; value: string | number }) => {
  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <p className="text-gray-500 text-lg text-center">{title}</p>
      <p className="font-bold text-5xl text-center">{value}</p>
    </div>
  );
};

const GroupResultsDisclosure = ({
  groupedParticipantsResult
}: {
  groupedParticipantsResult: GroupedParticipantsResults[0] | undefined;
}) => {
  const {
    total,
    percentagePassed,
    passed,
    median,
    average,
    standardDeviation,
    averageTimePerQuestion
  } = useMemo(
    () => calculateStats(groupedParticipantsResult?.participantsResults),
    [groupedParticipantsResult]
  );
  return (
    <div className="w-full rounded-lg bg-white">
      <Disclosure>
        {({ open }) => (
          <>
            <Disclosure.Button className="flex w-full justify-between rounded-lg bg-blue-50 p-2 text-left font-medium text-blue-900 hover:bg-blue-100 focus:outline-none focus-visible:ring focus-visible:ring-blue-500 focus-visible:ring-opacity-75">
              <label className="flex items-center space-x-2">
                <span>{groupedParticipantsResult?.group.name}</span>
              </label>
              <div className="flex items-center gap-2">
                <ChevronUpIcon
                  className={`${open ? '' : 'rotate-180 transform'} h-5 w-5 text-blue-500`}
                />
              </div>
            </Disclosure.Button>
            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel>
                <div className="my-8 gap-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                  <StatCard title="# Of Participants" value={total} />
                  <StatCard title="# Passed" value={passed} />
                  <StatCard title="% Passed" value={percentagePassed} />
                  <StatCard title="Median Score (%)" value={median.toFixed(2)} />
                  <StatCard title="Average Score (%)" value={average.toFixed(2)} />
                  <StatCard title="Standard Deviation (%)" value={standardDeviation.toFixed(2)} />
                  <StatCard
                    title="Average Time Taken per Question (s)"
                    value={averageTimePerQuestion.toFixed(2)}
                  />
                </div>
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );
};

function calculateStats(results: Test['results']) {
  const total = results?.length ?? 0;
  const passed =
    results?.filter((participant) => participant.results.slice(-1)[0]?.isPassed ?? true).length ??
    0;
  const percentagePassed = ((passed / total) * 100 || 0).toFixed(2);
  const resultScores =
    results
      ?.map(
        (participant) =>
          ((participant.results.slice(-1)[0]?.correctAnswers ?? 0) /
            (participant.results.slice(-1)[0]?.totalNumberOfQuestions ?? 0)) *
            100 ?? 0
      )
      .sort((a, b) => a - b) || [];

  // Median
  const half = Math.floor(resultScores.length / 2);
  const median =
    (resultScores.length % 2
      ? resultScores[half]
      : (resultScores[half - 1] + resultScores[half]) / 2) || 0;

  // Average
  const average = resultScores.reduce((a, b) => a + b, 0) / resultScores.length || 0;

  // Std dev
  const standardDeviation = getStandardDeviation([...resultScores]) || 0;

  const participantsAverageTimePerQuestion =
    results?.map(
      (participant) =>
        (participant.results.slice(-1)[0]?.timeTaken ?? 0 / 1000) /
          participant.results.slice(-1)[0]?.totalNumberOfQuestions ?? 0
    ) || [];

  const averageTimePerQuestion =
    (participantsAverageTimePerQuestion?.reduce((a, b) => a + b, 0) /
      participantsAverageTimePerQuestion?.length || 0) / 1000;

  return {
    total,
    passed,
    percentagePassed,
    median,
    average,
    standardDeviation,
    averageTimePerQuestion
  };
}

export default StatsTab;
