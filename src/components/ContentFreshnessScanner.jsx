import React, { useState } from 'react';
import { Search, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import geminiApi from '../services/geminiApi';

const ContentFreshnessScanner = ({ content, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const sources = [
    'https://arxiv.org/list/cs.AI/recent',
    'https://openai.com/blog',
    'https://www.anthropic.com/news',
    'https://huggingface.co/blog'
  ];

  const handleScan = async () => {
    if (!content || content.trim().length === 0) {
      setError('No content to scan. Please load a file first.');
      return;
    }

    setIsScanning(true);
    setError('');
    setResults(null);

    try {
      const scanResults = await geminiApi.checkContentFreshness(content, sources);
      setResults(scanResults);
    } catch (err) {
      setError(err.message || 'Failed to scan content freshness');
      console.error('Scan error:', err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Search className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Content Freshness Scanner</h2>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              ×
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Monitored Sources</h3>
            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              {sources.map((source, idx) => (
                <li key={idx}>• {source}</li>
              ))}
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {isScanning && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Scanning content for freshness...</p>
              </div>
            </div>
          )}

          {results && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">Scan Results</h3>
              </div>
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                {results}
              </div>
            </div>
          )}

          {!isScanning && !results && !error && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ready to scan. Click the button below to check content freshness.</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Close
            </button>
          )}
          <button
            onClick={handleScan}
            disabled={isScanning || !content}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Scan Content
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContentFreshnessScanner;

