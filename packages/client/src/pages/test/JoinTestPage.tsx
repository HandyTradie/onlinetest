import { format } from 'date-fns';
import { Controller, useForm } from 'react-hook-form';
import { TailSpin } from 'react-loader-spinner';
import { useNavigate, useParams } from 'react-router-dom';
import PhoneInput, { isPossiblePhoneNumber } from 'react-phone-number-input';

import { useGetTestDetails, useJoinTest } from '../../api/tests';
import ContinueButton from '../../components/ContinueButton';
import InputWithLabel from '../../components/InputWithLabel';
import 'react-phone-number-input/style.css';
import styles from '../../styles/reset.module.css';

const JoinTestPage = () => {
  const { invite } = useParams();
  const navigate = useNavigate();
  const { data: test, isLoading, error } = useGetTestDetails(String(invite));
  const {
    register,
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: formDefaults
  });
  const {
    mutate: joinTest,
    isLoading: isJoiningTest,
    error: joinError
  } = useJoinTest(String(invite));

  const handleJoinTest = (data: typeof formDefaults) => {
    joinTest(data, {
      onSuccess: ({ invite }) => {
        navigate(`/test/i/${invite}`);
      }
    });
  };

  return (
    <div className="flex py-[5vh] items-center justify-center">
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
      ) : isLoading || !test ? (
        <div className="flex flex-col items-center gap-8">
          <TailSpin width={40} height={40} />
          <p>Processing invite</p>
        </div>
      ) : (
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
                            (test?.numberOfQuestions ?? 0)
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
                    <b>Questions</b>
                    <p className="text-center line-clamp-2">{test?.numberOfQuestions}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <b>Pass Grade</b>
                    <p className="text-center line-clamp-2">{test.passingScore}%</p>
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
          </div>

          <form onSubmit={handleSubmit(handleJoinTest)} className="flex flex-col mt-6">
            <p className="text-center">
              Enter your name and email or phone number to take this test
            </p>

            <div className="flex flex-col gap-3 mt-8">
              <InputWithLabel
                label="Full Name"
                error={errors?.name?.message as string}
                {...register('name', {
                  required: { value: true, message: 'Full name is required' }
                })}
              />
              <InputWithLabel
                label="Email"
                type={'email'}
                error={errors?.email?.message as string}
                {...register('email')}
              />

              <Controller
                name="phone"
                control={control}
                rules={{
                  required: 'A phone number is required',
                  validate: (v) => isPossiblePhoneNumber(String(v)) || 'Input a valid phone number'
                }}
                render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
                  <div className="flex flex-col w-full space-y-2">
                    <label className="text-base font-medium text-slate-body">Phone Number</label>

                    <div
                      className="p-3 border-2 rounded-lg"
                      style={error ? { borderColor: '#FF9494' } : {}}
                    >
                      <PhoneInput
                        ref={ref}
                        international
                        defaultCountry="GH"
                        value={value}
                        required
                        onChange={onChange}
                        className={styles.reset}
                      />
                    </div>
                    {error && <p className="text-red-500">{error.message}</p>}
                  </div>
                )}
              />

              <div className="mt-6">
                <>
                  {joinError && (
                    <p className="text-red-500 mb-2">{String((joinError as Error)?.message)}</p>
                  )}

                  <ContinueButton noContinue loading={isJoiningTest}>
                    Join Test
                  </ContinueButton>
                </>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

const formDefaults = {
  name: '',
  email: '',
  phone: ''
};

export default JoinTestPage;
