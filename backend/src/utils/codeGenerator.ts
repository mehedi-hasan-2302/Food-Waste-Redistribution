import { randomBytes } from 'crypto'

/**
 * Generates a unique alphanumeric code for pickup verification
 * @param length - Length of the code to generate (default: 8)
 * @returns A unique uppercase alphanumeric code
 */
export function generateUniqueCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  

  const bytes = randomBytes(length)
  
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length]
  }
  
  return result
}

/**
 * Generates a unique order reference number
 * @returns A formatted order reference (e.g., ORD-20241201-ABC123)
 */
export function generateOrderReference(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const code = generateUniqueCode(6)
  return `ORD-${date}-${code}`
}

/**
 * Generates a unique delivery tracking number
 * @returns A formatted delivery tracking number (e.g., DEL-ABC12345)
 */
export function generateDeliveryTrackingNumber(): string {
  const code = generateUniqueCode(8)
  return `DEL-${code}`
}