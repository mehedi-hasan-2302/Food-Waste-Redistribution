import { Router } from 'express'
import { signup, login, verifyEmail, requestForgotPasswordReset, resetPassword } from '../controllers/authController'
import { validateRequestBody } from '../middlewares/validationMiddleware'
import { signupSchema, loginSchema, verifyEmailSchema, requestPasswordResetSchema, resetPasswordSchema } from '../validations/authValidation'


const router = Router()

router.post('/signup', validateRequestBody(signupSchema), signup)
router.post('/login', validateRequestBody(loginSchema), login)
router.post('/verify-email', validateRequestBody(verifyEmailSchema), verifyEmail)
router.post('/request-password-reset', validateRequestBody(requestPasswordResetSchema), requestForgotPasswordReset)
router.post('/reset-password', validateRequestBody(resetPasswordSchema), resetPassword)


export default router