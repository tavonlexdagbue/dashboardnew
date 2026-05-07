// Validation schemas using regex patterns (Zod not needed for simple validation)

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateRegisterForm = (data: any): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.firstName?.trim()) {
    errors.firstName = 'First name is required';
  }
  if (!data.lastName?.trim()) {
    errors.lastName = 'Last name is required';
  }
  if (!validateEmail(data.email || '')) {
    errors.email = 'Valid email is required';
  }
  if (!data.password) {
    errors.password = 'Password is required';
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.errors[0];
    }
  }
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  if (!data.course) {
    errors.course = 'Course is required';
  }
  if (!data.ageGroup) {
    errors.ageGroup = 'Age group is required';
  }
  if (!data.yearsExperience) {
    errors.yearsExperience = 'Years of experience is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateLoginForm = (data: any): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!validateEmail(data.email || '')) {
    errors.email = 'Valid email is required';
  }
  if (!data.password) {
    errors.password = 'Password is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCourseForm = (data: any): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.title?.trim()) {
    errors.title = 'Course title is required';
  }
  if (!data.ageGroup) {
    errors.ageGroup = 'Age group is required';
  }
  if (!data.price || isNaN(parseFloat(data.price))) {
    errors.price = 'Valid price is required';
  }
  if (!data.introVideoUrl?.trim()) {
    errors.introVideoUrl = 'YouTube video URL is required';
  } else if (!isValidYoutubeUrl(data.introVideoUrl)) {
    errors.introVideoUrl = 'Invalid YouTube URL';
  }
  if (!data.courseOutline?.trim()) {
    errors.courseOutline = 'Course outline is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateCourseOutlineForm = (data: any): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.title?.trim()) {
    errors.title = 'Title is required';
  }
  if (!data.videoUrl?.trim()) {
    errors.videoUrl = 'Video URL is required';
  } else if (!isValidYoutubeUrl(data.videoUrl)) {
    errors.videoUrl = 'Invalid YouTube URL';
  }
  if (!data.description?.trim()) {
    errors.description = 'Description is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

export const validateAccountDetailsForm = (data: any): { valid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.bankName?.trim()) {
    errors.bankName = 'Bank name is required';
  }
  if (!data.bankAccountNumber?.trim()) {
    errors.bankAccountNumber = 'Account number is required';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
};

const isValidYoutubeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be');
  } catch {
    return false;
  }
};
