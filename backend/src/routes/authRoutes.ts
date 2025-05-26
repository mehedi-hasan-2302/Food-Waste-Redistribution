import { Router } from 'express'
import { signup, login, verifyEmail } from '../controllers/authController'
import { validateRequestBody } from '../middlewares/validationMiddleware'
import { signupSchema, loginSchema, verifyEmailSchema } from '../validations/authValidation'


const router = Router()

router.post('/signup', validateRequestBody(signupSchema), signup)
router.post('/login', validateRequestBody(loginSchema), login)
router.post('/verify-email', validateRequestBody(verifyEmailSchema), verifyEmail)


export default router
