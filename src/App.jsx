import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, LayoutDashboard, FileText, Search, PanelRightOpen, PanelRightClose } from 'lucide-react';
import FileExplorer from './components/FileExplorer';
import Editor from './components/Editor';
import AISidebar from './components/AISidebar';
import DiffView from './components/DiffView';
import Dashboard from './components/Dashboard';
import ContentFreshnessScanner from './components/ContentFreshnessScanner';
import AssessmentPanel from './components/AssessmentPanel';
import storage from './services/storage';
import geminiApi from './services/geminiApi';

const buildFileTree = (entries = []) => {
  const root = [];

  const sortNodes = (nodes) => {
    nodes.sort((a, b) => {
      const priority = (node) => {
        const path = node.path?.toLowerCase() || '';
        if (node.type === 'file' && path === 'curriculum.md') return 0;
        if (node.type === 'file' && path === 'pedagogy.md') return 1;
        if (node.type === 'file') return 2;
        return 3;
      };
      const diff = priority(a) - priority(b);
      if (diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    });

    nodes.forEach((node) => {
      if (node.children && node.children.length) {
        sortNodes(node.children);
      }
    });
  };

  entries.forEach((entry) => {
    const parts = entry.path.split('/');
    let currentLevel = root;

    parts.forEach((part, idx) => {
      const fullPath = parts.slice(0, idx + 1).join('/');
      const isFile = idx === parts.length - 1;

      if (isFile) {
        currentLevel.push({
          name: part,
          type: 'file',
          path: entry.path,
          badge: entry.badge,
          canRefresh: entry.path.toLowerCase().includes('curriculum'),
        });
      } else {
        let folder = currentLevel.find(
          (node) => node.type === 'folder' && node.name === part
        );
        if (!folder) {
          folder = { name: part, type: 'folder', path: fullPath, children: [] };
          currentLevel.push(folder);
        }
        currentLevel = folder.children;
      }
    });
  });

  sortNodes(root);
  return root;
};

function App() {
  const [currentCourse, setCurrentCourse] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [fileEntries, setFileEntries] = useState([]);
  const [isAISidebarCollapsed, setIsAISidebarCollapsed] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diffContent, setDiffContent] = useState({ original: '', generated: '', targetPath: null, fileName: '' });
  const [view, setView] = useState('editor'); // 'editor' or 'dashboard'
  const [showContentScanner, setShowContentScanner] = useState(false);
  const [showAssessmentPanel, setShowAssessmentPanel] = useState(false);
  const [context, setContext] = useState({ curriculum: '', pedagogy: '' });
  const [refreshingFile, setRefreshingFile] = useState(null);

  // Initialize with sample course or load from storage
  useEffect(() => {
    const courses = storage.getCourses();
    if (courses.length > 0) {
      const course = courses[0];
      setCurrentCourse(course);
    } else {
      // Create sample course
      const sampleCourse = {
        id: storage.generateId(),
        name: 'Sample Course',
        created: new Date().toISOString(),
        contextFiles: {},
        files: []
      };
      storage.saveCourse(sampleCourse);
      setCurrentCourse(sampleCourse);
      initializeSampleFiles(sampleCourse);
    }
  }, []);

  useEffect(() => {
    if (!currentCourse) return;
    const entries = storage.getFileEntries(currentCourse.id);
    if (!entries || entries.length === 0) {
      initializeSampleFiles(currentCourse);
      setFileEntries(storage.getFileEntries(currentCourse.id));
    } else {
      setFileEntries(entries);
    }
  }, [currentCourse]);

  useEffect(() => {
    if (!currentCourse) return;
    const curriculum = fileEntries.find((entry) => entry.path === 'curriculum.md')?.content || '';
    const pedagogy = fileEntries.find((entry) => entry.path === 'pedagogy.md')?.content || '';
    setContext({ curriculum, pedagogy });
  }, [fileEntries, currentCourse]);

  const fileTree = useMemo(() => buildFileTree(fileEntries), [fileEntries]);

  const initializeSampleFiles = (course) => {
    const sampleFiles = [
      { name: 'curriculum.md', type: 'file', content: '# Curriculum Map\n\n## Week-by-Week Breakdown\n\n[Your curriculum details here]' },
      { name: 'pedagogy.md', type: 'file', content: '# Pedagogy Guidelines\n\n## Learning Styles\n\n[Your pedagogy guidelines here]' }
    ];
    
    sampleFiles.forEach(file => {
      storage.saveContextFile(course.id, file.name, file.content);
    });
    setFileEntries(storage.getFileEntries(course.id));
  };

  const handleFileSelect = (filePath) => {
    const entry = fileEntries.find((f) => f.path === filePath);
    if (!entry) return;
    setCurrentFile(filePath);
    setFileContent(entry.content || '');
    setShowDiff(false);
    if (entry.badge === 'new' && currentCourse) {
      storage.clearFileBadge(currentCourse.id, filePath);
      setFileEntries((prev) =>
        prev.map((f) => (f.path === filePath ? { ...f, badge: null } : f))
      );
    }
  };

  const handleFileSave = (content) => {
    if (currentCourse && currentFile) {
      setFileContent(content);
      const savedEntry = storage.saveFileEntry(currentCourse.id, currentFile, content);
      if (savedEntry) {
        setFileEntries((prev) =>
          prev.map((entry) => (entry.path === currentFile ? savedEntry : entry))
        );
      }
    }
  };

  const handleGenerate = async (generatedContent, prompt) => {
    if (!currentCourse) return;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const defaultName = `curriculum_generated_${timestamp}.md`;
    const desiredName = window.prompt('Enter filename for generated curriculum', defaultName) || defaultName;
    const existingPaths = new Set(fileEntries.map((entry) => entry.path));
    const getUniqueName = (name) => {
      if (!existingPaths.has(name)) {
        existingPaths.add(name);
        return name;
      }
      const dotIndex = name.lastIndexOf('.');
      const base = dotIndex >= 0 ? name.slice(0, dotIndex) : name;
      const ext = dotIndex >= 0 ? name.slice(dotIndex) : '';
      let counter = 1;
      let candidate = `${base}_${counter}${ext}`;
      while (existingPaths.has(candidate)) {
        counter += 1;
        candidate = `${base}_${counter}${ext}`;
      }
      existingPaths.add(candidate);
      return candidate;
    };
    const finalName = getUniqueName(desiredName.trim() || defaultName);
    const savedEntry = storage.saveFileEntry(currentCourse.id, finalName, generatedContent, { badge: 'new' });
    if (savedEntry) {
      setFileEntries((prev) => {
        const exists = prev.some((entry) => entry.path === savedEntry.path);
        return exists ? prev.map((entry) => (entry.path === savedEntry.path ? savedEntry : entry)) : [...prev, savedEntry];
      });
      setCurrentFile(savedEntry.path);
      setFileContent(generatedContent);
      setShowDiff(false);
    }
  };

  const handleAcceptDiff = (content) => {
    if (!currentCourse || !diffContent.targetPath) return;
    const savedEntry = storage.saveFileEntry(currentCourse.id, diffContent.targetPath, content, { badge: null });
    if (savedEntry) {
      setFileEntries((prev) =>
        prev.map((entry) => (entry.path === savedEntry.path ? savedEntry : entry))
      );
      if (currentFile === savedEntry.path) {
        setFileContent(content);
      }
    }
    setShowDiff(false);
    setDiffContent({ original: '', generated: '', targetPath: null, fileName: '' });
  };

  const handleRejectDiff = () => {
    setShowDiff(false);
    setDiffContent({ original: '', generated: '', targetPath: null, fileName: '' });
  };

  const handleFileDelete = (filePath) => {
    if (confirm(`Delete ${filePath}?`)) {
      if (currentCourse) {
        storage.deleteFileEntry(currentCourse.id, filePath);
        setFileEntries((prev) => prev.filter((entry) => entry.path !== filePath));
      }
      if (currentFile === filePath) {
        setCurrentFile(null);
        setFileContent('');
      }
    }
  };

  const handleFileUpload = (fileList) => {
    if (!currentCourse) return;
    const existingPaths = new Set(fileEntries.map((entry) => entry.path));
    const getUniqueName = (name) => {
      if (!existingPaths.has(name)) {
        existingPaths.add(name);
        return name;
      }
      const dotIndex = name.lastIndexOf('.');
      const base = dotIndex >= 0 ? name.slice(0, dotIndex) : name;
      const ext = dotIndex >= 0 ? name.slice(dotIndex) : '';
      let counter = 1;
      let candidate = `${base}_${counter}${ext}`;
      while (existingPaths.has(candidate)) {
        counter += 1;
        candidate = `${base}_${counter}${ext}`;
      }
      existingPaths.add(candidate);
      return candidate;
    };

    Array.from(fileList).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result || '';
        const uniqueName = getUniqueName(file.name.endsWith('.md') ? file.name : `${file.name}.md`);
        storage.saveFileEntry(currentCourse.id, uniqueName, text, { createdAt: new Date().toISOString() });
        setFileEntries(storage.getFileEntries(currentCourse.id));
      };
      reader.readAsText(file);
    });
  };

  const handleRefreshFile = async (filePath) => {
    if (!currentCourse) return;
    const entry = fileEntries.find((f) => f.path === filePath);
    if (!entry) return;
    setRefreshingFile(filePath);
    try {
      const updatedContent = await geminiApi.generateContentRefresh(
        entry.name,
        entry.content,
        context.curriculum,
        context.pedagogy
      );
      setDiffContent({
        original: entry.content,
        generated: updatedContent,
        targetPath: filePath,
        fileName: entry.name,
      });
      setShowDiff(true);
    } catch (error) {
      console.error('Failed to refresh content', error);
      alert('Unable to refresh this file. Please try again.');
    } finally {
      setRefreshingFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] font-mono">
      <div className="flex flex-col h-screen">
        <header className="h-14 bg-[#1f1f1f] border-b border-[#3e3e42] flex items-center justify-between px-6 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#007acc]" />
              <h1 className="text-lg font-semibold tracking-wide">Dhumi EduPilot</h1>
            </div>
            {currentCourse && (
              <span className="text-xs uppercase tracking-wide text-[#9f9f9f]">
                {currentCourse.name}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView(view === 'editor' ? 'dashboard' : 'editor')}
              className="px-3 py-1.5 text-xs border border-[#3e3e42] rounded bg-[#252526] hover:border-[#007acc] flex items-center gap-2 transition"
            >
              <LayoutDashboard className="w-4 h-4" />
              {view === 'editor' ? 'Dashboard' : 'Editor'}
            </button>
            <button
              onClick={() => setIsAISidebarCollapsed((prev) => !prev)}
              className="px-3 py-1.5 text-xs border border-[#3e3e42] rounded bg-[#252526] hover:border-[#007acc] flex items-center gap-2 transition"
            >
              {isAISidebarCollapsed ? (
                <>
                  <PanelRightOpen className="w-4 h-4" />
                  Show Copilot
                </>
              ) : (
                <>
                  <PanelRightClose className="w-4 h-4" />
                  Hide Copilot
                </>
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden">
          {view === 'dashboard' ? (
            <Dashboard
              courseId={currentCourse?.id}
              onNavigate={(v) => setView(v)}
            />
          ) : (
            <div className="h-full flex overflow-hidden">
              <div className="w-[250px] shrink-0 h-full border-r border-[#3e3e42] bg-[#252526]">
                <FileExplorer
                  files={fileTree}
                  onFileSelect={handleFileSelect}
                  onFileDelete={handleFileDelete}
                  onFileUpload={handleFileUpload}
                  onRefreshFile={handleRefreshFile}
                  refreshingFile={refreshingFile}
                  selectedFile={currentFile}
                />
              </div>

              <div className="flex-1 flex flex-col border-r border-[#3e3e42] bg-[#1e1e1e]">
                <div className="h-12 border-b border-[#3e3e42] px-4 flex items-center justify-between bg-[#1f1f1f]">
                  <div className="flex items-center gap-2 text-xs text-[#9f9f9f]">
                    {currentFile ? (
                      <>
                        <span className="text-[#d4d4d4]">{currentFile}</span>
                        {showDiff && <span className="text-[#007acc]">• Reviewing draft</span>}
                      </>
                    ) : (
                      <span>Select a file to begin</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAssessmentPanel(true)}
                      className="px-3 py-1 text-xs border border-[#5d2a86] rounded bg-[#2b1d35] text-[#d6b2ff] hover:border-[#bb86fc] disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={!currentFile}
                    >
                      Assess
                    </button>
                    <button
                      onClick={() => setShowContentScanner(true)}
                      className="px-3 py-1 text-xs border border-[#a8892b] rounded bg-[#3a2c0f] text-[#f6e39c] hover:border-[#f6d85f] disabled:opacity-40 disabled:cursor-not-allowed"
                      disabled={!currentFile}
                    >
                      Freshness
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  {showDiff ? (
                    <DiffView
                      original={diffContent.original}
                      generated={diffContent.generated}
                      fileName={diffContent.fileName}
                      onAccept={handleAcceptDiff}
                      onReject={handleRejectDiff}
                    />
                  ) : (
                    <div className="h-full">
                      {currentFile ? (
                        <Editor
                          value={fileContent}
                          onChange={(value) => handleFileSave(value || '')}
                          language="markdown"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center text-[#9f9f9f]">
                          <div className="text-center space-y-2">
                            <FileText className="w-12 h-12 mx-auto text-[#3e3e42]" />
                            <p>Select a file from the explorer to start editing</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <AISidebar
                collapsed={isAISidebarCollapsed}
                onToggle={() => setIsAISidebarCollapsed((prev) => !prev)}
                onGenerate={handleGenerate}
                context={context}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showContentScanner && (
        <ContentFreshnessScanner
          content={fileContent}
          onClose={() => setShowContentScanner(false)}
        />
      )}

      {showAssessmentPanel && (
        <AssessmentPanel
          lessonContent={fileContent}
          onClose={() => setShowAssessmentPanel(false)}
        />
      )}
    </div>
  );
}

export default App;

