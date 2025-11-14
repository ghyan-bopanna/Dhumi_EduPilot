import React, { useState, useEffect } from 'react';
import { Sparkles, LayoutDashboard, FileText, Search, PanelRightOpen, PanelRightClose } from 'lucide-react';
import FileExplorer from './components/FileExplorer';
import Editor from './components/Editor';
import AISidebar from './components/AISidebar';
import DiffView from './components/DiffView';
import Dashboard from './components/Dashboard';
import ContentFreshnessScanner from './components/ContentFreshnessScanner';
import AssessmentPanel from './components/AssessmentPanel';
import storage from './services/storage';

function App() {
  const [currentCourse, setCurrentCourse] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [files, setFiles] = useState([]);
  const [isAISidebarCollapsed, setIsAISidebarCollapsed] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diffContent, setDiffContent] = useState({ original: '', generated: '' });
  const [view, setView] = useState('editor'); // 'editor' or 'dashboard'
  const [showContentScanner, setShowContentScanner] = useState(false);
  const [showAssessmentPanel, setShowAssessmentPanel] = useState(false);
  const [context, setContext] = useState({ curriculum: '', pedagogy: '' });

  // Initialize with sample course or load from storage
  useEffect(() => {
    const courses = storage.getCourses();
    if (courses.length > 0) {
      const course = courses[0];
      setCurrentCourse(course);
      loadCourseFiles(course);
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

  // Load context files when course changes
  useEffect(() => {
    if (currentCourse) {
      const curriculum = storage.getContextFile(currentCourse.id, 'curriculum.md');
      const pedagogy = storage.getContextFile(currentCourse.id, 'pedagogy.md');
      setContext({ curriculum, pedagogy });
    }
  }, [currentCourse]);

  const initializeSampleFiles = (course) => {
    const sampleFiles = [
      { name: 'curriculum.md', type: 'file', content: '# Curriculum Map\n\n## Week-by-Week Breakdown\n\n[Your curriculum details here]' },
      { name: 'pedagogy.md', type: 'file', content: '# Pedagogy Guidelines\n\n## Learning Styles\n\n[Your pedagogy guidelines here]' }
    ];
    
    course.contextFiles = course.contextFiles || {};
    sampleFiles.forEach(file => {
      course.contextFiles[file.name] = file.content;
    });
    
    storage.saveCourse(course);
    loadCourseFiles(course);
  };

  const loadCourseFiles = (course) => {
    const fileTree = [
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
        children: course.files?.filter(f => f.startsWith('modules/'))?.map(f => ({
          name: f.split('/').pop(),
          type: 'file'
        })) || []
      },
      {
        name: 'assessments',
        type: 'folder',
        children: course.files?.filter(f => f.startsWith('assessments/'))?.map(f => ({
          name: f.split('/').pop(),
          type: 'file'
        })) || []
      },
      {
        name: 'resources',
        type: 'folder',
        children: course.files?.filter(f => f.startsWith('resources/'))?.map(f => ({
          name: f.split('/').pop(),
          type: 'file'
        })) || []
      }
    ];
    setFiles(fileTree);
  };

  const handleFileSelect = (filePath) => {
    setCurrentFile(filePath);
    if (currentCourse) {
      const content = storage.getContextFile(currentCourse.id, filePath) || 
                     (currentCourse.files?.find(f => f === filePath) ? 
                      storage.getContextFile(currentCourse.id, filePath) : '');
      setFileContent(content || `# ${filePath}\n\n[Start editing...]`);
    }
  };

  const handleFileSave = (content) => {
    if (currentCourse && currentFile) {
      setFileContent(content);
      storage.saveContextFile(currentCourse.id, currentFile, content);
      
      // Update context if it's a context file
      if (currentFile === 'curriculum.md') {
        setContext(prev => ({ ...prev, curriculum: content }));
      } else if (currentFile === 'pedagogy.md') {
        setContext(prev => ({ ...prev, pedagogy: content }));
      }
    }
  };

  const handleGenerate = async (generatedContent, prompt) => {
    // Store original content
    const originalContent = fileContent || '';
    
    // Store generated content for diff view
    setDiffContent({
      original: originalContent,
      generated: generatedContent
    });
    
    // Show diff view
    setShowDiff(true);
  };

  const handleAcceptDiff = (content) => {
    handleFileSave(content);
    setShowDiff(false);
    setDiffContent({ original: '', generated: '' });
  };

  const handleRejectDiff = () => {
    setShowDiff(false);
    setDiffContent({ original: '', generated: '' });
  };

  const handleFileCreate = () => {
    const fileName = prompt('Enter file name (e.g., modules/intro.md):');
    if (fileName && currentCourse) {
      storage.saveContextFile(currentCourse.id, fileName, `# ${fileName}\n\n`);
      loadCourseFiles(currentCourse);
      handleFileSelect(fileName);
    }
  };

  const handleFileDelete = (filePath) => {
    if (confirm(`Delete ${filePath}?`)) {
      // Implementation for file deletion
      if (currentFile === filePath) {
        setCurrentFile(null);
        setFileContent('');
      }
      loadCourseFiles(currentCourse);
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
                  files={files}
                  onFileSelect={handleFileSelect}
                  onFileCreate={handleFileCreate}
                  onFileDelete={handleFileDelete}
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

