import React from 'react';
import { TailSpin } from 'react-loader-spinner';
import { useParams } from 'react-router-dom';
import { Test, triggerWrite, useFetchCreatedTests } from '../../api/tests';
import TestDetailPreview from '../../components/TestDetailPreview';
import TestDetailTabs from '../../components/TestDetailTabs';

const TestDetailView = () => {
  const { data, isLoading } = useFetchCreatedTests();
  const { testID } = useParams();

  const test = data?.docs?.filter((test) => test.id === testID)[0];

  // Unsubscribe from the tests collection listener when the component unmounts
  React.useEffect(() => {
    return () => {
      data?.unsubscribe();
    };
  }, [data]);

  return (
    <div className="mt-[4vh]">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <TailSpin color="#4353ff" height={24} width={24} />
        </div>
      ) : !test || !testID ? (
        <div className="flex flex-col h-full items-center justify-center">
          <p className="text-center">No test found with this ID.</p>
        </div>
      ) : (
        <div>
          <h1 className="font-bold text-2xl  text-center">{test.testName}</h1>
          <div className="flex items-center justify-center mt-2">
            <TestProcessingStatusBadge status={test.processingStatus} />
          </div>
          {/* For debugging */}
          {/* <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => triggerWrite(testID)}
          >
            Trigger firestore onWrite
          </button> */}
          <div className="my-4 mt-8">
            <TestDetailPreview test={test} />
          </div>
          <div>
            <TestDetailTabs test={test} />
          </div>
        </div>
      )}
    </div>
  );
};

export default TestDetailView;

export const TestProcessingStatusBadge = ({ status }: { status: Test['processingStatus'] }) => {
  switch (status) {
    case 'pending':
      return (
        <div className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full flex items-center">
          PROCESSING
        </div>
      );
    case 'processed':
      return (
        <div className="text-xs px-3 py-1 bg-green-200 text-green-800 rounded-full flex items-center">
          PROCESSED
        </div>
      );
    case 'failed':
      return (
        <div className="text-xs px-3 py-1 bg-red-200 text-red-800 rounded-full flex items-center">
          FAILED
        </div>
      );
  }
};
