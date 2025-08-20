import React, { useRef, useEffect, useState } from 'react';
import { Copy, User, Bot } from 'lucide-react';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const onScroll = () => {
      const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
      setAutoScroll(distanceFromBottom < 80);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (autoScroll) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, autoScroll]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto p-3 space-y-3 bg-[#0D0D0D]">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 rounded-lg bg-[#2B0F45] border border-[#9A4DFF] flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-[#9A4DFF]" />
            </div>
          )}
          
          <div
            className={`max-w-[80%] rounded-lg p-3 group relative ${
              message.role === 'user'
                ? 'bg-[#1A1A1A] text-white rounded-br-none border border-[#2E2E2E]'
                : 'bg-[#1A1A1A] text-[#FFFFFF] rounded-bl-none border border-[#2E2E2E]'
            }`}
          >
            {message.type === 'image' && message.metadata?.imageUrl && (
              <div className="mb-2">
                <img 
                  src={message.metadata.imageUrl} 
                  alt="Generated image"
                  className="rounded-lg max-w-full h-auto border border-[#2E2E2E]"
                />
              </div>
            )}
            
            <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </div>
            
            {message.role === 'assistant' && (
              <button
                onClick={() => copyToClipboard(message.content)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-[#1A1A1A] border border-[#2E2E2E] hover:bg-[#2B0F45]"
                title="Copy message"
              >
                <Copy size={12} className="text-[#B3B3B3]" />
              </button>
            )}
            
            <div className="text-xs text-[#B3B3B3] mt-2">
              {message.timestamp.toLocaleTimeString()}
              {message.metadata?.model && (
                <span className="ml-2">• {message.metadata.model}</span>
              )}
            </div>
          </div>
          
          {message.role === 'user' && (
            <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#2E2E2E] flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-[#B3B3B3]" />
            </div>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="flex gap-3 justify-start">
          <div className="w-8 h-8 rounded-lg bg-[#2B0F45] border border-[#9A4DFF] flex items-center justify-center flex-shrink-0">
            <Bot size={16} className="text-[#9A4DFF]" />
          </div>
          <div className="bg-[#1A1A1A] rounded-lg rounded-bl-none p-3 border border-[#2E2E2E]">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-[#9A4DFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[#9A4DFF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[#9A4DFF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
}