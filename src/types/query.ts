/**
 * Data types and models for the query form system
 */

export interface QueryFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  company?: string;
  consent: boolean;
}

export interface QueryWithMetadata extends QueryFormData {
  id: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
  id?: string;
}

export interface SubmissionError {
  field?: string;
  message: string;
  code: string;
}

export enum QuerySubject {
  PRODUCT_INQUIRY = 'Product Inquiry',
  WHOLESALE_INQUIRY = 'Wholesale Inquiry',
  SUBSCRIPTION = 'Subscription',
  TECHNICAL_SUPPORT = 'Technical Support',
  GENERAL_QUESTION = 'General Question',
  OTHER = 'Other',
}

export const QUERY_SUBJECTS = Object.values(QuerySubject);

export const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Name must be 2-100 characters with only letters, spaces, hyphens, and apostrophes',
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  phone: {
    pattern: /^[\d\s\-\+\(\)]+$/,
    message: 'Phone number contains invalid characters',
  },
  message: {
    minLength: 10,
    maxLength: 5000,
    message: 'Message must be 10-5000 characters',
  },
  subject: {
    required: true,
    message: 'Please select a subject',
  },
};
