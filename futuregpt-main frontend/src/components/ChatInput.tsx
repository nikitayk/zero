import React, { useState, useRef } from 'react';
import { Send, Upload, Image, ChevronDown, Globe, Search, Zap, RefreshCw } from 'lucide-react';
import type { AppMode, Context, UploadedFile, ImageAnalysis, DocumentAnalysis } from '../types';

interface ChatInputProps {
  mode: AppMode;
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  onGenerateImage: () => void;
  onWebSearch?: (query: string) => void;
  onFunctionCall?: (functionName: string, args: any) => void;
  onFileUpload?: (file: UploadedFile) => Promise<void>;
  onFileAnalysis?: (file: UploadedFile) => Promise<ImageAnalysis | DocumentAnalysis>;
  isLoading: boolean;
  hasApiKey: boolean;
  model: string;
  onModelChange: (model: string) => void;
  webAccess: boolean;
  onWebAccessToggle: () => void;
  context?: Context;
}

const models = [
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', fast: true },
  { id: 'gpt-4', name: 'GPT-4', fast: false },
  { id: 'gpt-4-vision-preview', name: 'GPT-4 Vision', fast: false },
];

export function ChatInput({
  mode,
  input,
  setInput,
  onSend,
  onGenerateImage,
  onWebSearch,
  onFunctionCall,
  onFileUpload,
  onFileAnalysis,
  isLoading,
  hasApiKey,
  model,
  onModelChange,
  webAccess,
  onWebAccessToggle,
  context,
}: ChatInputProps) {
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showContext, setShowContext] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (files: FileList) => {
    if (!onFileUpload || !onFileAnalysis) {
      console.log('File upload handlers not available');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log('Processing file:', file.name, file.type, file.size);
      
      try {
        const uploadedFile: UploadedFile = {
          id: Date.now().toString() + i,
          name: file.name,
          type: file.type,
          size: file.size,
          content: await file.arrayBuffer()
        };

        console.log('Uploading file:', uploadedFile.name);
        await onFileUpload(uploadedFile);
        
        console.log('Analyzing file:', uploadedFile.name);
        const analysis = await onFileAnalysis(uploadedFile);
        
        // Add the file analysis to the chat
        const analysisMessage = `📁 **File Uploaded:** ${file.name}\n\n`;
        let content = analysisMessage;
        
        if ('description' in analysis) {
          // Image analysis
          content += `**Image Analysis:**\n${analysis.description}\n\n`;
          if (analysis.problemStatement) {
            content += `**Problem Detected:** ${analysis.problemStatement}\n\n`;
          }
        } else {
          // Document analysis
          content += `**Document Analysis:**\n${analysis.extractedText.substring(0, 200)}...\n\n`;
          if (analysis.problemStatement) {
            content += `**Problem Detected:** ${analysis.problemStatement}\n\n`;
          }
        }
        
        // You can add this to messages or handle it as needed
        console.log('File analysis completed:', analysis);
        
      } catch (error) {
        console.error('Error processing file:', error);
        alert(`Error processing file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && hasApiKey && !isLoading) {
        onSend();
      }
    }
  };

  const handleWebSearch = () => {
    if (input.trim() && onWebSearch && !isLoading) {
      onWebSearch(input.trim());
      setInput('');
    }
  };

  const handleFunctionCall = () => {
    if (input.trim() && onFunctionCall && !isLoading) {
      // Simple function call parsing - in a real app, you'd have more sophisticated parsing
      const match = input.match(/^(\w+)\((.*)\)$/);
      if (match) {
        const functionName = match[1];
        const args = match[2] ? JSON.parse(match[2]) : {};
        onFunctionCall(functionName, args);
      } else {
        // Default function call
        onFunctionCall('demo_function', { query: input.trim() });
      }
      setInput('');
    }
  };

  const canSend = input.trim() && !isLoading; // Allow sending without API key
  const hasContext = context?.webpageContent || context?.selectedText;
  const contextLength = (context?.webpageContent?.length || 0) + (context?.selectedText?.length || 0);

  return (
    <div className="border-t border-[#2E2E2E] p-3 bg-[#0D0D0D] sticky bottom-0">
      {/* Context Display */}
      {hasContext && (
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => setShowContext(!showContext)}
              className="text-xs text-[#B3B3B3] hover:text-[#9A4DFF] transition-colors flex items-center gap-1"
            >
              <RefreshCw size={12} className="text-[#9A4DFF]" />
              {showContext ? 'Hide' : 'Show'} Context 
              ({context.webpageContent ? 'Page' : ''}{context.webpageContent && context.selectedText ? ' + ' : ''}{context.selectedText ? 'Selection' : ''})
            </button>
            <span className="text-xs text-[#B3B3B3]">
              ({contextLength} chars)
            </span>
          </div>
          {showContext && (
            <div className="mt-2 p-2 bg-[#1A1A1A] border border-[#2E2E2E] rounded text-xs text-[#B3B3B3] max-h-20 overflow-y-auto">
              {context.selectedText && (
                <div className="mb-1">
                  <strong>Selected:</strong> {context.selectedText.substring(0, 100)}...
                </div>
              )}
              {context.webpageContent && (
                <div>
                  <strong>Page:</strong> {context.webpageContent.substring(0, 150)}...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Model Selection */}
      <div className="flex items-center justify-between mb-3">
        <div className="relative">
          <button
            onClick={() => setShowModelSelect(!showModelSelect)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg text-sm text-[#B3B3B3] hover:bg-[#2B0F45] hover:text-[#FFFFFF] hover:border-[#9A4DFF] transition-colors"
          >
            <span>{models.find(m => m.id === model)?.name}</span>
            <ChevronDown size={14} />
          </button>
          
          {showModelSelect && (
            <div className="absolute bottom-full mb-2 left-0 bg-[#1A1A1A] border border-[#2E2E2E] rounded-lg shadow-xl z-10 min-w-48">
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    onModelChange(m.id);
                    setShowModelSelect(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-[#2B0F45] first:rounded-t-lg last:rounded-b-lg transition-colors ${
                    model === m.id ? 'text-[#9A4DFF] bg-[#2B0F45]' : 'text-[#B3B3B3]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{m.name}</span>
                    {m.fast && (
                      <span className="text-xs text-[#9A4DFF] bg-[#2B0F45] px-1.5 py-0.5 rounded">
                        Fast
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Web Access Toggle */}
        <div className="flex items-center gap-2">
          <Globe size={14} className="text-[#B3B3B3]" />
          <button
            onClick={onWebAccessToggle}
            className={`px-2 py-1 text-xs rounded border transition-colors ${
              webAccess
                ? 'bg-[#2B0F45] border-[#9A4DFF] text-[#9A4DFF]'
                : 'bg-[#1A1A1A] border-[#2E2E2E] text-[#B3B3B3] hover:border-[#9A4DFF] hover:bg-[#2B0F45]'
            }`}
          >
            {webAccess ? 'On' : 'Off'}
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div
        className={`relative rounded-lg border transition-colors ${
          dragOver
            ? 'border-[#9A4DFF] bg-[#2B0F45]'
            : 'border-[#2E2E2E] bg-[#1A1A1A]'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragOver(true)}
        onDragLeave={() => setDragOver(false)}
      >
        <div className="flex items-end gap-2 p-3">
          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-[#B3B3B3] hover:text-[#FFFFFF] hover:bg-[#2B0F45] rounded-lg transition-colors"
            title="Upload file"
          >
            <Upload size={16} />
          </button>

          {/* Text Input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Ask anything... (${mode} mode)`}
            className="flex-1 bg-transparent text-white placeholder-[#B3B3B3] resize-none max-h-32 min-h-[24px] focus:outline-none"
            rows={1}
            style={{
              height: 'auto',
              minHeight: '24px',
              maxHeight: '128px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />

          {/* Action Buttons */}
          <div className="flex gap-1">
            {/* Web Search Button */}
            {webAccess && (
              <button
                onClick={handleWebSearch}
                disabled={!canSend}
                className="p-2 text-[#B3B3B3] hover:text-[#9A4DFF] hover:bg-[#2B0F45] rounded-lg transition-colors disabled:opacity-50 disabled:hover:text-[#B3B3B3] disabled:hover:bg-transparent"
                title="Web search"
              >
                <Search size={16} />
              </button>
            )}

            {/* Function Call Button */}
            <button
              onClick={handleFunctionCall}
              disabled={!canSend}
              className="p-2 text-[#B3B3B3] hover:text-[#9A4DFF] hover:bg-[#2B0F45] rounded-lg transition-colors disabled:opacity-50 disabled:hover:text-[#B3B3B3] disabled:hover:bg-transparent"
              title="Function call"
            >
              <Zap size={16} />
            </button>

            {mode === 'chat' && (
              <button
                onClick={onGenerateImage}
                disabled={!canSend}
                className="p-2 text-[#B3B3B3] hover:text-[#FFFFFF] hover:bg-[#2B0F45] rounded-lg transition-colors disabled:opacity-50 disabled:hover:text-[#B3B3B3] disabled:hover:bg-transparent"
                title="Generate image"
              >
                <Image size={16} />
              </button>
            )}
            
            <button
              onClick={onSend}
              disabled={!canSend}
              className="p-2 text-[#B3B3B3] hover:text-[#FFFFFF] hover:bg-[#2B0F45] rounded-lg transition-colors disabled:opacity-50 disabled:hover:text-[#B3B3B3] disabled:hover:bg-transparent"
              title="Send message"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-[#9A4DFF] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>

        {/* Drag overlay */}
        {dragOver && (
          <div className="absolute inset-0 bg-[#2B0F45] border-2 border-dashed border-[#9A4DFF] rounded-lg flex items-center justify-center">
            <p className="text-[#9A4DFF] text-sm">Drop files here to upload</p>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
      />
    </div>
  );
}