import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Copy, CopyCheck, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { MarkdownStyles } from "@/components/chat/Markdown";

const InputMessages = ({
  messages,
  isSending,
  streamingMessage,
}) => {
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const handleCopy = (content, id) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const gptData = {
      name: "AI Assistant",
      avatar: "/ai-avatar.png", // Example path
      welcomeMessage: "Start a conversation by typing a message below.",
      initialPrompts: ["What can you do?", "Explain something"],
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto px-2 sm:px-3 md:px-4 py-3 sm:py-4 space-y-4 sm:space-y-5 md:space-y-6 hide-scrollbar">
        {messages.length === 0 && !isSending && !streamingMessage && (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="text-center max-w-md px-2">
              <Avatar className="w-16 h-16 mx-auto mb-4">
                <AvatarImage src={gptData.avatar} alt={gptData.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl font-bold">
                  {gptData.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
                Chat with {gptData.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {gptData.welcomeMessage}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {gptData.initialPrompts.map((prompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => { /* Functionality to be implemented in parent */ }}
                    className="text-sm h-8"
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

<div className="text-center text-5xl text-gray-800 dark:text-white">Coming soon with AI-voice assistant</div>
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'user' ? (
                <div className="max-w-[80%] flex flex-col items-end">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={""} alt={"User"} />
                      <AvatarFallback className="bg-purple-500 text-white text-sm">
                        U
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="bg-neutral-700 text-white rounded-2xl px-4 py-3 w-full">
                    <div className="whitespace-pre-wrap break-words leading-relaxed text-sm">
                      {message.content}
                    </div>
                    {message.files && message.files.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.files.map((file, index) => (
                          <div 
                            key={index}
                            className="flex items-center text-xs bg-neutral-600 rounded px-2 py-1"
                          >
                            <FileText size={14} className="mr-2 shrink-0" />
                            <span className="truncate">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={gptData.avatar} alt={gptData.name} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                        {gptData.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {gptData.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="ml-11 relative group">
                    <div className="markdown-content text-black dark:text-white text-sm">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={MarkdownStyles}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 h-6 w-6 p-0 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleCopy(message.content, message.id)}
                      title="Copy message"
                    >
                      {copiedMessageId === message.id ? 
                        <CopyCheck className="h-3 w-3 text-gray-700 dark:text-gray-300" /> : 
                        <Copy className="h-3 w-3 text-gray-700 dark:text-gray-300" />
                      }
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {streamingMessage && (
            <div className="flex justify-start">
              <div className="w-full">
                <div className="flex items-start gap-3 mb-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={gptData.avatar} alt={gptData.name} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                      {gptData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {gptData.name}
                    </span>
                  </div>
                </div>
                <div className="ml-11">
                  <div className="markdown-content text-black dark:text-white text-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={MarkdownStyles}
                    >
                      {streamingMessage}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}

          {isSending && !streamingMessage && (
            <div className="flex justify-start">
              <div className="w-full">
                <div className="flex items-start gap-3 mb-2">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={gptData.avatar} alt={gptData.name} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm">
                       {gptData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {gptData.name}
                  </span>
                </div>
                <div className="ml-11">
                  <div className="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InputMessages;