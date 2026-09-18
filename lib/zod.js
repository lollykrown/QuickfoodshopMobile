import { z } from 'zod';


export const signupSchema = z
  .object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().trim().email('Invalid email address'),
    phone: z
      .string()
      .min(10, 'Phone number is too short')
      .regex(/^\+?\d+$/, 'Invalid phone number'),
    password: z.string().min(6, 'Minimum 6 characters'),
    confirmPassword: z.string().min(6, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const editProfileSchema = z
  .object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    phoneNumber: z
      .string()
      .min(10, 'Phone number is too short')
      .regex(/^\+?\d+$/, 'Invalid phone number'),
  })

export const pwdResetSchema = z
  .object({
    password: z
      .string()
      .min(6, { message: 'Minimum 6 characters' }),

    confirmPassword: z
      .string()
      .min(6, { message: 'Confirm your password' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export const pwdChngSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, { message: 'Password is incorrect' }),
    newPassword: z
      .string()
      .min(6, { message: 'Minimum 6 characters' }),
    confirmPassword: z
      .string()
      .min(6, { message: 'Confirm your password' }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });