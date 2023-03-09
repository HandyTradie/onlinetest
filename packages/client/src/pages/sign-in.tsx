import { useForm } from 'react-hook-form';
import { useLocation, useSearchParams } from 'react-router-dom';

import InputWithLabel from '../components/InputWithLabel';
import ContinueButton from '../components/ContinueButton';
import { useSignInWithEmailAndPassword } from '../firebase/auth';

const SignIn = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const { isLoading, error, mutateAsync: signIn } = useSignInWithEmailAndPassword();
  const [params] = useSearchParams();
  const urlNext = params.get('next');
  const next = urlNext || '/';

  const onSubmit = ({ email, password }: { email: string; password: string }) =>
    signIn({ email, password, redirectTo: next });

  return (
    <section className="min-h-screen bg-white font-dm-sans">
      <div>
        <div className="justify-center w-full px-6 md:min-h-screen md:mx-0 md:flex">
          <div className="my-12 md:my-0">
            <div className="flex items-center justify-center h-full">
              <form onSubmit={handleSubmit(onSubmit)} className="w-[574px] max-w-xl space-y-8">
                <>
                  <h1 className="font-medium text-mobile-h2"> Sign In </h1>
                  <InputWithLabel
                    label={'Email'}
                    type={'email'}
                    required
                    error={errors?.email?.message as any}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                  <InputWithLabel
                    label={'Password'}
                    forgetPassword
                    type={'password'}
                    required
                    error={errors?.password?.message as any}
                    {...register('password')}
                  />
                  {error && <p className="text-red-500">{String(error)}</p>}
                  {urlNext && (
                    <p className="">Coming from QuizMine? Your login details work here too.</p>
                  )}

                  <ContinueButton label={'Sign in'} loading={isLoading} />
                  <div className="text-left">
                    <p className="text-slate-body">
                      Don&apos;t have an account?{' '}
                      <a href="https://mockgenupgrades.web.app">
                        <span className="underline text-slate-blue">Register on Quizmine</span>
                      </a>
                    </p>
                  </div>
                </>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
