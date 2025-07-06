import Joi from 'joi'

// SignUp
export const signupSchema = Joi.object({
  Username: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 2 characters',
      'string.max': 'Username must be at most 100 characters',
    }),

  Email: Joi.string()
    .email()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
    }),

  PhoneNumber: Joi.string()
      .pattern(/^[0-9]{11}$/)
      .required()
      .messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Phone number must be a valid 11-digit number',
      }),

  Password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
    }),

  Role: Joi.string()
    .valid(
      'DONOR_SELLER',
      'CHARITY_ORG',
      'BUYER',
      'INDEP_DELIVERY',
      'ORG_VOLUNTEER',
    )
    .required()
    .messages({
      'any.only': 'Invalid role provided',
      'string.empty': 'Role is required',
    }),
})


// Login
export const loginSchema = Joi.object({
   Email: Joi.string()
    .email()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
    }),

  Password: Joi.string()
    .required()
    .messages({
      'string.empty': 'Password is required',
    }),
})


// Verify-Email
export const verifyEmailSchema = Joi.object({
  Email: Joi.string()
    .email()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
    }),
  Code: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.empty': 'Verification code is required',
      'string.length': 'Verification code must be exactly 6 digits',
      'string.pattern.base': 'Verification code must contain only digits',
    }),
})


// Request Password Reset
export const requestPasswordResetSchema = Joi.object({
   Email: Joi.string()
    .email()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
    }),
})



// Reset Password
export const resetPasswordSchema = Joi.object({
   Email: Joi.string()
    .email()
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
    .required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Email must be a valid email address',
    }),
  Code: Joi.string()
    .length(6)
    .pattern(/^[0-9]{6}$/)
    .required()
    .messages({
      'string.empty': 'Verification code is required',
      'string.length': 'Verification code must be exactly 6 digits',
      'string.pattern.base': 'Verification code must contain only digits',
    }),
  Password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
    }),
  ConfirmPassword: Joi.string()
    .valid(Joi.ref('Password'))
    .required()
    .messages({
      'string.empty': 'Confirm password is required',
      'any.only': 'Passwords do not match',
    }),
})
