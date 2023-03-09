import { useEffect } from 'react';
import { TailSpin } from 'react-loader-spinner';
import { useParams } from 'react-router-dom';
import { useProcessInvite } from '../../api/tests';
import TestStore from '../../models/Test';
import TestPage from './TestPage';

// Invites link to the invite page
// Invite page posts backend to verify invite
// Backend responds with the test with questions
// Frontend stores the test in memory with a mobx state tree store
// USer is redirected to test page
// Test page renders the test from the store and updates answers in the store

const InvitePage = () => {
  const { invite } = useParams();
  const { mutateAsync, error, data, isSuccess } = useProcessInvite();

  useEffect(() => {
    // Clear the store
    TestStore.resetTest();

    if (invite && !data) {
      mutateAsync({ invite });
    }
  }, [invite, mutateAsync]);

  if (data && isSuccess && invite) {
    return <TestPage test={data.test} invite={invite} />;
  }

  return (
    <div>
      <div className="w-full h-[80vh] flex flex-col items-center justify-center">
        {error ? (
          <div className="flex flex-col items-center gap-8">
            <h1 className="text-2xl font-bold text-red-500">Error processing invite</h1>
            <p className="text-center text-xl">{(error as Error).message}</p>

            <a href="/" className="text-blue-500">
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Go Home
              </button>
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-8">
            <TailSpin width={40} height={40} />
            <p>Processing invite</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitePage;
