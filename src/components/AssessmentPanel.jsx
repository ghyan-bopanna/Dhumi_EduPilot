import React, { useState } from 'react';
import { FileText, Code, Users, Plus, Loader2 } from 'lucide-react';
import geminiApi from '../services/geminiApi';

const AssessmentPanel = ({ lessonContent, onClose }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatedAssessment, setGeneratedAssessment] = useState(null);
  const [error, setError] = useState('');

  const assessmentTypes = [
    {
      id: 'project',
      name: 'Project-based Rubric',
      icon: FileText,
      description: 'Auto-score projects with human-in-the-loop review'
    },
    {
      id: 'code',
      name: 'Auto-graded Code Notebook',
      icon: Code,
      description: 'Run automated tests and analyze code quality'
    },
    {
      id: 'peer',
      name: 'Peer Review',
      icon: Users,
      description: 'Match peers and surface rubric reminders'
    }
  ];

  const handleGenerate = async (type) => {
    if (!lessonContent || lessonContent.trim().length === 0) {
      setError('No lesson content available. Please load a lesson first.');
      return;
    }

    setSelectedType(type);
    setGenerating(true);
    setError('');
    setGeneratedAssessment(null);

    try {
      const assessment = await geminiApi.generateAssessment(lessonContent, type);
      setGeneratedAssessment(assessment);
    } catch (err) {
      setError(err.message || 'Failed to generate assessment');
      console.error('Assessment generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Generate Assessment</h2>
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
          {!generatedAssessment && !generating && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Select an assessment type to generate:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {assessmentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.id}
                      onClick={() => handleGenerate(type.id)}
                      disabled={generating}
                      className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-left disabled:opacity-50"
                    >
                      <Icon className="w-8 h-8 text-blue-500 mb-3" />
                      <h3 className="font-semibold mb-2">{type.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {type.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {generating && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Generating {selectedType} assessment...
                </p>
              </div>
            </div>
          )}

          {generatedAssessment && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Generated Assessment</h3>
                <button
                  onClick={() => {
                    setGeneratedAssessment(null);
                    setSelectedType(null);
                  }}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  Generate Another
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                  {generatedAssessment}
                </div>
              </div>
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
        </div>
      </div>
    </div>
  );
};

export default AssessmentPanel;

