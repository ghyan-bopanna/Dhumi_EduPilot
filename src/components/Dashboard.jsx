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
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={() => onNavigate('editor')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Back to Editor
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold mt-1">{stats.totalStudents}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Modules</p>
                <p className="text-2xl font-bold mt-1">{stats.activeModules}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold mt-1">{stats.avgCompletionRate}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Score</p>
                <p className="text-2xl font-bold mt-1">{stats.avgScore}%</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Student Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Student Management</h2>
            <label className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer">
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
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No students yet. Upload a CSV file to get started.</p>
              <p className="text-sm mt-2">CSV should include: name, interests, learningStyle, scores, level</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Interests</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {students.map((student, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-3">{student.name || student.Name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                          {student.level || student.Level || 'beginner'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {student.interests || student.Interests || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => generatePersonalizedNotes(student, 'Sample lesson content')}
                          className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Personalized Content</h2>
            <div className="space-y-4">
              {Object.entries(personalizedContent).map(([studentName, content]) => (
                <div key={studentName} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{studentName}</h3>
                  <div className="prose dark:prose-invert max-w-none text-sm whitespace-pre-wrap">
                    {content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Freshness Alert */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Content Freshness Check</h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
              Some modules may need updates. Use the Content Scanner to check for outdated content.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

