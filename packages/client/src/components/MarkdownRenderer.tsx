import ReactMarkdown from 'react-markdown';
import { MathJax } from 'better-react-mathjax';
import rehypeRaw from 'rehype-raw';

import '../styles/markdown.css';

const MarkdownRenderer = ({
  children,
  forceRerenders
}: {
  children: string;
  forceRerenders?: boolean;
}) => {
  return (
    <MathJax
      // This is a hack to get Mathjax to rerender when the children change
      // This is necessary because Mathjax doesn't rerender when the children change
      // Randomizing the key forces React to unmount and remount the component each time which is inefficient but works for now
      // MarkdownRenderer is used in a number of places though so this escape hatch is activated by the forceRerenders prop
      key={forceRerenders ? Math.random() : undefined}
    >
      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{children}</ReactMarkdown>
    </MathJax>
  );
};

export default MarkdownRenderer;
