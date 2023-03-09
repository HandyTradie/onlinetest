import PageRoutes from './pages';
import { Toaster } from 'react-hot-toast';
import './App.css';

const App = () => {
  return (
    <>
      <PageRoutes />
      <Toaster position="bottom-right" />
    </>
  );
};

export default App;
