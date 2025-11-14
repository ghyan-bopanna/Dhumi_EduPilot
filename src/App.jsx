import React, { useState, useEffect } from 'react';
import { Sparkles, LayoutDashboard, FileText, Search } from 'lucide-react';
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
  const [showAISidebar, setShowAISidebar] = useState(false);
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
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold">Dhumi EduPilot</h1>
          </div>
          {currentCourse && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentCourse.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView(view === 'editor' ? 'dashboard' : 'editor')}
            className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            {view === 'editor' ? 'Dashboard' : 'Editor'}
          </button>
          <button
            onClick={() => setShowAISidebar(!showAISidebar)}
            className="px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            AI Copilot
          </button>
        </div>
      </header>

      {/* Main Content */}
      {view === 'dashboard' ? (
        <Dashboard
          courseId={currentCourse?.id}
          onNavigate={(v) => setView(v)}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* File Explorer */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700">
            <FileExplorer
              files={files}
              onFileSelect={handleFileSelect}
              onFileCreate={handleFileCreate}
              onFileDelete={handleFileDelete}
              selectedFile={currentFile}
            />
          </div>

          {/* Editor Area */}
          <div className="flex-1 flex flex-col">
            {/* Toolbar */}
            <div className="h-10 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                {currentFile && (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {currentFile}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAssessmentPanel(true)}
                  className="px-3 py-1 text-xs bg-purple-500 hover:bg-purple-600 text-white rounded flex items-center gap-2"
                  disabled={!currentFile}
                >
                  <FileText className="w-3 h-3" />
                  Assessment
                </button>
                <button
                  onClick={() => setShowContentScanner(true)}
                  className="px-3 py-1 text-xs bg-yellow-500 hover:bg-yellow-600 text-white rounded flex items-center gap-2"
                  disabled={!currentFile}
                >
                  <Search className="w-3 h-3" />
                  Check Freshness
                </button>
              </div>
            </div>

            {/* Editor or Diff View */}
            {showDiff ? (
              <div className="flex-1">
                <DiffView
                  original={diffContent.original}
                  generated={diffContent.generated}
                  onAccept={handleAcceptDiff}
                  onReject={handleRejectDiff}
                />
              </div>
            ) : (
              <div className="flex-1">
                {currentFile ? (
                  <Editor
                    value={fileContent}
                    onChange={(value) => handleFileSave(value || '')}
                    language="markdown"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Select a file from the explorer to start editing</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AI Sidebar */}
          <AISidebar
            isOpen={showAISidebar}
            onClose={() => setShowAISidebar(false)}
            onGenerate={handleGenerate}
            context={context}
          />
        </div>
      )}

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

