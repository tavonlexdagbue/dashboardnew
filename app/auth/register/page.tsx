import { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/register-form';

export const metadata: Metadata = {
  title: 'Register - Tavonlex Tutors',
  description: 'Create your tutor account on Tavonlex',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-primary mb-2">Tavonlex</h1>
          <p className="text-muted-foreground">Professional Teaching Platform</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
