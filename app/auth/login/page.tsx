import { Metadata } from 'next';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Sign In - Tavonlex Tutors',
  description: 'Sign in to your Tavonlex tutor account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Tavonlex</h1>
          <p className="text-muted-foreground">Professional Teaching Platform</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
