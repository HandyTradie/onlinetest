import { format } from 'date-fns';
import React from 'react';
import { TailSpin } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';

import { useFetchCreatedTests } from '../../api/tests';
import { TestProcessingStatusBadge } from './TestDetailView';

const CreatedTestsPage = () => {
  const { data, isLoading } = useFetchCreatedTests();
  const navigate = useNavigate();

  const tests = data?.docs;

  // Unsubscribe from the tests collection listener when the component unmounts
  React.useEffect(() => {
    return () => {
      data?.unsubscribe();
    };
  }, [data]);

  return (
    <div>
      <h1 className="font-bold text-2xl mt-[4vh] text-center">Your Online Tests</h1>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <TailSpin color="#4353ff" height={24} width={24} />
          </div>
        ) : !tests?.length ? (
          <div className="flex flex-col h-full items-center justify-center">
            <p className="text-center">No tests created.</p>
          </div>
        ) : (
          <div>
            <ul>
              {tests?.map((test) => (
                <li key={test.id}>
                  <button
                    onClick={() => navigate(`/created-tests/${test.id}`)}
                    className="flex flex-col gap-2 sm:flex-row w-full justify-between p-2 sm:p-4 border-b border-opacity-10 hover:bg-black hover:bg-opacity-5"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-left line-clamp-1">{test.testName}</p>
                      <TestProcessingStatusBadge status={test.processingStatus} />
                    </div>
                    <div className="flex gap-4 justify-between w-full sm:w-auto">
                      <span>{format(new Date(test.createdAt), 'hh:mm - dd/MM')}</span>
                      <span className="hidden sm:block">&gt;</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatedTestsPage;
