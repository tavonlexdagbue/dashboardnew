// Course management utilities

export interface CourseOutline {
  id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  description: string;
  createdAt: string;
}

export interface Course {
  id: string;
  userId: string;
  title: string;
  ageGroup: string;
  price: number;
  introVideoUrl: string;
courseOutline: CourseOutline[];
  createdAt: string;
  updatedAt: string;
}

const COURSES_KEY = 'tavonlex_courses';
const COURSE_OUTLINES_KEY = 'tavonlex_course_outlines';

// Initialize courses storage
export function initializeCourses() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(COURSES_KEY)) {
    localStorage.setItem(COURSES_KEY, JSON.stringify([]));
  }
  if (!localStorage.getItem(COURSE_OUTLINES_KEY)) {
    localStorage.setItem(COURSE_OUTLINES_KEY, JSON.stringify([]));
  }
}

// Get all courses for a user
export function getUserCourses(userId: string): Course[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(COURSES_KEY);
  const courses = data ? JSON.parse(data) : [];
  return courses.filter((c: Course) => c.userId === userId);
}

// Get all courses (public)
export function getAllCourses(): Course[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(COURSES_KEY);
  return data ? JSON.parse(data) : [];
}

// Create a new course
export function createCourse(
  userId: string,
  title: string,
  ageGroup: string,
  price: number,
  introVideoUrl: string,
  courseOutline: string,
): Course {
  const courses = getAllCourses();
  
  const newCourse: Course = {
    id: `course_${Date.now()}`,
    userId,
    title,
    ageGroup,
    price,
    introVideoUrl,
    courseOutline,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  courses.push(newCourse);
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));

  return newCourse;
}

// Update course
export function updateCourse(courseId: string, updates: Partial<Course>): Course {
  const courses = getAllCourses();
  const index = courses.findIndex((c: Course) => c.id === courseId);

  if (index === -1) {
    throw new Error('Course not found');
  }

  const updatedCourse = { 
    ...courses[index], 
    ...updates,
    updatedAt: new Date().toISOString()
  };
  courses[index] = updatedCourse;
  localStorage.setItem(COURSES_KEY, JSON.stringify(courses));

  return updatedCourse;
}

// Delete course
export function deleteCourse(courseId: string): void {
  const courses = getAllCourses();
  const filtered = courses.filter((c: Course) => c.id !== courseId);
  localStorage.setItem(COURSES_KEY, JSON.stringify(filtered));

  // Delete associated outlines
  const outlines = getAllCourseOutlines();
  const filteredOutlines = outlines.filter(o => o.courseId !== courseId);
  localStorage.setItem(COURSE_OUTLINES_KEY, JSON.stringify(filteredOutlines));
}

// Get course by ID
export function getCourse(courseId: string): Course | undefined {
  const courses = getAllCourses();
  return courses.find((c: Course) => c.id === courseId);
}

// Get all course outlines
export function getAllCourseOutlines(): CourseOutline[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(COURSE_OUTLINES_KEY);
  return data ? JSON.parse(data) : [];
}

// Get outlines for a specific course
export function getCourseOutlines(courseId: string): CourseOutline[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(COURSE_OUTLINES_KEY);
  const outlines = data ? JSON.parse(data) : [];
  return outlines.filter((o: CourseOutline) => o.courseId === courseId);
}

// Create course outline
export function createCourseOutline(
  courseId: string,
  title: string,
  videoUrl: string,
  description: string
): CourseOutline {
  const outlines = getAllCourseOutlines();

  const newOutline: CourseOutline = {
    id: `outline_${Date.now()}`,
    courseId,
    title,
    videoUrl,
    description,
    createdAt: new Date().toISOString(),
  };

  outlines.push(newOutline);
  localStorage.setItem(COURSE_OUTLINES_KEY, JSON.stringify(outlines));

  return newOutline;
}

// Update course outline
export function updateCourseOutline(outlineId: string, updates: Partial<CourseOutline>): CourseOutline {
  const outlines = getAllCourseOutlines();
  const index = outlines.findIndex(o => o.id === outlineId);

  if (index === -1) {
    throw new Error('Outline not found');
  }

  const updatedOutline = { ...outlines[index], ...updates };
  outlines[index] = updatedOutline;
  localStorage.setItem(COURSE_OUTLINES_KEY, JSON.stringify(outlines));

  return updatedOutline;
}

// Delete course outline
export function deleteCourseOutline(outlineId: string): void {
  const outlines = getAllCourseOutlines();
  const filtered = outlines.filter(o => o.id !== outlineId);
  localStorage.setItem(COURSE_OUTLINES_KEY, JSON.stringify(filtered));
}
