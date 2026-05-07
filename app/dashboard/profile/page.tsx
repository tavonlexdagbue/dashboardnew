'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, updateUserProfile, deleteUser } from '@/lib/auth';
import { deleteAllUserData } from '@/lib/accounts';
import { deleteCourse } from '@/lib/courses';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
      });

      // Get profile details
      const profileDetails = JSON.parse(localStorage.getItem('tavonlex_profile_details') || '{}');
      setProfileData(profileDetails[currentUser.id] || {});
    }
    setLoading(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      updateUserProfile(user.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      setUser({
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      setEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    if (!user) return;

    // Delete all user data
    deleteAllUserData(user.id);

    // Delete all courses
    const courses = JSON.parse(localStorage.getItem('tavonlex_courses') || '[]');
    courses.forEach((course: any) => {
      if (course.userId === user.id) {
        deleteCourse(course.id);
      }
    });

    // Delete user
    deleteUser(user.id);

    // Redirect to login
    router.push('/auth/login');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your profile information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your basic profile details</CardDescription>
        </CardHeader>
        <CardContent>
          {!editing ? (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">First Name</Label>
                <p className="text-lg">{user.firstName}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Last Name</Label>
                <p className="text-lg">{user.lastName}</p>
              </div>
              <div>
                <Label className="text-xs font-semibold text-muted-foreground">Email</Label>
                <p className="text-lg">{user.email}</p>
              </div>

              {profileData && (
                <>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground">Age Group</Label>
                    <p className="text-lg">{profileData.ageGroup || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground">Course</Label>
                    <p className="text-lg">{profileData.course || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-muted-foreground">Years of Experience</Label>
                    <p className="text-lg">{profileData.yearsExperience || '-'}</p>
                  </div>
                  {profileData.certificates && (
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground">Certificates</Label>
                      <p className="text-sm whitespace-pre-wrap">{profileData.certificates}</p>
                    </div>
                  )}
                  {profileData.coveringLetter && (
                    <div>
                      <Label className="text-xs font-semibold text-muted-foreground">Covering Letter</Label>
                      <p className="text-sm whitespace-pre-wrap">{profileData.coveringLetter}</p>
                    </div>
                  )}
                </>
              )}

              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="opacity-50 cursor-not-allowed"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={() => {
                  setEditing(false);
                  setFormData({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                  });
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Account</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account and all associated data including courses.
                </AlertDialogDescription>
              </AlertDialogHeader>
             <div className="flex justify-end gap-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Account
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
