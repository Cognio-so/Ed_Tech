'use client'
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Experience } from "@/components/Experience";
import { RealtimeOpenAIService } from "@/lib/voiceService.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Play, Square, Volume2, Settings, Wifi, WifiOff, Send, User, Bot } from "lucide-react";

function VoiceCoaching() {
  const [lipSyncData, setLipSyncData] = useState({ A: 0, E: 0, I: 0, O: 0, U: 0 });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  
  const openAIServiceRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!apiKey) {
      setError('❌ OpenAI API key required. Please set NEXT_PUBLIC_OPENAI_API_KEY in your environment variables.');
    }

    return () => {
      if (openAIServiceRef.current) {
        openAIServiceRef.current.disconnect();
      }
    };
  }, [apiKey]);

  const handleStart = async () => {
    if (!apiKey) {
      setError('❌ OpenAI API key required');
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      openAIServiceRef.current = new RealtimeOpenAIService(apiKey);
      
      // Set up callbacks
      openAIServiceRef.current.onLipSyncData = (data) => {
        setLipSyncData(data);
      };

      openAIServiceRef.current.onTranscript = (delta) => {
        setTranscript(prev => prev + delta);
      };

      // Connect to OpenAI
      await openAIServiceRef.current.connect();
      setIsConnected(true);
      setMessages([{ type: 'system', content: '✅ Successfully connected to OpenAI Realtime API' }]);
      
    } catch (error) {
      console.error('Connection failed:', error);
      setError(`Failed to connect: ${error.message}`);
      setMessages([{ type: 'error', content: `❌ Connection failed: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSpeak = async () => {
    if (!openAIServiceRef.current || !isConnected) return;
    
    setTranscript('');
    setIsRecording(true);
    setMessages(prev => [...prev, { type: 'user', content: '🎙️ Starting AI speech test...' }]);
    
    try {
      await openAIServiceRef.current.sendTestMessage();
    } catch (error) {
      setError(`Speech test failed: ${error.message}`);
    } finally {
      setIsRecording(false);
    }
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !isConnected) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { 
      type: 'user', 
      content: inputMessage,
      timestamp: new Date().toISOString()
    }]);
    
    // Clear input
    setInputMessage('');
    
    // TODO: Send message to AI service
    // This would integrate with your voice service
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDisconnect = () => {
    if (openAIServiceRef.current) {
      openAIServiceRef.current.disconnect();
      setIsConnected(false);
      setIsRecording(false);
      setTranscript('');
      setLipSyncData({ A: 0, E: 0, I: 0, O: 0, U: 0 });
      setMessages(prev => [...prev, { type: 'system', content: '🔌 Disconnected from OpenAI' }]);
    }
  };

  useEffect(() => {
    if (transcript) {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        
        if (lastMessage && lastMessage.type === 'ai' && lastMessage.isLive) {
          // Update existing live message
          newMessages[newMessages.length - 1] = { ...lastMessage, content: transcript };
        } else {
          // Add new live message
          newMessages.push({ type: 'ai', content: transcript, isLive: true });
        }
        
        return newMessages;
      });
    }
  }, [transcript]);

  const getConnectionStatus = () => {
    if (isLoading) return { text: 'Connecting...', color: 'bg-yellow-500', icon: <Settings className="w-4 h-4 animate-spin" /> };
    if (isConnected) return { text: 'Connected', color: 'bg-green-500', icon: <Wifi className="w-4 h-4" /> };
    return { text: 'Disconnected', color: 'bg-red-500', icon: <WifiOff className="w-4 h-4" /> };
  };

  const status = getConnectionStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="flex h-screen">
        {/* Left Side - 3D Model */}
        <div className="flex-1 relative bg-white rounded-l-2xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0">
            <Canvas shadows camera={{ position: [0, 0, 8], fov: 42 }}>
              <color attach="background" args={["#f8fafc"]} />
              <Experience lipSyncData={lipSyncData} isConnected={isConnected} />
            </Canvas>
          </div>

          {/* Lip Sync Visualization */}
          {/* <div className="absolute bottom-6 left-6 z-10">
            <Card className="bg-black/80 backdrop-blur-md border-0 text-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  🎭 Lip Sync Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-5 gap-3 text-xs">
                  <div className="text-center">
                    <div className="font-bold">A</div>
                    <div className="text-green-400">{lipSyncData.A.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">E</div>
                    <div className="text-blue-400">{lipSyncData.E.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">I</div>
                    <div className="text-purple-400">{lipSyncData.I.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">O</div>
                    <div className="text-orange-400">{lipSyncData.O.toFixed(2)}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold">U</div>
                    <div className="text-red-400">{lipSyncData.U.toFixed(2)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}
        </div>

        {/* Right Side - Chat Interface */}
        <div className="w-96 bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              AI Voice Coach
            </h2>
            <p className="text-sm opacity-90">
              Real-time voice interaction with AI-powered coaching
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {error && (
              <p className="text-red-500">{error}</p>
            )}

            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm flex items-start gap-2 ${
                      message.type === 'ai' 
                        ? 'bg-white border border-gray-200 text-gray-800' 
                        : message.type === 'user' 
                        ? 'bg-indigo-600 text-white' 
                        : message.type === 'system' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    {message.type === 'ai' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {message.type === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      {message.content}
                      {message.isLive && (
                        <div className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Text Input Area */}
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex gap-2 mb-3">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={!isConnected}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!isConnected || !inputMessage.trim()}
                size="sm"
                className="px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Voice Controls */}
            <div className="space-y-3">
              {!isConnected && !isLoading && (
                <Button 
                  onClick={handleStart}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  disabled={!apiKey}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Voice Session
                </Button>
              )}
              
              {isConnected && (
                <Button
                  onClick={handleTestSpeak}
                  disabled={isRecording}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  {isRecording ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Recording...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Test Speech
                    </>
                  )}
                </Button>
              )}
              
              {(isConnected || isLoading) && (
                <Button
                  onClick={handleDisconnect}
                  variant="destructive"
                  className="w-full"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Stop Session
                </Button>
              )}
            </div>
            
            <div className="mt-3 text-xs text-gray-500 text-center">
              💡 Ensure microphone permissions are enabled for voice interaction
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VoiceCoaching;
