import { Response } from 'express'

export const sendSuccessResponse = (
  res: Response,
  data: any,
  message = 'Operation successful'
) => {
  return res.status(200).json({
    status: 'success',
    message,
    data,
  })
}

export const sendErrorResponse = (
  res: Response,
  message = 'Something went wrong',
  statusCode = 500
) => {
  return res.status(statusCode).json({
    status: 'error',
    message,
  })
}
