
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface MarkdownMessageProps {
  content: string;
}

const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ content }) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Customize heading styles
          h1: ({ children }) => <h1 className="text-2xl font-bold mb-3 mt-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-bold mb-2 mt-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 mt-2">{children}</h3>,
          h4: ({ children }) => <h4 className="text-base font-semibold mb-1 mt-2">{children}</h4>,
          
          // Customize paragraph spacing
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          
          // Customize list styles
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="ml-2">{children}</li>,
          
          // Customize code styles
          code: ({ children, className, ...props }) => {
            const isInline = !className || !className.includes('language-');
            if (isInline) {
              return (
                <code className="bg-gray-100 text-gray-900 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          
          // Customize pre blocks (code blocks)
          pre: ({ children }) => (
            <pre className="bg-gray-900 text-gray-100 p-3 rounded-md overflow-x-auto mb-3 mt-2">
              {children}
            </pre>
          ),
          
          // Customize blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2 text-gray-700">
              {children}
            </blockquote>
          ),
          
          // Customize tables
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full border-collapse border border-gray-300">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-3 py-2">
              {children}
            </td>
          ),
          
          // Customize links
          a: ({ children, href }) => (
            <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          
          // Task lists
          input: ({ checked, ...props }) => (
            <input
              type="checkbox"
              checked={checked}
              readOnly
              className="mr-2"
              {...props}
            />
          ),
          
          // Horizontal rules
          hr: () => <hr className="border-gray-300 my-4" />,
          
          // Strong and emphasis
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownMessage;
