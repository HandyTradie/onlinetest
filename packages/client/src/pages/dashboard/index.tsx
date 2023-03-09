import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const DashboardWrapper = ({ children }: { children?: React.ReactElement }) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!children) {
      navigate('/dashboard/participant-groups');
    }
  }, [children, navigate]);

  return (
    <div className="flex flex-col">
      <nav className="flex gap-4 border-b w-full py-2">
        <button>
          <Link to="/dashboard/participant-groups">Participant Groups</Link>
        </button>
      </nav>
      <div>{children}</div>
    </div>
  );
};

export default DashboardWrapper;
