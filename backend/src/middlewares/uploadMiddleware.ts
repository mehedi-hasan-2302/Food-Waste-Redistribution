import multer from 'multer'
import { ValidationError } from '../utils/errors'
import logger from '../utils/logger'


const storage = multer.memoryStorage()


const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  
  if (allowedTypes.includes(file.mimetype)) {
    logger.info('Accepted file upload', { mimetype: file.mimetype, filename: file.originalname })
    cb(null, true)
  } else {
    logger.warn('Rejected file upload', { mimetype: file.mimetype, filename: file.originalname })
    cb(new ValidationError('Only JPEG, PNG, and WebP images are allowed'))
  }
}

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
})