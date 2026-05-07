'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { createCourse } from '@/lib/courses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateCourseForm } from '@/lib/validations';
import { getYouTubeEmbedUrl } from '@/lib/youtube';

const AGE_GROUPS = ['5-7', '8-10', '11-13', '14-16', '17-18', '18+'];

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    ageGroup: '',
    price: '',
    introVideoUrl: '',
    courseOutline: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setErrors({});

    const validation = validateCourseForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        setServerError('User not found');
        return;
      }

      const course = createCourse(
        user.id,
        formData.title,
        formData.ageGroup,
        parseFloat(formData.price),
        formData.introVideoUrl,
        formData.courseOutline
      );

      router.push(`/dashboard/courses/${course.id}`);
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground">Add a new course to your teaching portfolio</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course Information</CardTitle>
          <CardDescription>Enter the basic details for your course</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {serverError && (
              <Alert variant="destructive">
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Course Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Advanced Mathematics for High School"
                value={formData.title}
                onChange={handleInputChange}
                error={!!errors.title}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ageGroup">Target Age Group</Label>
                <select
                  id="ageGroup"
                  name="ageGroup"
                  value={formData.ageGroup}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Select age group</option>
                  {AGE_GROUPS.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                {errors.ageGroup && <p className="text-xs text-destructive">{errors.ageGroup}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Course Price ($)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="99.99"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  error={!!errors.price}
                />
                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
              </div>
            </div>

            <div className="space-y-2">
  <Label htmlFor="introVideoUrl">Introduction Video URL (YouTube)</Label>
  <Input
    id="introVideoUrl"
    name="introVideoUrl"
    placeholder="https://www.youtube.com/watch?v=..."
    value={formData.introVideoUrl}
    onChange={handleInputChange}
    error={!!errors.introVideoUrl}
  />
  {errors.introVideoUrl && (
    <p className="text-xs text-destructive">{errors.introVideoUrl}</p>
  )}
  <p className="text-xs text-muted-foreground">
    Share a YouTube link to your course introduction
  </p>

  {/* ✅ VIDEO PREVIEW GOES HERE */}
  {formData.introVideoUrl && (
    <div className="w-full aspect-video rounded-xl overflow-hidden shadow mt-3">
      <iframe
        src={getYouTubeEmbedUrl(formData.introVideoUrl)}
        title="Course Intro Video"
        className="w-full h-full"
        allowFullScreen
      />
    </div>
  )}
</div>

            <div className="space-y-2">
              <Label htmlFor="courseOutline">Course Outline</Label>
              <textarea
                id="courseOutline"
                name="courseOutline"
                placeholder="Describe what students will learn in this course..."
                value={formData.courseOutline}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows={6}
              />
              {errors.courseOutline && <p className="text-xs text-destructive">{errors.courseOutline}</p>}
            </div>

            <div className="bg-accent/10 p-4 rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Commission Information</h4>
              <p className="text-sm text-muted-foreground">
                A 4% commission will be applied to all course earnings. You'll earn: <span className="font-semibold text-foreground">${(parseFloat(formData.price || 0) * 0.96).toFixed(2)} per sale</span>
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Course'}
              </Button>
              <Link href="/dashboard/courses">
                <Button variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
