/**
 * Utility functions for query form handling
 * Can be imported and used in various parts of the application
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone);
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function formatTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

export function formatPhoneDisplay(phone: string): string {
  if (!phone) return 'N/A';
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (digitsOnly.length === 10) {
    return `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6)}`;
  }
  
  return phone;
}

export function truncateMessage(message: string, maxLength: number = 100): string {
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength) + '...';
}

export function generateQueryId(): string {
  return `query-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function isValidQueryData(data: any): boolean {
  return (
    typeof data.name === 'string' &&
    data.name.length > 0 &&
    validateEmail(data.email) &&
    typeof data.subject === 'string' &&
    data.subject.length > 0 &&
    typeof data.message === 'string' &&
    data.message.length >= 10 &&
    data.message.length <= 5000 &&
    data.consent === true
  );
}

export function formatQueryForSheet(data: any): string[] {
  return [
    formatTimestamp(),
    sanitizeInput(data.name),
    sanitizeInput(data.email),
    data.phone ? formatPhoneDisplay(data.phone) : 'N/A',
    sanitizeInput(data.subject),
    data.company ? sanitizeInput(data.company) : 'N/A',
    sanitizeInput(data.message),
  ];
}

export async function submitQueryForm(formData: any): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch('/api/submit-query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    const result = await response.json();

    if (response.ok) {
      return { success: true, id: result.id };
    } else {
      return { success: false, error: result.error || 'Submission failed' };
    }
  } catch (error) {
    console.error('Form submission error:', error);
    return { success: false, error: 'An error occurred while submitting the form' };
  }
}

// Debounce function for form validation
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: ReturnType<typeof setTimeout>;
  
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

// Rate limiting helper
export function createRateLimiter(maxAttempts: number, windowMs: number) {
  const attempts: Map<string, number[]> = new Map();

  return {
    isAllowed(key: string): boolean {
      const now = Date.now();
      const userAttempts = attempts.get(key) || [];
      const recentAttempts = userAttempts.filter(time => now - time < windowMs);

      if (recentAttempts.length >= maxAttempts) {
        return false;
      }

      recentAttempts.push(now);
      attempts.set(key, recentAttempts);
      return true;
    },
    
    reset(key: string): void {
      attempts.delete(key);
    },
  };
}

// Error message generator
export const ErrorMessages = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  MESSAGE_TOO_SHORT: 'Message must be at least 10 characters',
  MESSAGE_TOO_LONG: 'Message cannot exceed 5000 characters',
  NAME_INVALID: 'Name must be 2-100 characters',
  CONSENT_REQUIRED: 'You must agree to be contacted',
  SUBMISSION_FAILED: 'Failed to submit your query. Please try again.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Success message helper
export function getSuccessMessage(queryId: string): string {
  return `✓ Your query (ID: ${queryId}) has been submitted successfully! We'll get back to you soon.`;
}

// Log query event for analytics (optional)
export function logQueryEvent(eventType: string, data?: any): void {
  if (typeof window !== 'undefined' && 'gtag' in window) {
    // Google Analytics integration
    (window as any).gtag('event', eventType, data);
  } else {
    // Fallback: just log to console in development
    console.log(`[Query Event] ${eventType}:`, data);
  }
}
