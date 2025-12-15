import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address').min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
});

export const chatSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(50, 'Group name must be less than 50 characters'),
});

export const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000, 'Message is too long'),
});

export const validateForm = (schema, data) => {
  try {
    schema.parse(data);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.reduce((acc, err) => {
          acc[err.path[0]] = err.message;
          return acc;
        }, {})
      };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeEmail = (email) => {
  return email.toLowerCase().trim();
};

export const sanitizeName = (name) => {
  return name.trim().replace(/[^a-zA-Z\s]/g, '').substring(0, 50);
};

export const createEmailRules = () => [
  { required: true, message: 'Please enter your email address' },
  { type: 'email', message: 'Please enter a valid email address' },
];

export const createPasswordRules = (minLength = 6) => [
  { required: true, message: 'Please enter your password' },
  { min: minLength, message: `Password must be at least ${minLength} characters` },
];

export const createNameRules = () => [
  { required: true, message: 'Please enter your name' },
  { min: 2, message: 'Name must be at least 2 characters' },
  { max: 50, message: 'Name must be less than 50 characters' },
];

export const createRequiredRules = (fieldName) => [
  { required: true, message: `Please enter ${fieldName}` },
];