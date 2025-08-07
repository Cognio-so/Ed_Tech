"use client";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';


export const MarkdownStyles = {
    h1: ({ node, ...props }) => <h1 className="text-xl font-bold my-3" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-lg font-bold my-2" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-md font-bold my-2" {...props} />,
    h4: ({ node, ...props }) => <h4 className="font-bold my-2" {...props} />,
    p: ({ node, ...props }) => <p className="my-2" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
    li: ({ node, ...props }) => <li className="my-1" {...props} />,
    a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" {...props} />,
    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-500 dark:border-gray-400 pl-4 my-3 italic" {...props} />,
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={atomDark}
          language={match[1]}
          PreTag="div"
          className="rounded-md my-3"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={`${inline ? 'bg-gray-300 dark:bg-gray-600 px-1 py-0.5 rounded text-sm' : ''} ${className}`} {...props}>
          {children}
        </code>
      );
    },
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full border border-gray-400 dark:border-gray-500" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => <thead className="bg-gray-300 dark:bg-gray-600" {...props} />,
    tbody: ({ node, ...props }) => <tbody className="divide-y divide-gray-400 dark:divide-gray-500" {...props} />,
    tr: ({ node, ...props }) => <tr className="hover:bg-gray-300 dark:hover:bg-gray-600" {...props} />,
    th: ({ node, ...props }) => <th className="px-4 py-2 text-left font-medium" {...props} />,
    td: ({ node, ...props }) => <td className="px-4 py-2" {...props} />,
  };