'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { getCourse, updateCourse, getCourseOutlines, deleteCourseOutline, createCourseOutline } from '@/lib/courses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getYouTubeEmbedUrl } from "@/lib/youtube";

import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [outlines, setOutlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [addingOutline, setAddingOutline] = useState(false);
  const [message, setMessage] = useState('');
  const [outlineForm, setOutlineForm] = useState({
    title: '',
    videoUrl: '',
    description: '',
  });
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    introVideoUrl: '',
    courseOutline: '',
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const courseData = getCourse(courseId);
      if (courseData && courseData.userId === currentUser.id) {
        setCourse(courseData);
        setCurrentVideo(courseData.introVideoUrl)
        setFormData({
          title: courseData.title,
          price: courseData.price.toString(),
          introVideoUrl: courseData.introVideoUrl,
          courseOutline: courseData.courseOutline,
        });
        setOutlines(getCourseOutlines(courseId));
      } else {
        router.push('/dashboard/courses');
      }
    }
    setLoading(false);
  }, [courseId, router]);
useEffect(() => {
  if (!course?.id) return;

  const saved = localStorage.getItem(`progress-${course.id}`);
  if (saved) {
    setCompletedLessons(JSON.parse(saved));
  }
}, [course?.id]);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOutlineInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setOutlineForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveCourse = () => {
    if (!course) return;

    try {
      updateCourse(course.id, {
        title: formData.title,
        price: parseFloat(formData.price),
        introVideoUrl: formData.introVideoUrl,
        courseOutline: formData.courseOutline,
      });

      setCourse({
        ...course,
        title: formData.title,
        price: parseFloat(formData.price),
        introVideoUrl: formData.introVideoUrl,
        courseOutline: formData.courseOutline,
      });

      setEditing(false);
      setMessage('Course updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update course');
    }
  };

  const handleAddOutline = () => {
    if (!course || !outlineForm.title || !outlineForm.videoUrl || !outlineForm.description) {
      setMessage('Please fill in all outline fields');
      return;
    }

    try {
      const newOutline = createCourseOutline(
        course.id,
        outlineForm.title,
        outlineForm.videoUrl,
        outlineForm.description
      );

      setOutlines([...outlines, newOutline]);
      setOutlineForm({ title: '', videoUrl: '', description: '' });
      setAddingOutline(false);
      setMessage('Outline added successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to add outline');
    }
  };

  const handleDeleteOutline = (outlineId: string) => {
    deleteCourseOutline(outlineId);
    setOutlines(outlines.filter(o => o.id !== outlineId));
    setMessage('Outline deleted');
    setTimeout(() => setMessage(''), 3000);
  };

const toggleComplete = (lessonId: string) => {
  if (!course) return;

  let isNewComplete = false;

  setCompletedLessons(prev => {
    let updated;

    if (prev.includes(lessonId)) {
      updated = prev.filter(id => id !== lessonId);
    } else {
      updated = [...prev, lessonId];
      isNewComplete = true;
    }

    localStorage.setItem(`progress-${course.id}`, JSON.stringify(updated));
    return updated;
  });

  // 👉 run AFTER state logic
  const nextIndex = outlines.findIndex(l => l.id === lessonId) + 1;

  if (isNewComplete && outlines[nextIndex]) {
    setCurrentVideo(outlines[nextIndex].videoUrl);
  }
};

 
  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !course) {
    return <div>Course not found</div>;
  }
