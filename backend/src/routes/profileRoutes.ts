import { Router } from 'express'
import { completeProfile, getProfile, updateProfile } from '../controllers/profileController'
import { verifyToken } from '../middlewares/authMiddleware'

const router = Router()


router.use(verifyToken)

router.post('/complete', completeProfile)

router.get('/get-profile', getProfile)

router.put('/update-profile', updateProfile)

export default router