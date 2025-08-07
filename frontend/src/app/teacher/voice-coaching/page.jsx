"use client";

import { useState } from 'react';
import ChatMessage from "@/components/chat/ChatMessage";
import InputMessages from "@/components/chat/InputMessage";

export default function VoiceCoaching() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [streamingMessage, setStreamingMessage] = useState("");
    const [files, setFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [webSearchEnabled, setWebSearchEnabled] = useState(false);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() && files.length === 0) return;

        setIsSending(true);
        const userMessage = { 
            id: Date.now(), 
            role: 'user', 
            content: inputMessage, 
            files: files.map(f => ({ name: f.name, type: f.type })) 
        };
        
        setMessages(prev => [...prev, userMessage]);
        setInputMessage("");
        setFiles([]);

        // Simulate API call and streaming response
        setTimeout(() => {
            setStreamingMessage("This is a streamed response from the AI...");
            setTimeout(() => {
                const aiMessage = { 
                    id: Date.now() + 1, 
                    role: 'ai', 
                    content: "This is a streamed response from the AI. The full reply is now complete." 
                };
                setMessages(prev => [...prev, aiMessage]);
                setStreamingMessage("");
                setIsSending(false);
            }, 2000);
        }, 1000);
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
        
        // Simulate file upload
        setIsUploading(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setIsUploading(false);
            }
        }, 200);
    };

    const removeFile = (fileName) => {
        setFiles(files.filter(file => file.name !== fileName));
    };

    return (
        <div className="flex flex-col h-screen w-full bg-white dark:bg-black">
            
            {/* This container will grow and scroll */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <InputMessages
                messages={messages}
                isSending={isSending}
                streamingMessage={streamingMessage}
                className="max-w-4xl mx-auto w-full"
              />
            </div>
            
            {/* This container will stick to the bottom */}
            <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4">
              <ChatMessage
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                isSending={isSending}
                onSendMessage={handleSendMessage}
                onFileChange={handleFileChange}
                files={files}
                removeFile={removeFile}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                webSearchEnabled={webSearchEnabled}
                setWebSearchEnabled={setWebSearchEnabled}
                className="w-full"
              />
            </div>
        </div>
    );
}