"use client";

import React, { useRef, useEffect } from 'react';
import { HiMiniPaperClip } from 'react-icons/hi2';
import { BsGlobe2 } from 'react-icons/bs';
import { IoSendSharp } from 'react-icons/io5';
import { X, FileText, Loader2, AudioLines } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Button } from '../ui/button';

const ChatMessage = ({ 
  inputMessage,
  setInputMessage,
  onSendMessage,
  onFileChange,
  isSending,
  files,
  removeFile,
  isUploading,
  uploadProgress,
  webSearchEnabled,
  setWebSearchEnabled
}) => {
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [inputMessage]);

    return (
        <div className="w-full p-2 sm:p-3 lg:p-4 bg-white dark:bg-black">
            {isUploading && (
                <div className="mb-2 sm:mb-3 lg:mb-4">
                    <div className="flex items-center p-2 sm:p-2.5 lg:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
                        <div className="flex-shrink-0 mr-2 sm:mr-2.5 lg:mr-3">
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 animate-spin text-blue-500 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs sm:text-sm lg:text-base font-medium text-blue-700 dark:text-blue-300 mb-1 sm:mb-1.5 lg:mb-2">
                                Uploading...
                            </div>
                            <Progress 
                                value={uploadProgress} 
                                className="h-1 sm:h-1.5 lg:h-2 bg-blue-100 dark:bg-blue-800/40"
                            />
                            <div className="text-[10px] sm:text-xs lg:text-sm text-blue-600 dark:text-blue-400 mt-0.5 sm:mt-1">
                                {uploadProgress}% complete
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {files.length > 0 && (
                <div className="mb-2 sm:mb-3 lg:mb-4">
                    <div className="flex flex-wrap gap-1 sm:gap-1.5 lg:gap-2">
                        {files.map((file, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 py-1 sm:py-1.5 lg:py-2 px-1.5 sm:px-2 lg:px-3 bg-gray-50 dark:bg-gray-800/50 rounded-md lg:rounded-lg border border-gray-200 dark:border-gray-700/50 max-w-fit"
                            >
                                <div className="text-gray-500 dark:text-gray-400 flex-shrink-0">
                                    <FileText size={16} className="sm:text-sm lg:text-base" />
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] sm:text-xs lg:text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[80px] sm:max-w-[100px] lg:max-w-[140px]">
                                        {file.name}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeFile(file.name)}
                                    className="ml-0.5 sm:ml-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors flex-shrink-0"
                                    aria-label="Remove file"
                                >
                                    <X size={12} className="sm:h-3.5 sm:w-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <form onSubmit={onSendMessage}>
                <div className="bg-gray-100 dark:bg-[#1e1e1e] rounded-lg sm:rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 relative group">
                    <div className="flex flex-col px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3">
                        <textarea
                            ref={textareaRef}
                            className="w-full bg-transparent border-0 outline-none text-black dark:text-white resize-none overflow-hidden min-h-[36px] text-sm placeholder-gray-500 dark:placeholder-gray-400"
                            placeholder="Type your message here..."
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            rows={1}
                            disabled={isSending || isUploading}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    onSendMessage(e);
                                }
                            }}
                        />

                        <div className="flex justify-between items-center mt-1 sm:mt-1.5 lg:mt-2">
                            <div className="flex items-center gap-0.5 sm:gap-1">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={onFileChange}
                                    style={{ display: 'none' }}
                                    multiple
                                    disabled={isSending || isUploading}
                                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.bmp,.tiff"
                                />
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`text-gray-400 dark:text-gray-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors ${ (isSending || isUploading) ? 'cursor-not-allowed opacity-50' : ''}`}
                                    aria-label="Attach file"
                                    disabled={isSending || isUploading}
                                >
                                    <HiMiniPaperClip size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                                    className="text-gray-400 dark:text-gray-500 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
                                >
                                    <BsGlobe2 className={`text-base ${webSearchEnabled ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {}}
                                    className="bg-gray-900 dark:bg-gray-300 text-white dark:text-black rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-200/90 transition-colors cursor-pointer"
                                >
                                    <AudioLines size={18} />
                                </button>
                            <button
                                type="submit"
                                className={`rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200 ${(!inputMessage.trim() && files.length === 0) || isSending || isUploading
                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                } flex-shrink-0`}
                                disabled={(!inputMessage.trim() && files.length === 0) || isSending || isUploading}
                                aria-label="Send message"
                            >
                                {isSending ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                ) : (
                                    <IoSendSharp size={14} className="translate-x-px" />
                                )}
                            </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ChatMessage;