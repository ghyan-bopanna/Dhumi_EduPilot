// LocalStorage-based storage service
class StorageService {
  constructor() {
    this.storageKey = 'edupilot_data';
  }

  ensureFileEntries(course) {
    if (!course) return false;
    let mutated = false;

    if (!course.fileEntries) {
      course.fileEntries = [];
      mutated = true;
    }

    if (course.contextFiles && Object.keys(course.contextFiles).length > 0) {
      Object.entries(course.contextFiles).forEach(([fileName, content]) => {
        course.fileEntries.push({
          id: this.generateId(),
          name: fileName.split('/').pop(),
          path: fileName,
          content,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          type: fileName.endsWith('.md') ? 'markdown' : 'text',
          badge: null,
          isContext: true,
        });
      });
      delete course.contextFiles;
      mutated = true;
    }

    return mutated;
  }

  // Course management
  saveCourse(course) {
    const courses = this.getCourses();
    const index = courses.findIndex(c => c.id === course.id);
    if (index >= 0) {
      courses[index] = course;
    } else {
      courses.push(course);
    }
    this.saveCourses(courses);
    return course;
  }

  getCourse(courseId) {
    const courses = this.getCourses();
    const course = courses.find(c => c.id === courseId);
    if (!course) return undefined;
    if (this.ensureFileEntries(course)) {
      this.saveCourse(course);
    }
    return course;
  }

  getCourses() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data).courses || [] : [];
  }

  saveCourses(courses) {
    const data = JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    data.courses = courses;
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  deleteCourse(courseId) {
    const courses = this.getCourses();
    const filtered = courses.filter(c => c.id !== courseId);
    this.saveCourses(filtered);
  }

  // Generic file handling
  saveFileEntry(courseId, filePath, content, options = {}) {
    const course = this.getCourse(courseId);
    if (!course) return null;

    const mutated = this.ensureFileEntries(course);
    const timestamp = new Date().toISOString();
    const entries = course.fileEntries || [];
    const index = entries.findIndex(f => f.path === filePath);
    const existing = index >= 0 ? entries[index] : null;

    const entry = {
      id: options.id || existing?.id || this.generateId(),
      name: options.name || filePath.split('/').pop(),
      path: filePath,
      content,
      createdAt: existing?.createdAt || options.createdAt || timestamp,
      updatedAt: timestamp,
      type: options.type || existing?.type || (filePath.endsWith('.md') ? 'markdown' : 'text'),
      badge: options.badge !== undefined ? options.badge : existing?.badge || null,
      isContext: options.isContext !== undefined ? options.isContext : existing?.isContext || false,
      meta: { ...(existing?.meta || {}), ...(options.meta || {}) },
    };

    if (index >= 0) {
      entries[index] = entry;
    } else {
      entries.push(entry);
    }

    if (mutated) {
      course.fileEntries = entries;
    }

    this.saveCourse(course);
    return entry;
  }

  getFileEntries(courseId) {
    const course = this.getCourse(courseId);
    if (!course) return [];
    this.ensureFileEntries(course);
    return course.fileEntries || [];
  }

  getFileEntry(courseId, filePath) {
    const entries = this.getFileEntries(courseId);
    return entries.find(entry => entry.path === filePath);
  }

  deleteFileEntry(courseId, filePath) {
    const course = this.getCourse(courseId);
    if (!course?.fileEntries) return;
    const next = course.fileEntries.filter(entry => entry.path !== filePath);
    course.fileEntries = next;
    this.saveCourse(course);
  }

  updateFileEntry(courseId, filePath, updates = {}) {
    const course = this.getCourse(courseId);
    if (!course?.fileEntries) return null;
    const index = course.fileEntries.findIndex(entry => entry.path === filePath);
    if (index === -1) return null;
    const current = course.fileEntries[index];
    const updated = {
      ...current,
      ...updates,
      meta: { ...(current.meta || {}), ...(updates.meta || {}) },
      updatedAt: updates.updatedAt || new Date().toISOString(),
    };
    course.fileEntries[index] = updated;
    this.saveCourse(course);
    return updated;
  }

  clearFileBadge(courseId, filePath) {
    return this.updateFileEntry(courseId, filePath, { badge: null });
  }

  // Context helpers
  saveContextFile(courseId, fileName, content) {
    return this.saveFileEntry(courseId, fileName, content, { isContext: true, badge: null });
  }

  getContextFile(courseId, fileName) {
    const entry = this.getFileEntry(courseId, fileName);
    return entry?.content || '';
  }

  getFileContent(courseId, filePath) {
    const entry = this.getFileEntry(courseId, filePath);
    return entry?.content || '';
  }

  // Student data
  saveStudents(courseId, students) {
    const course = this.getCourse(courseId);
    if (!course) return;

    course.students = students;
    this.saveCourse(course);
  }

  getStudents(courseId) {
    const course = this.getCourse(courseId);
    return course?.students || [];
  }

  // Generated content versions
  saveContentVersion(courseId, filePath, originalContent, generatedContent) {
    const course = this.getCourse(courseId);
    if (!course) return;

    if (!course.contentVersions) {
      course.contentVersions = {};
    }
    if (!course.contentVersions[filePath]) {
      course.contentVersions[filePath] = [];
    }
    
    course.contentVersions[filePath].push({
      id: Date.now().toString(),
      original: originalContent,
      generated: generatedContent,
      timestamp: new Date().toISOString(),
      status: 'pending' // pending, accepted, rejected
    });

    this.saveCourse(course);
  }

  getContentVersions(courseId, filePath) {
    const course = this.getCourse(courseId);
    return course?.contentVersions?.[filePath] || [];
  }

  updateVersionStatus(courseId, filePath, versionId, status) {
    const course = this.getCourse(courseId);
    if (!course?.contentVersions?.[filePath]) return;

    const version = course.contentVersions[filePath].find(v => v.id === versionId);
    if (version) {
      version.status = status;
      this.saveCourse(course);
    }
  }

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export default new StorageService();

