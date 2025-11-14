import React, { useState } from 'react';
import { Send, Loader2, Sparkles, X } from 'lucide-react';
import geminiApi from '../services/geminiApi';

const AISidebar = ({ isOpen, onClose, onGenerate, context }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const examplePrompts = [
    "RAG module, intermediate, 5 days",
    "Introduction to Transformers, beginner, 3 days",
    "Fine-tuning LLMs, advanced, 7 days",
    "Vector Databases, intermediate, 4 days"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError('');

    try {
      const curriculumContext = context?.curriculum || '';
      const pedagogyContext = context?.pedagogy || '';

      const generatedContent = await geminiApi.generateCurriculum(prompt, {
        curriculum: curriculumContext,
        pedagogy: pedagogyContext
      });

      if (onGenerate) {
        onGenerate(generatedContent, prompt);
      }
      
      setPrompt('');
    } catch (err) {
      setError(err.message || 'Failed to generate curriculum');
      console.error('Generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl z-50 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <h2 className="font-semibold">AI Copilot</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Describe your module
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., RAG module, intermediate, 5 days"
            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
            disabled={isGenerating}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Example prompts:</p>
          <div className="space-y-2">
            {examplePrompts.map((example, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(example)}
                className="w-full text-left px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded border border-gray-200 dark:border-gray-700 transition"
                disabled={isGenerating}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {isGenerating && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Generating your curriculum...</span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Generate
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default AISidebar;

