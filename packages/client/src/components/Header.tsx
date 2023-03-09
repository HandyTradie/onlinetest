import { observer } from 'mobx-react-lite';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOutUser } from '../firebase/auth';
import { useCurrentPath } from '../hooks/useCurrentPath';
import { User } from '../models/User';

const Header = () => {
  const navigate = useNavigate();
  const currentPath = useCurrentPath();

  return (
    <div className="w-full flex justify-between p-4 px-4 border-b border-black border-opacity-20">
      <Link to="/">Quizmine - Online</Link>

      <div className="">
        {User.loggedIn && (
          <Link to="/dashboard" className="mr-4">
            <button>Dashboard</button>
          </Link>
        )}
        {currentPath !== '/test/i/:id' && (
          <button onClick={User.loggedIn ? signOutUser : () => navigate('/sign-in')}>
            {User.loggedIn ? 'Sign Out' : 'Sign In as Tutor'}
          </button>
        )}
      </div>
    </div>
  );
};

export default observer(Header);
