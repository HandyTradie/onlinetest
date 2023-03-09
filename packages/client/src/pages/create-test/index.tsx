import React from 'react';
import { TailSpin } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

import { useCreatedQuizmineMocks } from '../../api/mocks';
import ContinueButton from '../../components/ContinueButton';

const CreateTestPage = () => {
  const navigate = useNavigate();
  const { data: mocks, isLoading } = useCreatedQuizmineMocks();

  return (
    <div>
      <h1 className="font-bold text-2xl mt-[4vh] text-center">Create Online Test</h1>
      <div>
        <p className="mt-4 text-center">
          Select a test you&apos;ve already created on{' '}
          <a href="https://quizmine-a809e.web.app" className="text-blue-500">
            Quizmine
          </a>{' '}
          from the list below to get started
        </p>

        <div className="mt-4 border border-black border-opacity-20 rounded-lg h-[37vh] overflow-auto">
          {!isLoading && mocks && mocks?.length > 0 && (
            <ul>
              {mocks?.map((item) => (
                <li key={item.configId}>
                  <button
                    onClick={() => navigate(`/create-test/${item.configId}`)}
                    className="flex flex-col gap-2 sm:flex-row w-full justify-between p-2 sm:p-4 border-b border-opacity-10 hover:bg-black hover:bg-opacity-5"
                  >
                    <p className="text-left line-clamp-1">
                      {item.schoolName} - {item.examTitle} - {item.courseName}
                    </p>
                    <div className="flex gap-4 justify-between w-full sm:w-auto">
                      <span>{format(new Date(item.createdAt), 'hh:mm - dd/MM')}</span>
                      <span className="hidden sm:block">&gt;</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {isLoading && (
            <div className="flex justify-center items-center h-full">
              <TailSpin height={24} width={24} color={'#4353ff'} />
            </div>
          )}

          {!isLoading && mocks && mocks?.length === 0 && (
            <div className="flex justify-center items-center h-full">
              <p className="text-center">
                No tests found. Click the button below to create a test.
              </p>
            </div>
          )}
        </div>
      </div>

      <hr className="my-[6vh]" />

      <div>
        <h1 className="font-bold text-2xl m-4 text-center">Create Test</h1>

        <div className="flex flex-col gap-2">
          <p className="text-center">
            Sign in, create a test, choose from a wide range of courses and topics.
          </p>
          <p className="text-center">
            The test you create will show up in the list above when you&apos;re done
          </p>
        </div>

        <div className="max-w-xs m-auto mt-6">
          <a target={'_blank'} rel="noreferrer" href="https://quizmine-a809e.web.app/generator">
            <ContinueButton>Create Test on Quizmine</ContinueButton>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CreateTestPage;
