import { Router } from 'express'
import { signup, verifyEmail } from '../controllers/authController'
import { validateRequestBody } from '../middlewares/validationMiddleware'
import { signupSchema, verifyEmailSchema } from '../validations/authValidation'


const router = Router()

router.post('/signup', validateRequestBody(signupSchema), signup)
router.post('/verify-email', validateRequestBody(verifyEmailSchema), verifyEmail)


export default router
