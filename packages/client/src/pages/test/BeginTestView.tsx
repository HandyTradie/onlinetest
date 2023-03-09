import { format } from 'date-fns';
import { observer } from 'mobx-react-lite';
import { useEffect, useMemo, useState } from 'react';
import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
import '@leenguyen/react-flip-clock-countdown/dist/index.css';

import { Test, useReportTestStart } from '../../api/tests';
import { getSynchronizedServerTime } from '../../utils/time';
import { useTakeTest } from './useTakeTest';
import { TailSpin } from 'react-loader-spinner';

type Props = {
  test: Test;
  invite: string;
};

const BeginTestView = ({ test, invite }: Props) => {
  const { beginTest } = useTakeTest();
  const { mutate: reportStart, error, isLoading } = useReportTestStart();
  const [serverTime] = useState(new Date(getSynchronizedServerTime()));
  const isLessThanStartTime = useMemo(
    () => test.testStartDate && serverTime < new Date(test.testStartDate),
    [serverTime]
  );
  const testDuration = Number(test?.testDuration) ?? 0;
  const testTime =
    test?.timing === 'timePerTest'
      ? testDuration * 1000 * 60
      : testDuration * 1000 * (test.numberOfQuestions ?? 0);
  const hasLessThanAvailableTime =
    new Date(test.testEndDate).getTime() - serverTime.getTime() < testTime;

  function handleCountdownComplete() {
    // This could trigger the test begin function here or update the disabled state of the button to allow the user to begin the test
    // But I'm not sure that's a good idea from a correctness perspective
    // For one, if for any reason the countdown is not accurate, the user could begin the test before the start time
    // If the test parameters are changed in the time that this page is open, the user could begin the test with the wrong parameters
    // So the plan here is to force a whole page reload when the countdown is complete
    // This will ensure that the test parameters are up to date, time is synchronized, etc.
    // The downside is that the user will have to wait for the page to reload before they can begin the test
    // But I think that's a better tradeoff than the alternative

    setTimeout(() => {
      // This timeout is to account for any discrepancy between the countdown and the actual start time
      window.location.reload();
    }, 1000);
    // After reloading, the countdown will be gone and the user will be able to begin the test
  }

  const handleBeginTest = () => {
    reportStart(
      { invite },
      {
        onSuccess: () => {
          beginTest(test, invite);
        }
      }
    );
  };

  // useEffect(() => {
  //   console.log('Test data:', test)
  // }, [])

  return (
    <div>
      <h1 className="font-bold text-2xl  text-center">{test.testName}</h1>
      <p className="text-center text-xl mt-4">{test.testDescription}</p>

      <div className="mt-[4vh] h-full flex flex-col justify-between">
        <div className="bg-blue-50 rounded-lg py-4 pb-8 px-2">
          <h1 className="text-center font-bold">Test Details</h1>

          <div className="flex flex-col gap-6 mt-6">
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 gap-4">
              <div className="flex flex-col items-center">
                <b>Duration (minutes)</b>
                <p className="text-center line-clamp-2">
                  {test.timing === 'timePerTest'
                    ? test.testDuration
                    : test.timing === 'timePerQuestion'
                    ? (
                        (parseInt(test.testDuration) / 60) *
                        Number(test?.numberOfQuestions)
                      ).toFixed(1)
                    : test.testDuration}
                </p>
              </div>
              <div
                className="flex flex-col items-center"
                title={
                  test.timing === 'timePerTest'
                    ? 'You can spend any amount on time on each question'
                    : `You can spend a max of ${test.testDuration} seconds on each question`
                }
              >
                <b>Time Per Question</b>
                <p className="text-center line-clamp-2">
                  {test.timing === 'timePerQuestion' ? `${test.testDuration}s` : '∞'}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <b>Sections</b>
                <p className="text-center line-clamp-2">{test.sectionQuestions?.flat()?.length}</p>
              </div>
              <div className="flex flex-col items-center">
                <b>Questions</b>
                <p className="text-center line-clamp-2">{Number(test?.numberOfQuestions)}</p>
              </div>
              <div className="flex flex-col items-center">
                <b>Begins</b>
                <p className="text-center line-clamp-2">
                  {format(new Date(test.testStartDate), 'HH:mm:ss, do LLL yyyy')}
                </p>
              </div>
              <div className="flex flex-col items-center">
                <b>Ends</b>
                <p className="text-center line-clamp-2">
                  {format(new Date(test.testEndDate), 'HH:mm:ss, do LLL yyyy')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {
          // Show warning telling user that the test will end before they can finish
          hasLessThanAvailableTime && (
            <div className="bg-red-50 rounded-lg py-4 px-2 mt-4">
              <h1 className="text-center font-bold">Warning</h1>
              <p className="text-center mt-4">
                The test will end soon. You will have less time than the test duration to complete
                the test.
              </p>
            </div>
          )
        }

        {isLessThanStartTime && (
          <div className="flex flex-col gap-4 items-center mt-[8vh]">
            <p className="text-lg font-bold mb-4 text-red-500 uppercase">Test has not started</p>
            <p className="text-lg font-bold mb-2">It will begin in</p>

            <div className="max-w-full flex items-center justify-center">
              <FlipClockCountdown
                className="scale-75 sm:scale-100"
                to={new Date(test.testStartDate)}
                labels={['DAYS', 'HOURS', 'MINUTES', 'SECONDS']}
                labelStyle={{
                  fontWeight: 500,
                  textTransform: 'uppercase',
                  color: '#000'
                }}
                dividerStyle={{ color: 'white', height: 1 }}
                separatorStyle={{ color: 'red', size: '6px' }}
                duration={0.5}
                onComplete={handleCountdownComplete}
              />
            </div>
          </div>
        )}

        <div className="mt-[8vh] flex flex-col items-center justify-center">
          <>{error && <div className="text-red-500 mb-2">{String(error)}</div>}</>
          <button
            type="button"
            onClick={handleBeginTest}
            disabled={isLessThanStartTime || isLoading}
            className="max-w-sm py-4 bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded w-full disabled:grayscale disabled:hover:bg-blue-500 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex justify-center">
                <TailSpin width={24} height={24} />
              </div>
            ) : (
              'Begin Test'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default observer(BeginTestView);
