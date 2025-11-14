import React from 'react';
import { Check, X, Edit2 } from 'lucide-react';

const DiffView = ({ original, generated, onAccept, onReject, onEdit }) => {
  const [editedContent, setEditedContent] = React.useState(generated);
  const [isEditing, setIsEditing] = React.useState(false);

  React.useEffect(() => {
    setEditedContent(generated);
  }, [generated]);

  const handleAccept = () => {
    if (onAccept) {
      onAccept(editedContent);
    }
  };

  const handleReject = () => {
    if (onReject) {
      onReject();
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  // Simple diff viewer using text comparison
  const renderDiff = () => {
    const originalLines = original.split('\n');
    const generatedLines = generated.split('\n');
    const maxLines = Math.max(originalLines.length, generatedLines.length);

    return (
      <div className="space-y-2">
        {Array.from({ length: maxLines }).map((_, idx) => {
          const origLine = originalLines[idx] || '';
          const genLine = generatedLines[idx] || '';
          const isDifferent = origLine !== genLine;

          return (
            <div key={idx} className="flex gap-2">
              <div className={`flex-1 p-2 ${isDifferent && origLine ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <span className="text-xs text-gray-400">{idx + 1}</span>
                <pre className="text-sm mt-1">{origLine || <span className="text-gray-400">(empty)</span>}</pre>
              </div>
              <div className={`flex-1 p-2 ${isDifferent && genLine ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-800'}`}>
                <span className="text-xs text-gray-400">{idx + 1}</span>
                <pre className="text-sm mt-1">{genLine || <span className="text-gray-400">(empty)</span>}</pre>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold">Review Changes</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEdit}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            {isEditing ? 'View Diff' : 'Edit'}
          </button>
          <button
            onClick={handleReject}
            className="px-3 py-1.5 text-sm bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            Accept
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800"
          />
        ) : (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="grid grid-cols-2 gap-0">
              <div className="bg-gray-50 dark:bg-gray-800 p-2 border-r border-gray-200 dark:border-gray-700">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Original</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-2">
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400">Generated</div>
              </div>
            </div>
            <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
              {renderDiff()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffView;

