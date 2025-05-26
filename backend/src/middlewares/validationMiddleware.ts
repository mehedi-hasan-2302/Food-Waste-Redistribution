import { Request, Response, NextFunction } from 'express'
import { ObjectSchema } from 'joi'

export const validateRequestBody = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body)
    if (error) {
      res.status(422).json({ message: error.details[0].message })
      return 
    }
    next()
  }
}