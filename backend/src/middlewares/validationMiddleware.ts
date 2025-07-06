import { Request, Response, NextFunction } from 'express'
import { sendErrorResponse } from '../utils/responseHelper'
import { ObjectSchema } from 'joi'
import logger from '../utils/logger'

export const validateRequestBody = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body)
    if (error) {
      logger.warn('Validation error in request body', { path: req.path, message: error.details[0].message })
      sendErrorResponse(res, error.details[0].message, 422)
      return 
    }
    next()
  }
}