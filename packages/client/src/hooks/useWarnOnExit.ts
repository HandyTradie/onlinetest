import { useEffect } from 'react';

export default function useWarnOnExit(handleExit: () => void) {
  useEffect(() => {
    window.addEventListener('beforeunload', alertUser);
    window.addEventListener('unload', handleExit);
    return () => {
      window.removeEventListener('beforeunload', alertUser);
      window.removeEventListener('unload', handleExit);
      handleExit();
    };
  }, []);

  const alertUser = (e: BeforeUnloadEvent) => {
    e.preventDefault();
    e.returnValue = '';
  };
}
