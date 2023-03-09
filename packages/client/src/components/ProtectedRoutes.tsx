import { observer } from 'mobx-react-lite';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { User } from '../models/User';

const ProtectedRoutes = () => {
  const { pathname } = useLocation();

  return User.loggedIn ? (
    <Outlet />
  ) : (
    <Navigate to={`/sign-in?next=${encodeURIComponent(pathname)}`} replace />
  );
};

export default observer(ProtectedRoutes);
