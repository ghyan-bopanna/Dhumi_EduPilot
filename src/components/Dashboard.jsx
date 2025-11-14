import React, { useState } from 'react';
import { TrendingUp, Users, BookOpen, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';
import geminiApi from '../services/geminiApi';
import storage from '../services/storage';

const Dashboard = ({ courseId, onNavigate }) => {
  const [students, setStudents] = useState(storage.getStudents(courseId) || []);
  const [personalizedContent, setPersonalizedContent] = useState({});
  const [uploading, setUploading] = useState(false);

  const stats = {
    totalStudents: students.length,
    activeModules: 4,
    avgCompletionRate: 75,
    avgScore: 82
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const parsedStudents = results.data.filter(row => row.name || row.Name);
        setStudents(parsedStudents);
        storage.saveStudents(courseId, parsedStudents);
        setUploading(false);
      },
      error: (error) => {
        console.error('CSV parsing error:', error);
        setUploading(false);
      }
    });
  };

  const generatePersonalizedNotes = async (student, lessonContent) => {
    try {
      const content = await geminiApi.generatePersonalizedContent(student, lessonContent);
      setPersonalizedContent(prev => ({
        ...prev,
        [student.name || student.Name]: content
      }));
    } catch (error) {
      console.error('Failed to generate personalized content:', error);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#1e1e1e] text-[#d4d4d4] p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-[#3e3e42] pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#9f9f9f]">Command Center</p>
            <h1 className="text-3xl font-semibold mt-1">Instructor Dashboard</h1>
          </div>
          <button
            onClick={() => onNavigate('editor')}
            className="px-4 py-2 border border-[#007acc] text-[#d4d4d4] rounded bg-[#1f1f1f] hover:bg-[#007acc] hover:text-white transition flex items-center gap-2 shadow"
          >
            Back to Editor
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Students', value: stats.totalStudents, icon: Users, accent: '#007acc' },
            { label: 'Active Modules', value: stats.activeModules, icon: BookOpen, accent: '#4ec9b0' },
            { label: 'Completion Rate', value: `${stats.avgCompletionRate}%`, icon: TrendingUp, accent: '#c586c0' },
            { label: 'Avg Score', value: `${stats.avgScore}%`, icon: CheckCircle2, accent: '#f1c40f' },
          ].map((card, idx) => (
            <div key={idx} className="bg-[#252526] border border-[#3e3e42] rounded-lg p-5 shadow-lg flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-[#9f9f9f]">{card.label}</p>
                <card.icon className="w-6 h-6" style={{ color: card.accent }} />
              </div>
              <p className="text-2xl font-semibold text-[#d4d4d4]">{card.value}</p>
              <div className="h-1 rounded bg-[#2d2d30]">
                <div className="h-full rounded bg-[#007acc]" style={{ width: `${Math.min(100, parseInt(card.value, 10) || 40)}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Student Management */}
        <div className="bg-[#1f1f1f] border border-[#3e3e42] rounded-xl shadow-xl p-6 space-y-6">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Student Management</h2>
              <p className="text-xs text-[#9f9f9f]">Upload cohorts, track progress, push personalized notes</p>
            </div>
            <label className="px-4 py-2 border border-[#007acc] rounded bg-[#252526] hover:bg-[#007acc] hover:text-white cursor-pointer transition shadow">
              {uploading ? 'Uploading...' : 'Upload CSV'}
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-16 text-[#9f9f9f] border border-dashed border-[#3e3e42] rounded-lg bg-[#252526]/50">
              <Users className="w-10 h-10 mx-auto mb-4 text-[#3e3e42]" />
              <p>No students yet. Upload a CSV file to get started.</p>
              <p className="text-xs mt-2 text-[#7f7f7f]">CSV should include: name, interests, learningStyle, scores, level</p>
            </div>
          ) : (
            <div className="overflow-auto border border-[#3e3e42] rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-[#252526] text-[#9f9f9f] uppercase text-xs tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Level</th>
                    <th className="px-4 py-3 text-left">Interests</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr key={idx} className="border-t border-[#2a2a2a] hover:bg-[#252526] transition">
                      <td className="px-4 py-3">{student.name || student.Name}</td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 text-xs rounded-full border border-[#007acc] text-[#9cdcfe] bg-[#094771]">
                          {student.level || student.Level || 'beginner'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#c8c8c8]">
                        {student.interests || student.Interests || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => generatePersonalizedNotes(student, 'Sample lesson content')}
                          className="px-4 py-1.5 text-xs border border-[#1e4f2b] rounded bg-[#1e3a1e] text-[#b7f1c6] hover:bg-[#27502a] transition"
                        >
                          Generate Notes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Personalized Content Preview */}
        {Object.keys(personalizedContent).length > 0 && (
          <div className="bg-[#1f1f1f] border border-[#3e3e42] rounded-xl shadow-xl p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Personalized Content Queue</h2>
              <p className="text-xs text-[#9f9f9f]">Review drafts before syncing with students</p>
            </div>
            <div className="space-y-4">
              {Object.entries(personalizedContent).map(([studentName, content]) => (
                <div key={studentName} className="border border-[#3e3e42] rounded-lg p-4 bg-[#252526] shadow-inner">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-[#9cdcfe]">{studentName}</h3>
                    <span className="text-xs uppercase tracking-[0.2em] text-[#7f7f7f]">Draft</span>
                  </div>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed text-[#c8c8c8]">
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Freshness Alert */}
        <div className="border border-[#a8892b] rounded-lg p-4 bg-[#2b2412] flex items-start gap-3 shadow">
          <AlertCircle className="w-5 h-5 text-[#f6e39c] mt-1" />
          <div>
            <h3 className="font-semibold text-[#f6e39c]">Content Freshness Check</h3>
            <p className="text-sm text-[#d8cfa3] mt-1">
              Modules flagged for potential updates. Run the Content Scanner to keep material aligned with the latest AI releases.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

