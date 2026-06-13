import { Router } from 'express'
import { createComplaint, createRating, getMyComplaints } from '../controllers/feedbackController'
import { verifyToken } from '../middlewares/authMiddleware'

const router = Router()

router.use(verifyToken)

router.post('/complaints', createComplaint)
router.get('/complaints/my', getMyComplaints)
router.post('/ratings', createRating)

export default router
