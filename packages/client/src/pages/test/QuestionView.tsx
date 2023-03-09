import { observer } from 'mobx-react-lite';
import MarkdownRenderer from '../../components/MarkdownRenderer';
import { TestQuestion } from '../../models/Test';

type Props = {
  question: TestQuestion | undefined;
};

const QuestionView = ({ question }: Props) => {
  if (!question) return null;

  return (
    <div className="flex flex-col items-center">
      <div className="text-xl font-bold m-auto text-center">
        <MarkdownRenderer forceRerenders>{question.text}</MarkdownRenderer>
      </div>
      {/* {question?.resource && (
        <div className="my-6 text-center">
          <MarkdownRenderer forceRerenders>{question.resource}</MarkdownRenderer>
        </div>
      )} */}
    </div>
  );
};

export default observer(QuestionView);