const progress =
  outlines.length > 0
    ? Math.round((completedLessons.length / outlines.length) * 100)
    : 0;  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">Manage course details and outlines</p>
        </div>
        <Link href="/dashboard/courses">
          <Button variant="outline">Back to Courses</Button>
        </Link>
      </div>

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Course Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>Update your course information</CardDescription>
        </CardHeader>
        <CardContent>
          {!editing ? (
      
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Title</Label>
                <p className="text-lg">{course.title}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Age Group</Label>
                <p className="text-lg">{course.ageGroup}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Price</Label>
                <p className="text-lg">${course.price}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Introduction Video</Label>
                <a href={course.introVideoUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  {course.introVideoUrl}
                </a>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Outline</Label>
                <p className="text-sm whitespace-pre-wrap">{course.courseOutline}</p>
              </div>
              <Button onClick={() => setEditing(true)}>Edit Course</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="introVideoUrl">Introduction Video URL</Label>
                <Input
                  id="introVideoUrl"
                  name="introVideoUrl"
                  value={formData.introVideoUrl}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseOutline">Course Outline</Label>
                <textarea
                  id="courseOutline"
                  name="courseOutline"
                  value={formData.courseOutline}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  rows={6}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveCourse}>Save Changes</Button>
                <Button variant="outline" onClick={() => {
                  setEditing(false);
                  setFormData({
                    title: course.title,
                    price: course.price.toString(),
                    introVideoUrl: course.introVideoUrl,
                    courseOutline: course.courseOutline,
                  });
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
   {/* WRAPPER */}
<div className="space-y-4">

  {/* ✅ PROGRESS BAR (FULL WIDTH ABOVE GRID) */}
  <div>
    <p className="text-sm font-medium mb-1">
      Progress: {progress}%
    </p>

    <div className="w-full bg-gray-200 h-2 rounded">
      <div
        className="bg-green-500 h-2 rounded"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>

  {/* ✅ GRID */}
  <div className="grid md:grid-cols-3 gap-6">

    {/* 🎬 LEFT: VIDEO */}
    <div className="md:col-span-2">
      <div className="w-full aspect-video rounded-xl overflow-hidden shadow">
        <iframe
          src={getYouTubeEmbedUrl(currentVideo ?? course.introVideoUrl)}
          title="Course Video"
          className="w-full h-full"
          allowFullScreen
        />
      </div>

      <h2 className="text-xl font-semibold mt-4">
        {course.title}
      </h2>

      <p className="text-sm text-gray-500">
        {course.courseOutline}
      </p>
    </div>

    {/* 📌 RIGHT: OUTLINES */}
    <div className="bg-white rounded-xl shadow p-4 space-y-3">
      <h3 className="font-semibold text-lg">Course Content</h3>

      <div className="space-y-2">
        {outlines.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center justify-between p-2 border rounded hover:bg-gray-100"
          >
            <div
              onClick={() => setCurrentVideo(lesson.videoUrl)}
              className={`cursor-pointer flex-1 ${
                currentVideo === lesson.videoUrl
                  ? "text-blue-600 font-semibold"
                  : ""
              }`}
            >
              <p>{lesson.title}</p>
            </div>

            <button
              onClick={() => toggleComplete(lesson.id)}
              className={`text-xs px-2 py-1 rounded ${
                completedLessons.includes(lesson.id)
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {completedLessons.includes(lesson.id) ? "Done" : "Mark"}
            </button>
          </div>
        ))}
      </div>
    </div>

  </div>
</div>
      {/* Course Outlines Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Outlines</CardTitle>
              <CardDescription>Video lessons and modules</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setAddingOutline(!addingOutline)}
            >
              {addingOutline ? 'Cancel' : 'Add Outline'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {addingOutline && (
            <div className="border border-border rounded-lg p-4 space-y-4 bg-accent/5">
              <h4 className="font-semibold">Add New Outline</h4>
              <div className="space-y-2">
                <Label htmlFor="outline-title">Title</Label>
                <Input
                  id="outline-title"
                  name="title"
                  placeholder="Lesson title"
                  value={outlineForm.title}
                  onChange={handleOutlineInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outline-video">Video URL (YouTube)</Label>
                <Input
                  id="outline-video"
                  name="videoUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={outlineForm.videoUrl}
                  onChange={handleOutlineInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outline-description">Description</Label>
                <textarea
                  id="outline-description"
                  name="description"
                  placeholder="Describe this lesson..."
                  value={outlineForm.description}
                  onChange={handleOutlineInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                  rows={3}
                />
              </div>
              <Button onClick={handleAddOutline}>Add Outline</Button>
            </div>
          )}

          {outlines.length === 0 ? (
  <p className="text-muted-foreground text-center py-4">
    No outlines yet
  </p>
) : (
  <div className="space-y-4">
    {outlines.map((outline) => (
      <div
        key={outline.id}
        className="border border-border rounded-lg p-4"
      >
        <div className="flex items-start justify-between gap-4">

          {/* LEFT CONTENT */}
          <div className="flex-1">

            {/* 🎬 CLICK TO PLAY */}
            <div
              onClick={() => setCurrentVideo(outline.videoUrl)}
              className="cursor-pointer"
            >
              <h4 className="font-semibold hover:underline">
                {outline.title}
              </h4>
            </div>

            <p className="text-sm text-muted-foreground">
              {outline.description}
            </p>

            <a
              href={outline.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline mt-2 inline-block"
            >
              View Video
            </a>
          </div>

          {/* RIGHT SIDE ACTIONS */}
          <div className="flex flex-col gap-2 items-end">

            {/* ✅ COMPLETE BUTTON */}
            <button
              onClick={() => toggleComplete(outline.id)}
              className={`text-xs px-2 py-1 rounded ${
                completedLessons.includes(outline.id)
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              {completedLessons.includes(outline.id) ? "Done" : "Mark"}
            </button>

            {/* 🗑 DELETE */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  Delete
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Outline</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this lesson outline?
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="flex justify-end gap-2">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteOutline(outline.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>

          </div>
        </div>
      </div>
    ))}
  </div>
)}
        </CardContent>
      </Card>
    </div>
  );
}
