import React from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { diffLines } from 'diff';

const DiffView = ({ original = '', generated = '', onAccept, onReject, fileName }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedContent, setEditedContent] = React.useState(generated);

  React.useEffect(() => {
    setEditedContent(generated);
  }, [generated]);

  const rows = React.useMemo(() => {
    const diff = diffLines(original, generated);
    let leftLine = 1;
    let rightLine = 1;
    const mapped = [];

    diff.forEach((part) => {
      const value = part.value ?? '';
      const lines = value.split('\n');
      if (lines[lines.length - 1] === '') {
        lines.pop();
      }
      if (lines.length === 0) {
        lines.push('');
      }

      lines.forEach((line) => {
        if (part.added) {
          mapped.push({
            leftNumber: '',
            rightNumber: rightLine++,
            leftText: '',
            rightText: line,
            type: 'added',
          });
        } else if (part.removed) {
          mapped.push({
            leftNumber: leftLine++,
            rightNumber: '',
            leftText: line,
            rightText: '',
            type: 'removed',
          });
        } else {
          mapped.push({
            leftNumber: leftLine++,
            rightNumber: rightLine++,
            leftText: line,
            rightText: line,
            type: 'unchanged',
          });
        }
      });
    });

    return mapped;
  }, [original, generated]);

  const handleAccept = () => onAccept?.(editedContent);
  const handleReject = () => onReject?.();

  const typeStyles = {
    added: 'bg-[#1e3a1e] text-[#cfeecf]',
    removed: 'bg-[#3a1e1e] text-[#f5bebe]',
    unchanged: 'bg-transparent text-[#d4d4d4]',
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#d4d4d4]">
      <div className="px-4 py-3 border-b border-[#3e3e42] flex items-center justify-between bg-[#1f1f1f] shadow">
        <div>
          <h3 className="text-sm font-semibold tracking-wide uppercase">Review Changes</h3>
          <p className="text-xs text-[#9f9f9f]">
            {fileName ? `${fileName}` : 'Generated draft vs current file'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing((prev) => !prev)}
            className="px-3 py-1.5 text-xs border border-[#3e3e42] rounded bg-[#252526] hover:border-[#007acc] flex items-center gap-2 transition"
          >
            <Edit2 className="w-3 h-3" />
            {isEditing ? 'Back to Diff' : 'Edit Draft'}
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-1.5 text-xs border border-[#f14c4c] text-[#f48771] rounded bg-[#3a1e1e] hover:bg-[#4b2323] transition flex items-center gap-2"
          >
            <X className="w-3 h-3" />
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-1.5 text-xs border border-[#1e4f2b] text-[#b7f1c6] rounded bg-[#1e3a1e] hover:bg-[#27502a] transition flex items-center gap-2"
          >
            <Check className="w-3 h-3" />
            Accept
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-full bg-[#1e1e1e] border-none outline-none p-4 text-sm font-mono text-[#d4d4d4]"
          />
        ) : (
          <div className="h-full grid grid-cols-2 gap-4 p-4 overflow-hidden">
            <div className="flex flex-col border border-[#3e3e42] rounded bg-[#1f1f1f] overflow-hidden shadow-inner">
              <div className="px-3 py-2 border-b border-[#3e3e42] text-xs uppercase tracking-wide text-[#9f9f9f] bg-[#252526]">
                Original
              </div>
              <div className="flex-1 overflow-auto">
                {rows.map((row, idx) => (
                  <div
                    key={`left-${idx}`}
                    className="grid grid-cols-[70px_1fr] text-xs font-mono border-b border-[#2a2a2a] last:border-b-0"
                  >
                    <div className="px-2 py-1 text-right text-[#858585] bg-[#1a1a1a] border-r border-[#2a2a2a]">
                      {row.leftNumber || ''}
                    </div>
                    <pre
                      className={`px-3 py-1 whitespace-pre-wrap ${
                        row.type === 'removed' ? typeStyles.removed : typeStyles.unchanged
                      }`}
                    >
                      {row.leftText || ''}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col border border-[#3e3e42] rounded bg-[#1f1f1f] overflow-hidden shadow-inner">
              <div className="px-3 py-2 border-b border-[#3e3e42] text-xs uppercase tracking-wide text-[#9f9f9f] bg-[#252526]">
                Generated
              </div>
              <div className="flex-1 overflow-auto">
                {rows.map((row, idx) => (
                  <div
                    key={`right-${idx}`}
                    className="grid grid-cols-[70px_1fr] text-xs font-mono border-b border-[#2a2a2a] last:border-b-0"
                  >
                    <div className="px-2 py-1 text-right text-[#858585] bg-[#1a1a1a] border-r border-[#2a2a2a]">
                      {row.rightNumber || ''}
                    </div>
                    <pre
                      className={`px-3 py-1 whitespace-pre-wrap ${
                        row.type === 'added' ? typeStyles.added : typeStyles.unchanged
                      }`}
                    >
                      {row.rightText || ''}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiffView;

