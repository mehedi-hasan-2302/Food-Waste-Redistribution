import cloudinary from '../config/cloudinary'
import { UploadApiResponse } from 'cloudinary'
import logger from './logger'
import streamifier from 'streamifier'

export interface ImageUploadResult {
  url: string
  publicId: string
  width: number
  height: number
}

export async function uploadImageToCloudinary(
  file: Express.Multer.File,
  folder: string = 'food-listings'
): Promise<ImageUploadResult> {
  try {
   
    const streamUpload = (): Promise<UploadApiResponse> => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: folder,
            transformation: [
              { width: 800, height: 600, crop: 'limit' },
              { quality: 'auto:good' },
              { format: 'auto' }
            ]
          },
          (error, result) => {
            if (result) {
              resolve(result as UploadApiResponse)
            } else {
              reject(error)
            }
          }
        )
        streamifier.createReadStream(file.buffer).pipe(stream)
      })
    }
    const result: UploadApiResponse = await streamUpload()
    logger.info('Image uploaded to Cloudinary', { file: file.originalname, url: result.secure_url })

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    }
  } catch (error) {
    logger.error('Image upload to Cloudinary failed', { error })
    throw new Error(`Image upload failed: ${error}`)
  }
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
    logger.info('Image deleted from Cloudinary', { publicId })
  } catch (error) {
    logger.error('Failed to delete image from Cloudinary', { error, publicId })
  }
}