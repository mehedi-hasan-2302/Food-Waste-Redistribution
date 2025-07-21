import Joi from 'joi'
import { ValidationError } from '../utils/errors'

export const createFoodListingSchema = Joi.object({
  Title: Joi.string()
    .required()
    .min(5)
    .max(100)
    .trim()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title must be at most 100 characters',
    }),

  Description: Joi.string()
    .required()
    .min(10)
    .max(500)
    .trim()
    .messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description must be at most 500 characters',
    }),

  FoodType: Joi.string()
    .required()
    .min(2)
    .max(50)
    .trim()
    .messages({
      'string.empty': 'Food type is required',
      'string.min': 'Food type must be at least 2 characters',
      'string.max': 'Food type must be at most 50 characters',
    }),

  CookedDate: Joi.date()
    .required()
    .messages({
      'date.base': 'Cooked date must be a valid date',
      'any.required': 'Cooked date is required',
      'date.max': 'Cooked date cannot be in the future',
    }),

  PickupWindowStart: Joi.date()
    .required()
    .messages({
      'date.base': 'Pickup window start must be a valid date',
      'any.required': 'Pickup window start is required',
      'date.min': 'Pickup window start cannot be in the past',
    }),

  PickupWindowEnd: Joi.date()
    .optional()
    .min(Joi.ref('PickupWindowStart'))
    .messages({
      'date.base': 'Pickup window end must be a valid date',
      'date.min': 'Pickup window end must be after pickup window start',
    }),

  PickupLocation: Joi.string()
    .optional()
    .max(200)
    .trim()
    .messages({
      'string.max': 'Pickup location must be at most 200 characters',
    }),

  IsDonation: Joi.boolean()
    .required()
    .messages({
      'boolean.base': 'IsDonation must be true or false',
      'any.required': 'IsDonation field is required',
    }),

  Price: Joi.when('IsDonation', {
    is: false,
    then: Joi.number().strict(false)
      .required()
      .min(0.01)
      .precision(2)
      .messages({
        'number.base': 'Price must be a valid number',
        'any.required': 'Price is required when not a donation',
        'number.min': 'Price must be at least 1tk',
        'number.precision': 'Price can have at most 2 decimal places',
      }),
    otherwise: Joi.number()
      .optional()
      .valid(0, null)
      .messages({
        'any.only': 'Price must be 0 or null for donations',
      })
  }),

  Quantity: Joi.string()
    .optional()
    .max(50)
    .trim()
    .messages({
      'string.max': 'Quantity description must be at most 50 characters',
    }),

  DietaryInfo: Joi.string()
    .optional()
    .max(100)
    .trim()
    .messages({
      'string.max': 'Dietary information must be at most 100 characters',
    }),
})


// Schema for updating food listings
export const updateFoodListingSchema = Joi.object({
  Title: Joi.string()
    .optional()
    .min(5)
    .max(100)
    .trim()
    .messages({
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title must be at most 100 characters',
    }),

  Description: Joi.string()
    .optional()
    .min(10)
    .max(500)
    .trim()
    .messages({
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description must be at most 500 characters',
    }),

  Price: Joi.number().strict(false)
    .optional()
    .min(0.01)
    .max(999999.99)
    .precision(2)
    .messages({
      'number.base': 'Price must be a valid number',
      'number.min': 'Price must be at least $0.01',
      'number.max': 'Price cannot exceed $999,999.99',
      'number.precision': 'Price can have at most 2 decimal places',
    }),

  PickupWindowStart: Joi.date()
    .optional()
    .min('now')
    .messages({
      'date.base': 'Pickup window start must be a valid date',
      'date.min': 'Pickup window start cannot be in the past',
    }),

  PickupWindowEnd: Joi.date()
    .optional()
    .when('PickupWindowStart', {
      is: Joi.exist(),
      then: Joi.date().min(Joi.ref('PickupWindowStart')),
      otherwise: Joi.date()
    })
    .messages({
      'date.base': 'Pickup window end must be a valid date',
      'date.min': 'Pickup window end must be after pickup window start',
    }),

  PickupLocation: Joi.string()
    .optional()
    .max(200)
    .trim()
    .messages({
      'string.max': 'Pickup location must be at most 200 characters',
    }),

  Quantity: Joi.string()
    .optional()
    .max(50)
    .trim()
    .messages({
      'string.max': 'Quantity description must be at most 50 characters',
    }),

  DietaryInfo: Joi.string()
    .optional()
    .max(100)
    .trim()
    .messages({
      'string.max': 'Dietary information must be at most 100 characters',
    }),
})

export const negotiatePriceSchema = Joi.object({
  proposedPrice: Joi.number()
    .required()
    .min(0.01)
    .max(999999.99)
    .precision(2)
    .messages({
      'number.base': 'Proposed price must be a valid number',
      'any.required': 'Proposed price is required',
      'number.min': 'Proposed price must be at least $0.01',
      'number.max': 'Proposed price cannot exceed $999,999.99',
      'number.precision': 'Proposed price can have at most 2 decimal places',
    }),
})

export async function validateFoodListingData(data: any) {
   const { error, value } = createFoodListingSchema.validate(data, { 
    abortEarly: false,
    convert: true 
  });
  if (error) {
    throw new ValidationError(error.details[0].message)
  }

  const cookedDate = new Date(data.CookedDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (cookedDate < yesterday) {
    throw new ValidationError('Food must be cooked within the last 24 hours')
  }

  const pickupStart = new Date(data.PickupWindowStart)
  const maxPickupTime = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  
  if (pickupStart > maxPickupTime) {
    throw new ValidationError('Pickup window cannot be more than 24 hours from now')
  }

  if (data.PickupWindowEnd) {
    const pickupEnd = new Date(data.PickupWindowEnd)
    const minPickupDuration = 60 * 60 * 1000 // 1 hour in milliseconds
    
    if (pickupEnd.getTime() - pickupStart.getTime() < minPickupDuration) {
      throw new ValidationError('Pickup window must be at least 1 hour long')
    }
  }

   return value; 
}