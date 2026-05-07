'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCurrentUser, getAllUsers } from '@/lib/auth';
import { getAllCourses } from '@/lib/courses';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getYouTubeEmbedUrl } from '@/lib/youtube';
export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    const allCourses = getAllCourses();
    setCourses(allCourses.slice(0, 6)); // Show first 6 courses
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background">
      {/* Header */}
      <header className="border-b border-border">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            Welton
          </Link>
          <div className="flex gap-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-balance">
            Connect, Teach & Inspire
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
            Join Welton and manage your online courses with ease. Reach students worldwide and grow your teaching career.
          </p>
          {!user && (
            <div className="flex gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg">Become a Tutor</Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline">Sign In</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Easy Course Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Create, organize, and manage your courses with our intuitive platform.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Connect with students through video lessons and interactive course modules.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Secure Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get paid for your work with secure payment processing and transparent earnings.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Featured Courses */}
        {courses.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold mb-8 text-center">Featured Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => {
                const tutor = getAllUsers().find(u => u.id === course.userId);
           const isEnrolled = Array.isArray(user?.purchasedCourses)
  ? user.purchasedCourses.includes(course.id)
  : false;
                return (
                  <Card key={course.id} className="hover:border-primary/50 transition-colors">
  <CardHeader>
    <CardTitle className="line-clamp-2">{course.title}</CardTitle>
    <CardDescription>
      {tutor?.firstName} {tutor?.lastName}
    </CardDescription>
  </CardHeader>

  <CardContent className="space-y-4">

    {/* 🎬 INTRO VIDEO (PUBLIC PREVIEW) */}
    <div className="w-full aspect-video rounded-md overflow-hidden">
      <iframe
        src={getYouTubeEmbedUrl(course.introVideoUrl)}
        title="Course Intro"
        className="w-full h-full"
        allowFullScreen
      />
    </div>

    {/* INFO */}
    <div>
      <p className="text-sm text-muted-foreground mb-2">Age Group</p>
      <p className="font-semibold">{course.ageGroup}</p>
    </div>

    <div>
      <p className="text-sm text-muted-foreground mb-2">Price</p>
      <p className="text-2xl font-bold text-primary">${course.price}</p>
    </div>

    {/* 📌 OUTLINE PREVIEW (NO VIDEO PLAY) */}
    <div>
      <p className="text-sm text-muted-foreground mb-2">Course Outline</p>
      <p className="text-sm line-clamp-3">
        {course.courseOutline}
      </p>
    </div>

    {/* 🔐 BUTTON LOGIC */}
    {user ? (
      <Button className="w-full">
        {user?.purchasedCourses?.includes(course.id)
          ? "Continue Learning"
          : "Enroll to Access Full Course"}
      </Button>
    ) : (
      <Button className="w-full" asChild>
        <Link href="/auth/login">Login to Enroll</Link>
      </Button>
    )}

  </CardContent>
</Card>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Share Your Knowledge?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start teaching and earning today on Welton.
          </p>
          {!user && (
            <Link href="/auth/register">
              <Button size="lg">Create Your Account</Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 Welton. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
