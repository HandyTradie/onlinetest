import { useNavigate, useParams } from 'react-router-dom';
import { TailSpin } from 'react-loader-spinner';

import { useCreatedQuizmineMocks } from '../../../api/mocks';
import ContinueButton from '../../../components/ContinueButton';
import NewTestForm, { CreateTestFormValues } from './NewTestForm';
import MockDetailPreview from '../../../components/MockDetailPreview';
import { CreateTestSchema, useCreateOnlineTest } from '../../../api/tests';
import toast from 'react-hot-toast';

const CreateNewTestPage = () => {
  const { testID } = useParams();
  const navigate = useNavigate();
  const { mutateAsync: createTest, isLoading: isLoadingCreateTest } = useCreateOnlineTest();

  const { data: mocks, isLoading } = useCreatedQuizmineMocks();
  const mock = mocks?.filter((mock) => mock.configId === testID)[0];

  const onFormSubmit = async (data: CreateTestFormValues) => {
    try {
      if (!mock?.configId) return;

      // Coercion because defaults have null values
      await createTest({ ...data, mockID: mock?.configId } as unknown as CreateTestSchema);
      toast.success('Test created successfully');
      navigate('/created-tests');
    } catch (err) {
      toast.error(String(err));
    }
  };

  return (
    <div>
      <div>
        <h1 className="font-bold text-2xl my-[4vh] text-center">Create Online Test</h1>

        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <TailSpin color="#4353ff" height={24} width={24} />
          </div>
        ) : !mock ? (
          <div className="flex flex-col h-full items-center justify-center">
            <p className="text-center">No test found with this ID.</p>
            <div className="max-w-xs m-auto mt-6">
              <a
                target={'_blank'}
                rel="noreferrer"
                href="https://quizmine-a809e.web.app/generator"
              >
                <ContinueButton>Create Test on Quizmine</ContinueButton>
              </a>
            </div>
          </div>
        ) : (
          <div>
            <div className="my-4 mb-12">
              <MockDetailPreview mock={mock} />
            </div>
            <NewTestForm onSubmit={onFormSubmit} isLoading={isLoadingCreateTest} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateNewTestPage;
