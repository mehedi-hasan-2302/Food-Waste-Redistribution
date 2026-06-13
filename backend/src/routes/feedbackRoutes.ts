import { Router } from 'express'
import { createComplaint, getMyComplaints } from '../controllers/feedbackController'
import { verifyToken } from '../middlewares/authMiddleware'

const router = Router()

router.use(verifyToken)

router.post('/complaints', createComplaint)
router.get('/complaints/my', getMyComplaints)

export default router
