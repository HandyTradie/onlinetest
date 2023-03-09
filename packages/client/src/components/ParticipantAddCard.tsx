import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { isPossiblePhoneNumber } from 'react-phone-number-input';
import InputWithLabel from './InputWithLabel';
import PhoneInputWithLabel from './PhoneInputWithLabel';

type Props = {
  onSubmitParticipant: (data: typeof defaultValues) => void;
};

const defaultValues = {
  name: '',
  email: '',
  phone: ''
};

const ParticipantAddCard = ({ onSubmitParticipant }: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitSuccessful },
    control,
    reset
  } = useForm({
    defaultValues
  });

  const onSubmit = () => {
    handleSubmit(onSubmitParticipant)();
  };
  React.useEffect(() => {
    reset({
      name: '',
      email: '',
      phone: ''
    });
  }, [isSubmitSuccessful, reset]);

  return (
    <div className="flex flex-col sm:flex-row w-full gap-4 mb-6 mt-2">
      <div>
        <InputWithLabel
          label=""
          className="p-2 border rounded-lg min-w-[260px]"
          placeholder="Name"
          error={errors?.name?.message as string}
          {...register('name', {
            required: { value: true, message: 'Participant name is required' }
          })}
        />
      </div>
      <div className="flex gap-4 w-full">
        <InputWithLabel
          label=""
          className="p-2 border rounded-lg w-full"
          placeholder="Email"
          type={'email'}
          error={errors?.email?.message as string}
          {...register('email', {
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
              message: 'Invalid email address'
            }
          })}
        />
        <Controller
          name="phone"
          control={control}
          rules={{
            // required: 'A phone number is required',
            validate: (v) => !v || isPossiblePhoneNumber(String(v)) || 'Input a valid phone number'
          }}
          render={({ field: { onChange, value, ref }, fieldState: { error } }) => (
            <PhoneInputWithLabel
              onChange={onChange}
              value={value}
              ref={ref}
              label=""
              className="p-2 border rounded-lg w-full"
              error={error?.message}
            />
          )}
        />
        <button
          onClick={onSubmit}
          type="button"
          className="px-4 rounded-lg bg-[#4353ff] text-white text-2xl max-h-[42px]"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default ParticipantAddCard;
