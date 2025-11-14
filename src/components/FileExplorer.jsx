import React, { useState, useRef } from 'react';
import { File, Folder, FolderOpen, Plus, Trash2, RefreshCcw, Loader2 } from 'lucide-react';

const FileExplorer = ({
  files = [],
  onFileSelect,
  onFileDelete,
  selectedFile,
  onFileUpload,
  onRefreshFile,
  refreshingFile,
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['modules', 'assessments', 'resources']));
  const fileInputRef = useRef(null);

  const toggleFolder = (folder) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folder)) {
      newExpanded.delete(folder);
    } else {
      newExpanded.add(folder);
    }
    setExpandedFolders(newExpanded);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const fileList = event.target.files;
    if (fileList && fileList.length && onFileUpload) {
      onFileUpload(fileList);
    }
    event.target.value = '';
  };

  const renderFileTree = (items, parentKey = '') => {
    return items.map((item) => {
      const nodeKey = parentKey ? `${parentKey}/${item.name}` : item.name;
      const isSelected = selectedFile === item.path;

      if (item.type === 'folder') {
        const isExpanded = expandedFolders.has(nodeKey);
        return (
          <div key={nodeKey} className="select-none">
            <div
              className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-[#2d2d30] transition"
              onClick={() => toggleFolder(nodeKey)}
            >
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-[#c5c5c5]" />
              ) : (
                <Folder className="w-4 h-4 text-[#c5c5c5]" />
              )}
              <span className="text-sm font-medium text-[#d4d4d4]">{item.name}</span>
            </div>
            {isExpanded && item.children && item.children.length > 0 && (
              <div className="ml-4 border-l border-[#3e3e42] pl-2">
                {renderFileTree(item.children, nodeKey)}
              </div>
            )}
          </div>
        );
      }

      return (
        <div
          key={nodeKey}
          className={`flex items-center gap-2 px-2 py-1 cursor-pointer rounded group transition ${
            isSelected ? 'bg-[#094771] text-white' : 'hover:bg-[#2d2d30]'
          }`}
          onClick={() => onFileSelect?.(item.path)}
        >
          <File className="w-4 h-4 text-[#9cdcfe]" />
          <span className="text-sm flex-1 truncate">{item.name}</span>

          {item.badge === 'new' && (
            <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 border border-[#007acc] text-[#9cdcfe] rounded">
              New
            </span>
          )}

          {item.canRefresh && onRefreshFile && (
            <button
              className="p-1 rounded hover:bg-[#1f1f1f]"
              onClick={(e) => {
                e.stopPropagation();
                onRefreshFile(item.path);
              }}
              title="Refresh with AI"
            >
              {refreshingFile === item.path ? (
                <Loader2 className="w-3 h-3 animate-spin text-[#9cdcfe]" />
              ) : (
                <RefreshCcw className="w-3 h-3 text-[#9cdcfe]" />
              )}
            </button>
          )}

          {onFileDelete && (
            <button
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#1f1f1f]"
              onClick={(e) => {
                e.stopPropagation();
                onFileDelete(item.path);
              }}
              title="Delete file"
            >
              <Trash2 className="w-3 h-3 text-[#f14c4c]" />
            </button>
          )}
        </div>
      );
    });
  };

  return (
    <div className="h-full bg-[#252526] text-[#d4d4d4] border-r border-[#3e3e42] flex flex-col shadow-inner">
      <div className="p-3 border-b border-[#3e3e42] flex items-center justify-between">
        <h3 className="font-semibold text-sm tracking-wide">FILES</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUploadClick}
            className="p-1 hover:bg-[#2d2d30] rounded border border-transparent hover:border-[#3e3e42]"
            title="Upload markdown"
          >
            <Plus className="w-4 h-4 text-[#d4d4d4]" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 text-sm leading-relaxed">
        {files.length === 0 ? (
          <p className="text-xs text-[#9f9f9f]">No files yet. Upload a .md file to get started.</p>
        ) : (
          renderFileTree(files)
        )}
      </div>
    </div>
  );
};

export default FileExplorer;

