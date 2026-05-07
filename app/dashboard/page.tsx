'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/auth';
import { getUserCourses } from '@/lib/courses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const featuredCourse = courses.length > 0 ? courses[courses.length - 1] : null; // or latest course
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      const userCourses = getUserCourses(currentUser.id);
      setCourses(userCourses);
    }
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-primary mb-2">Welcome, {user.firstName}!</h1>
        <p className="text-muted-foreground">Manage your teaching profile and courses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{courses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4.8</div>
            <p className="text-xs text-muted-foreground mt-1">Based on student reviews</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">Active</div>
            <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
          </CardContent>
        </Card>
      </div>
        
{featuredCourse?.introVideoUrl && (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Continue Learning</CardTitle>
      <CardDescription>Featured course preview</CardDescription>
    </CardHeader>

    <CardContent>
      <div className="grid md:grid-cols-3 gap-6">

        {/* 🎬 VIDEO */}
        <div className="md:col-span-2">
          <div className="w-full aspect-video rounded-xl overflow-hidden shadow">
            <iframe
              src={getYouTubeEmbedUrl(featuredCourse.introVideoUrl)}
              className="w-full h-full"
              title={featuredCourse.title}
              allowFullScreen
            />
          </div>

          <h3 className="text-lg font-semibold mt-3">
            {featuredCourse.title}
          </h3>

          {/* 📄 COURSE OUTLINE */}
          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">
            {featuredCourse.courseOutline}
          </p>
        </div>

        {/* 📌 INFO PANEL */}
        <div className="space-y-3">

          <div className="p-3 border rounded-lg">
            <p className="text-sm font-medium">Course</p>
            <p className="text-muted-foreground text-sm">
              {featuredCourse.title}
            </p>
          </div>

          {/* 💰 PRICE */}
          <div className="p-3 border rounded-lg">
            <p className="text-sm font-medium">Price</p>
            <p className="text-muted-foreground text-sm">
              ${featuredCourse.price}
            </p>
          </div>

          <a href={`/dashboard/courses/${featuredCourse.id}`}>
            <button className="w-full bg-black text-white py-2 rounded-lg">
              Continue Course
            </button>
          </a>

        </div>

      </div>
    </CardContent>
  </Card>
)}

        
    </div>
  );
}
