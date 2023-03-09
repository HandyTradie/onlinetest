import { useForm, Controller } from 'react-hook-form';

import DateTimePicker from '../../../components/DateTimePicker';
import FormSwitchInput from '../../../components/FormSwitchInput';
import InputWithLabel from '../../../components/InputWithLabel';
import ContinueButton from '../../../components/ContinueButton';
import ParticipantAddCard from '../../../components/ParticipantAddCard';
import { uniqueBy } from '../../../utils';
import ParticipantPreviewCard from '../../../components/ParticipantPreviewCard';
import SelectInputWithLabel from '../../../components/SelectInputWithLabel';

type Props = {
  onSubmit: (data: CreateTestFormValues) => void;
  isLoading?: boolean;
};

const NewTestForm = ({ onSubmit, isLoading }: Props) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: formDefaults
  });

  const timingValue = watch('timing');

  return (
    <div>
      <form className="mt-4 flex flex-col gap-5" onSubmit={handleSubmit(onSubmit)}>
        <InputWithLabel
          label="Test Name"
          error={errors?.testName?.message as string}
          {...register('testName', {
            required: { value: true, message: 'Test name is required' }
          })}
        />
        <InputWithLabel label="Test Description" {...register('testDescription')} />
        <Controller
          name="testStartDate"
          control={control}
          rules={{ required: { value: true, message: 'Test start date is required' } }}
          render={({ field: { value, onChange } }) => (
            <label className="space-y-2 w-full">
              <p>Test Availability Start Date & Time</p>
              <div
                className={`border-2 rounded-lg py-[0.2rem] ${
                  errors?.testStartDate?.message && 'border-red-500'
                }`}
              >
                <DateTimePicker onChange={onChange} value={value} />
              </div>
              {errors?.testStartDate?.message && (
                <p className="text-red-500">{errors?.testStartDate?.message as string}</p>
              )}
            </label>
          )}
        />
        <Controller
          name="testEndDate"
          control={control}
          rules={{ required: { value: true, message: 'Test end date is required' } }}
          render={({ field: { value, onChange } }) => (
            <label className="space-y-2 w-full">
              <p>Test Availability End Date & Time</p>
              <div
                className={`border-2 rounded-lg py-[0.2rem] ${
                  errors?.testEndDate?.message && 'border-red-500'
                }`}
              >
                <DateTimePicker onChange={onChange} value={value} />
              </div>
              {errors?.testEndDate?.message && (
                <p className="text-red-500">{errors?.testEndDate?.message as string}</p>
              )}
            </label>
          )}
        />

        <SelectInputWithLabel
          label="Timing"
          type="select"
          options={[
            {
              label: 'Time per Test',
              value: 'timePerTest'
            },
            {
              label: 'Time per Question',
              value: 'timePerQuestion'
            }
          ]}
          error={errors?.timing?.message as string}
          {...register('timing', {
            required: { value: true, message: 'Test timing mode is required' }
          })}
        />

        <InputWithLabel
          label={
            timingValue === 'timePerTest'
              ? 'Test Duration (minutes)'
              : 'Time per Question (seconds)'
          }
          type="number"
          min={0}
          error={errors?.testDuration?.message as string}
          {...register('testDuration', {
            required: { value: true, message: 'Test duration is required' }
          })}
        />

        <Controller
          name="passingScore"
          control={control}
          rules={{ required: { value: true, message: 'Passing score is required' } }}
          render={({ field: { value, onChange } }) => (
            <InputWithLabel
              label="Passing Score (%)"
              type="number"
              min={0}
              max={100}
              error={errors?.passingScore?.message as string}
              value={value}
              onChange={(e) => {
                const newValue = parseInt(e.target.value);
                if (newValue > 100) {
                  onChange(100);
                } else if (newValue < 0) {
                  onChange(0);
                } else {
                  onChange(newValue);
                }
              }}
            />
          )}
        />

        <div className="mt-4">
          <p className="text-base font-medium text-slate-body mb-2">Test Settings</p>

          <div className=" grid xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto">
            <div>
              <Controller
                name="showScore"
                control={control}
                render={({ field: { value, onChange, ref } }) => (
                  <FormSwitchInput
                    label="Show Score To Students"
                    checked={value}
                    onChange={onChange}
                    ref={ref}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="emailScores"
                control={control}
                render={({ field: { value, onChange, ref } }) => (
                  <FormSwitchInput
                    label="Email Score To Students"
                    checked={value}
                    onChange={onChange}
                    ref={ref}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="randomizeQuestions"
                control={control}
                render={({ field: { value, onChange, ref } }) => (
                  <FormSwitchInput
                    label="Randomize Questions"
                    checked={value}
                    onChange={onChange}
                    ref={ref}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="allowMultipleAttempts"
                control={control}
                render={({ field: { value, onChange, ref } }) => (
                  <FormSwitchInput
                    label="Allow Multiple Attempts"
                    checked={value}
                    onChange={onChange}
                    ref={ref}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="allowReview"
                control={control}
                render={({ field: { value, onChange, ref } }) => (
                  <FormSwitchInput
                    label="Allow Test Review"
                    checked={value}
                    onChange={onChange}
                    ref={ref}
                  />
                )}
              />
            </div>
            <div>
              <Controller
                name="skipQuestions"
                control={control}
                render={({ field: { value, onChange, ref } }) => (
                  <FormSwitchInput
                    label="Allow Skipping Questions"
                    checked={value}
                    onChange={onChange}
                    ref={ref}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <div>
          <Controller
            name="participants"
            control={control}
            render={({ field: { value, onChange } }) => (
              <>
                <p className="text-base font-medium text-slate-body mb-2">Participants</p>
                {value?.length > 0 && (
                  <div className="flex flex-wrap gap-4 mb-4">
                    {value.map((participant: { email: string; name: string; phone: string }) => (
                      <ParticipantPreviewCard
                        key={participant.name}
                        email={participant.email}
                        name={participant.name}
                        phone={participant.phone}
                        onDeleteClick={() => {
                          // Remove participant from array
                          onChange(
                            value.filter((p: { name: string }) => p.name !== participant.name)
                          );
                        }}
                      />
                    ))}
                  </div>
                )}
                <ParticipantAddCard
                  onSubmitParticipant={(participant) => {
                    // Add participant to array without duplicates
                    onChange(uniqueBy('name', [...value, participant]));
                  }}
                />
              </>
            )}
          />
          <p className="-mt-2">
            This is optional for now, you will be able to add participants after creating the test.
            In bulk too.
          </p>
        </div>

        <div className="max-w-xs m-auto mt-8">
          <div className="">
            <ContinueButton noContinue loading={isLoading}>
              Create Test
            </ContinueButton>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewTestForm;

const formDefaults = {
  testName: '',
  testDescription: '',
  testStartDate: null,
  timing: 'timePerTest',
  testDuration: null,
  testEndDate: null,
  showScore: false,
  emailScores: false,
  randomizeQuestions: false,
  allowMultipleAttempts: false,
  allowReview: false,
  skipQuestions: false,
  passingScore: 50,
  participants: []
};

export type CreateTestFormValues = typeof formDefaults;
