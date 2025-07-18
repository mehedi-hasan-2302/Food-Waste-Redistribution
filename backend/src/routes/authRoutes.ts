import { Router } from 'express'
import { signup, login, verifyEmail, requestForgotPasswordReset, resetPassword, changePassword } from '../controllers/authController'
import { validateRequestBody } from '../middlewares/validationMiddleware'
import { signupSchema, loginSchema, verifyEmailSchema, requestPasswordResetSchema, resetPasswordSchema, changePasswordSchema } from '../validations/authValidation'
import { authLimiter } from '../utils/rateLimiter'
import { verifyToken } from '../middlewares/authMiddleware'


const router = Router()

router.post('/signup', authLimiter, validateRequestBody(signupSchema), signup)
router.post('/login', authLimiter, validateRequestBody(loginSchema), login)
router.post('/verify-email', authLimiter, validateRequestBody(verifyEmailSchema), verifyEmail)
router.post('/request-password-reset', validateRequestBody(requestPasswordResetSchema), requestForgotPasswordReset)
router.post('/reset-password', validateRequestBody(resetPasswordSchema), resetPassword)
router.post('/change-password', verifyToken, validateRequestBody(changePasswordSchema), changePassword)


export default router