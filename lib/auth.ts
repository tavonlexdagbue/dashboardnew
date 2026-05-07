// Client-side authentication utilities using localStorage
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  cvUrl?: string;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY = 'tavonlex_auth';
const USERS_KEY = 'tavonlex_users';

// Initialize users storage
export function initializeUsers() {
  if (typeof window === 'undefined') return;
  const existing = localStorage.getItem(USERS_KEY);
  if (!existing) {
    localStorage.setItem(USERS_KEY, JSON.stringify([]));
  }
}

// Get all users from storage
export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

// Register a new user
export function registerUser(email: string, password: string, firstName: string, lastName: string): User {
  const users = getAllUsers();
  
  // Check if user already exists
  if (users.some(u => u.email === email)) {
    throw new Error('Email already registered');
  }

  const newUser: User = {
    id: `user_${Date.now()}`,
    email,
    firstName,
    lastName,
  };

  // Store user
  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Store password hash (in production, never do this!)
  const passwords = JSON.parse(localStorage.getItem('tavonlex_passwords') || '{}');
  passwords[newUser.id] = password;
  localStorage.setItem('tavonlex_passwords', JSON.stringify(passwords));

  // Set as current user
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));

  return newUser;
}

// Login user
export function loginUser(email: string, password: string): User {
  const users = getAllUsers();
  const user = users.find(u => u.email === email);

  if (!user) {
    throw new Error('User not found');
  }

  // Check password (in production, never do this!)
  const passwords = JSON.parse(localStorage.getItem('tavonlex_passwords') || '{}');
  if (passwords[user.id] !== password) {
    throw new Error('Invalid password');
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

// Get current user
export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

// Logout user
export function logoutUser(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// Update user profile
export function updateUserProfile(userId: string, updates: Partial<User>): User {
  const users = getAllUsers();
  const index = users.findIndex(u => u.id === userId);

  if (index === -1) {
    throw new Error('User not found');
  }

  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

  return updatedUser;
}

// Delete user
export function deleteUser(userId: string): void {
  const users = getAllUsers();
  const filtered = users.filter(u => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(filtered));

  const passwords = JSON.parse(localStorage.getItem('tavonlex_passwords') || '{}');
  delete passwords[userId];
  localStorage.setItem('tavonlex_passwords', JSON.stringify(passwords));

  localStorage.removeItem(STORAGE_KEY);
}

// Upload file to localStorage (limited storage)
export function uploadFile(userId: string, file: File, type: 'profile' | 'cv'): string {
  const reader = new FileReader();
  
  return new Promise((resolve, reject) => {
    reader.onload = (e) => {
      const data = e.target?.result as string;
      const fileKey = `file_${userId}_${type}_${Date.now()}`;
      localStorage.setItem(fileKey, data);
      resolve(fileKey);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  }) as Promise<string>;
}

// Get file from localStorage
export function getFile(fileKey: string): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(fileKey);
}

// Delete file from localStorage
export function deleteFile(fileKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(fileKey);
}
