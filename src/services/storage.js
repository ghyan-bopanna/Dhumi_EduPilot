// LocalStorage-based storage service
class StorageService {
  constructor() {
    this.storageKey = 'edupilot_data';
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
    return courses.find(c => c.id === courseId);
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

  // Context files
  saveContextFile(courseId, fileName, content) {
    const course = this.getCourse(courseId);
    if (!course) return;

    if (!course.contextFiles) {
      course.contextFiles = {};
    }
    course.contextFiles[fileName] = content;
    this.saveCourse(course);
  }

  getContextFile(courseId, fileName) {
    const course = this.getCourse(courseId);
    return course?.contextFiles?.[fileName] || '';
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

