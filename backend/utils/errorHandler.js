import { HTTP_STATUS } from './constants.js';

// Custom Error Classes
export class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, HTTP_STATUS.BAD_REQUEST);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, HTTP_STATUS.UNAUTHORIZED);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Not authorized to access this resource') {
    super(message, HTTP_STATUS.FORBIDDEN);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND);
    this.name = 'NotFoundError';
  }
}

// Error response helper
export const createErrorResponse = (error, req) => {
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = error.message || 'Something went wrong';

  // Log error for debugging (in development)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: error.message,
      stack: error.stack,
      url: req?.originalUrl,
      method: req?.method,
      ip: req?.ip,
      userAgent: req?.get('User-Agent'),
    });
  }

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  const errorResponse = {
    success: false,
    message,
    ...(isDevelopment && {
      stack: error.stack,
      error: error.name
    }),
    timestamp: new Date().toISOString(),
  };

  return { statusCode, errorResponse };
};

// Async error wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Validation helper
export const validateRequired = (fields, data) => {
  const missing = fields.filter(field => !data[field]);
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
  }
};

// Sanitization helpers
export const sanitizeString = (str, maxLength = 255) => {
  if (typeof str !== 'string') return str;
  return str.trim().substring(0, maxLength);
};

export const sanitizeEmail = (email) => {
  return email.toLowerCase().trim();
};

export const sanitizeObjectId = (id) => {
  if (!id || typeof id !== 'string') return null;
  return id.trim();
};