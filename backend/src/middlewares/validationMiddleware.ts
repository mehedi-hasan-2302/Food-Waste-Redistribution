import { Request, Response, NextFunction } from 'express'
import { sendErrorResponse } from '../utils/responseHelper'
import { ObjectSchema } from 'joi'

export const validateRequestBody = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body)
    if (error) {
      sendErrorResponse(res, error.details[0].message, 422)
      return 
    }
    next()
  }
}