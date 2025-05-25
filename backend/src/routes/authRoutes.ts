import { Router } from 'express'
import { signup, verifyEmail } from '../controllers/authController'


const router = Router()

router.post('/signup', signup)
router.post('/verify-email', verifyEmail)


export default router
