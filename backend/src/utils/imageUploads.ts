import cloudinary from '../config/cloudinary'
import { UploadApiResponse } from 'cloudinary'

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
    const result: UploadApiResponse = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      transformation: [
        { width: 800, height: 600, crop: 'limit' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ]
    })

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height
    }
  } catch (error) {
    throw new Error(`Image upload failed: ${error}`)
  }
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Failed to delete image from Cloudinary:', error)
  }
}