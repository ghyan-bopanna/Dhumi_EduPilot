import React, { useState } from 'react';
import { File, Folder, FolderOpen, Plus, Trash2 } from 'lucide-react';

const FileExplorer = ({ files, onFileSelect, onFileCreate, onFileDelete, selectedFile }) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['modules', 'assessments', 'resources']));

  const toggleFolder = (folder) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folder)) {
      newExpanded.delete(folder);
    } else {
      newExpanded.add(folder);
    }
    setExpandedFolders(newExpanded);
  };

  const renderFileTree = (items, path = '') => {
    return items.map((item) => {
      const fullPath = path ? `${path}/${item.name}` : item.name;
      const isSelected = selectedFile === fullPath;

      if (item.type === 'folder') {
        const isExpanded = expandedFolders.has(item.name);
        return (
          <div key={item.name} className="select-none">
            <div
              className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-[#2d2d30] transition"
              onClick={() => toggleFolder(item.name)}
            >
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-[#c5c5c5]" />
              ) : (
                <Folder className="w-4 h-4 text-[#c5c5c5]" />
              )}
              <span className="text-sm font-medium text-[#d4d4d4]">{item.name}</span>
            </div>
            {isExpanded && item.children && (
              <div className="ml-4 border-l border-[#3e3e42] pl-2">
                {renderFileTree(item.children, fullPath)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div
            key={fullPath}
            className={`flex items-center gap-2 px-2 py-1 cursor-pointer rounded group transition ${
              isSelected ? 'bg-[#094771] text-white' : 'hover:bg-[#2d2d30]'
            }`}
            onClick={() => onFileSelect(fullPath)}
          >
            <File className="w-4 h-4 text-[#9cdcfe]" />
            <span className="text-sm flex-1">{item.name}</span>
            {onFileDelete && (
              <Trash2
                className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#f14c4c]"
                onClick={(e) => {
                  e.stopPropagation();
                  onFileDelete(fullPath);
                }}
              />
            )}
          </div>
        );
      }
    });
  };

  const fileTree = files || [
    {
      name: 'curriculum.md',
      type: 'file'
    },
    {
      name: 'pedagogy.md',
      type: 'file'
    },
    {
      name: 'modules',
      type: 'folder',
      children: []
    },
    {
      name: 'assessments',
      type: 'folder',
      children: []
    },
    {
      name: 'resources',
      type: 'folder',
      children: []
    }
  ];

  return (
    <div className="h-full bg-[#252526] text-[#d4d4d4] border-r border-[#3e3e42] flex flex-col shadow-inner">
      <div className="p-3 border-b border-[#3e3e42] flex items-center justify-between">
        <h3 className="font-semibold text-sm tracking-wide">FILES</h3>
        {onFileCreate && (
          <button
            onClick={onFileCreate}
            className="p-1 hover:bg-[#2d2d30] rounded border border-transparent hover:border-[#3e3e42]"
            title="Create new file"
          >
            <Plus className="w-4 h-4 text-[#d4d4d4]" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 text-sm leading-relaxed">
        {renderFileTree(fileTree)}
      </div>
    </div>
  );
};

export default FileExplorer;

