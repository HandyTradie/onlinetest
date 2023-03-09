import { observer } from 'mobx-react-lite';
import { Test } from '../../api/tests';
import LeavePagePrompt from '../../components/LeavePagePrompt';
import { useCallbackPrompt } from '../../hooks/useCallbackPrompt';
import BeginTestView from './BeginTestView';
import TakeTestView from './TakeTestView';
import { useTakeTest } from './useTakeTest';

type Props = {
  test: Test;
  invite: string;
};

const TestPage = ({ test, invite }: Props) => {
  const { isTakingTest, resetTest, keepFocus } = useTakeTest();
  const [showPrompt, confirmNavigation, cancelNavigation] = useCallbackPrompt(Boolean(keepFocus));

  return (
    <div className="mt-[4vh]">
      {isTakingTest ? <TakeTestView /> : <BeginTestView test={test} invite={invite} />}
      <LeavePagePrompt
        isOpen={showPrompt}
        handleCancel={cancelNavigation}
        handleContinue={() => {
          resetTest();
          confirmNavigation();
        }}
      />
    </div>
  );
};

export default observer(TestPage);
