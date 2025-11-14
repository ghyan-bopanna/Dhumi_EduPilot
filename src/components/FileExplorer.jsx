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
              className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded"
              onClick={() => toggleFolder(item.name)}
            >
              {isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-500" />
              ) : (
                <Folder className="w-4 h-4 text-blue-500" />
              )}
              <span className="text-sm font-medium">{item.name}</span>
            </div>
            {isExpanded && item.children && (
              <div className="ml-4">
                {renderFileTree(item.children, fullPath)}
              </div>
            )}
          </div>
        );
      } else {
        return (
          <div
            key={fullPath}
            className={`flex items-center gap-2 px-2 py-1 cursor-pointer rounded group ${
              isSelected ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            onClick={() => onFileSelect(fullPath)}
          >
            <File className="w-4 h-4 text-gray-500" />
            <span className="text-sm flex-1">{item.name}</span>
            {onFileDelete && (
              <Trash2
                className="w-3 h-3 opacity-0 group-hover:opacity-100 text-red-500"
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
    <div className="h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-sm">Files</h3>
        {onFileCreate && (
          <button
            onClick={onFileCreate}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            title="Create new file"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {renderFileTree(fileTree)}
      </div>
    </div>
  );
};

export default FileExplorer;

