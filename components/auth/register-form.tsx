'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { registerUser, initializeUsers, updateUserProfile } from '@/lib/auth';
import { validateRegisterForm } from '@/lib/validations';
import { initializeCourses } from '@/lib/courses';
import { initializeAccountDetails } from '@/lib/accounts';

const COURSES = ['Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'Biology'];
const AGE_GROUPS = ['5-7', '8-10', '11-13', '14-16', '17-18', '18+'];

export function RegisterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    course: '',
    ageGroup: '',
    yearsExperience: '',
    certificates: '',
    coveringLetter: '',
    bankName: '',
    bankAccountNumber: '',
    profilePicture: null as File | null,
    cv: null as File | null,
  });

  // Initialize storage on mount
  if (typeof window !== 'undefined') {
    initializeUsers();
    initializeCourses();
    initializeAccountDetails();
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [name]: file,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setErrors({});

    // Validate form
    const validation = validateRegisterForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      // Register user
      const user = registerUser(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );

      // Update user profile with additional data
      updateUserProfile(user.id, {
        profilePictureUrl: formData.profilePicture ? `profile_${user.id}` : undefined,
        cvUrl: formData.cv ? `cv_${user.id}` : undefined,
      });

      // Store in a profile details table in localStorage
      const profileData = JSON.parse(localStorage.getItem('tavonlex_profile_details') || '{}');
      profileData[user.id] = {
        ageGroup: formData.ageGroup,
        course: formData.course,
        yearsExperience: formData.yearsExperience,
        certificates: formData.certificates,
        coveringLetter: formData.coveringLetter,
        bankName: formData.bankName,
        bankAccountNumber: formData.bankAccountNumber,
      };
      localStorage.setItem('tavonlex_profile_details', JSON.stringify(profileData));

      // Store file data if provided
      if (formData.profilePicture) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileData = JSON.parse(localStorage.getItem('tavonlex_files') || '{}');
          fileData[`profile_${user.id}`] = e.target?.result;
          localStorage.setItem('tavonlex_files', JSON.stringify(fileData));
        };
        reader.readAsDataURL(formData.profilePicture);
      }

      if (formData.cv) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const fileData = JSON.parse(localStorage.getItem('tavonlex_files') || '{}');
          fileData[`cv_${user.id}`] = e.target?.result;
          localStorage.setItem('tavonlex_files', JSON.stringify(fileData));
        };
        reader.readAsDataURL(formData.cv);
      }

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Your Tutor Account</CardTitle>
        <CardDescription>
          Join Welton and start managing your courses today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Personal Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  error={!!errors.firstName}
                />
                {errors.firstName && <p className="text-xs text-destructive">{errors.firstName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  error={!!errors.lastName}
                />
                {errors.lastName && <p className="text-xs text-destructive">{errors.lastName}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                error={!!errors.email}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={!!errors.password}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  error={!!errors.confirmPassword}
                />
                {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          {/* Teaching Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Teaching Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course</Label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background"
                >
                  <option value="">Select a course</option>
                  {COURSES.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
                {errors.course && <p className="text-xs text-destructive">{errors.course}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ageGroup">Age Group</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Input
                id="yearsExperience"
                name="yearsExperience"
                type="number"
                placeholder="5"
                value={formData.yearsExperience}
                onChange={handleInputChange}
                error={!!errors.yearsExperience}
              />
              {errors.yearsExperience && <p className="text-xs text-destructive">{errors.yearsExperience}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificates">Certificates</Label>
              <textarea
                id="certificates"
                name="certificates"
                placeholder="List your certifications..."
                value={formData.certificates}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coveringLetter">Covering Letter</Label>
              <textarea
                id="coveringLetter"
                name="coveringLetter"
                placeholder="Tell us about yourself..."
                value={formData.coveringLetter}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-input rounded-md bg-background"
                rows={3}
              />
            </div>
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Documents</h3>

            <div className="space-y-2">
              <Label htmlFor="profilePicture">Profile Picture</Label>
              <Input
                id="profilePicture"
                name="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv">CV/Resume</Label>
              <Input
                id="cv"
                name="cv"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Bank Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Bank Details</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  placeholder="Your Bank"
                  value={formData.bankName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  placeholder="Account Number"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
