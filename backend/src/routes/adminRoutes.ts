import { Router } from 'express'
import {
  getDashboardStats,
  getAllUsers,
  getPendingVerifications,
  processVerification,
  suspendUser,
  reactivateUser,
  getAllFoodListings,
  removeFoodListing,
  getAllComplaints,
  resolveComplaint,
  getSystemHealth
} from '../controllers/adminController'
import { requireRole, verifyToken } from '../middlewares/authMiddleware'
import { validateRequestBody } from '../middlewares/validationMiddleware'
//import { adminVerificationSchema, adminActionSchema } from '../validations/adminValidation'

const router = Router()

router.use(verifyToken)
router.use(requireRole('ADMIN'))

// Dashboard and Analytics
router.get('/dashboard/stats', getDashboardStats)
router.get('/system/health', getSystemHealth)

// User Management
router.get('/users', getAllUsers)
router.put('/users/:userId/suspend', suspendUser)
router.put('/users/:userId/reactivate', reactivateUser)

// Verification Management
router.get('/verifications/pending', getPendingVerifications)
router.post('/verifications/process', processVerification)

// Food Listing Management
router.get('/food-listings', getAllFoodListings)
router.delete('/food-listings/:listingId', removeFoodListing)

// Complaint Management
router.get('/complaints', getAllComplaints)
router.put('/complaints/:complaintId/resolve', resolveComplaint)

export default router