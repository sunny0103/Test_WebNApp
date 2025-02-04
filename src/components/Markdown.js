import ReactMarkdown from 'react-markdown';

const Markdown = ({ content }) => {
  return (
    <div className="prose max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};

export default Markdown; 