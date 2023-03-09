import ArrowRightIcon from '@heroicons/react/outline/ArrowRightIcon';
import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContinueButton from '../components/ContinueButton';
import { User } from '../models/User';

const Home = () => {
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const [testInvite, participantInvite] = inviteCode.split('-');

    if (!participantInvite) {
      navigate('/test/t/' + testInvite);
    } else {
      navigate('/test/i/' + inviteCode);
    }
  };

  return (
    <div className="">
      <h1 className="text-center mt-[8vh] mb-[4vh] font-medium text-slate-headline text-mobile-h1 md:text-desktop-h1">
        Online Testing
      </h1>
      <br />
      <div>
        <p className="text-desktop-subheading text-center">Student?</p>
        <p className="text-center mt-2">
          Enter the code your tutor shared with you below to get started
        </p>
        <form
          onSubmit={handleFormSubmit}
          className="max-w-xs flex items-center py-3 px-3 m-auto mt-6 border rounded-lg focus-within:shadow focus-within:shadow-blue-200"
        >
          <input
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            className="w-full focus:outline-none font-bold h-full"
            required
          />
          <button type="submit">
            <ArrowRightIcon className="w-5" />
          </button>
        </form>
      </div>
      <hr className="my-[5vh]" />
      <div>
        <p className="text-desktop-subheading text-center">Tutor?</p>
        <p className="text-center mt-2">
          Create and share your own online tests with your students.
        </p>
        <div className="max-w-xs m-auto mt-6">
          <ContinueButton noContinue onClick={() => navigate('/create-test')}>
            Create Test
          </ContinueButton>
        </div>
        {User.loggedIn && (
          <>
            <hr className="my-8 max-w-md m-auto" />
            <div>
              <p className="text-center mt-2">View your created tests.</p>
              <div className="max-w-xs m-auto mt-6">
                <ContinueButton noContinue onClick={() => navigate('/created-tests')}>
                  Your Tests
                </ContinueButton>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default observer(Home);
