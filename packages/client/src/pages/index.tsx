import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from '../components/Header';
import ProtectedRoutes from '../components/ProtectedRoutes';
import CreateTestPage from './create-test';
import CreateNewTestPage from './create-test/new';
import CreatedTestsPage from './created-tests';
import TestDetailView from './created-tests/TestDetailView';
import DashboardWrapper from './dashboard';
import ParticipantGroups from './dashboard/ParticipantGroups';

import Home from './home';
import SignIn from './sign-in';
import InvitePage from './test/invite';
import JoinTestPage from './test/JoinTestPage';

const PageRoutes = () => {
  return (
    <BrowserRouter>
      <Header />
      <div className="h-full max-w-default m-auto p-4">
        <Routes>
          <Route index element={<Home />} />
          <Route path="sign-in" element={<SignIn />} />
          <Route path="test/i/:invite" element={<InvitePage />} />
          <Route path="test/t/:invite" element={<JoinTestPage />} />

          {/* Routes accessible to authenticated users only */}
          <Route element={<ProtectedRoutes />}>
            <Route path="create-test" element={<CreateTestPage />} />
            <Route path="create-test/:testID" element={<CreateNewTestPage />} />
            <Route path="created-tests" element={<CreatedTestsPage />} />
            <Route path="created-tests/:testID" element={<TestDetailView />} />
            <Route path="dashboard" element={<DashboardWrapper />} />
            <Route
              path="dashboard/participant-groups"
              element={
                <DashboardWrapper>
                  <ParticipantGroups />
                </DashboardWrapper>
              }
            />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default PageRoutes;
