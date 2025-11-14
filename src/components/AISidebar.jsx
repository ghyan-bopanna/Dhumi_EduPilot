import React, { useState } from 'react';
import { Send, Loader2, Sparkles, PanelRightClose, PanelRightOpen } from 'lucide-react';
import geminiApi from '../services/geminiApi';

const AISidebar = ({ collapsed, onToggle, onGenerate, context }) => {
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

  return (
    <div
      className={`h-full border-l border-[#3e3e42] bg-[#1f1f1f] text-[#d4d4d4] transition-all duration-300 ease-in-out shadow-xl flex flex-col ${
        collapsed ? 'w-12' : 'w-[350px]'
      }`}
    >
      {collapsed ? (
        <div className="flex-1 flex flex-col items-center justify-between py-4">
          <button
            onClick={onToggle}
            className="p-2 rounded border border-transparent hover:border-[#007acc] hover:bg-[#252526] transition"
            title="Expand AI Copilot"
          >
            <PanelRightOpen className="w-5 h-5 text-[#d4d4d4]" />
          </button>
          <div className="text-[10px] uppercase tracking-[0.3em] rotate-90 text-[#a0a0a0]">AI Copilot</div>
        </div>
      ) : (
        <>
          <div className="px-4 py-3 border-b border-[#3e3e42] flex items-center justify-between shadow">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#007acc]" />
              <div>
                <h2 className="font-semibold text-sm">AI Copilot</h2>
                <p className="text-xs text-[#9f9f9f]">Generate curriculum instantly</p>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="p-1 rounded hover:bg-[#252526]"
              title="Collapse sidebar"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            <div className="space-y-2">
              <label className="block text-xs tracking-wide text-[#9f9f9f] uppercase">
                Describe your module
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="RAG module, intermediate, 5 days"
                className="w-full h-32 p-3 bg-[#1e1e1e] border border-[#3e3e42] rounded focus:outline-none focus:ring-2 focus:ring-[#007acc] resize-none text-sm"
                disabled={isGenerating}
              />
            </div>

            {error && (
              <div className="p-3 bg-[#3a1e1e] border border-[#f14c4c] rounded text-sm text-[#f48771]">
                {error}
              </div>
            )}

            <div>
              <p className="text-xs text-[#9f9f9f] uppercase tracking-wide mb-2">Example prompts</p>
              <div className="space-y-2">
                {examplePrompts.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(example)}
                    className="w-full text-left px-3 py-2 text-sm bg-[#252526] border border-[#3e3e42] hover:border-[#007acc] rounded transition"
                    disabled={isGenerating}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-[#9f9f9f]">
                <Loader2 className="w-4 h-4 animate-spin text-[#007acc]" />
                <span>Generating your curriculum...</span>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-[#3e3e42] bg-[#1e1e1e]">
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#007acc] hover:bg-[#1392d4] disabled:bg-[#555] disabled:cursor-not-allowed text-white rounded transition font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Generate Curriculum
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AISidebar;

