import { Router } from 'express'
import {
    getAllFoodListings,
    searchFoodListings, 
    getFoodListingById,
    getMyFoodListings, 
    getFoodListingStats,
    createFoodListing,
    updateFoodListing,
    deleteFoodListing,
    negotiatePrice,
    toggleListingStatus    
} from '../controllers/foodListingController'
import { verifyToken, requireRoles } from '../middlewares/authMiddleware'
import { uploadImage } from '../middlewares/uploadMiddleware'
import { validateRequestBody } from '../middlewares/validationMiddleware'
import { createFoodListingSchema, updateFoodListingSchema, negotiatePriceSchema } from '../validations/foodListingValidation'

const router = Router()

// Public routes
router.get('/', getAllFoodListings)
router.get('/search', searchFoodListings)
router.get('/:id', getFoodListingById)


router.use(verifyToken) 

router.post('/upload', 
  uploadImage.single('image'), 
  requireRoles(['DONOR_SELLER']),
  validateRequestBody(createFoodListingSchema),
  createFoodListing
)


router.get('/my/listings', requireRoles(['DONOR_SELLER']),getMyFoodListings)

router.get('/my/stats', requireRoles(['DONOR_SELLER']),getFoodListingStats)

router.put('/:id/update', 
  uploadImage.single('image'),
  requireRoles(['DONOR_SELLER']),
  validateRequestBody(updateFoodListingSchema),
  updateFoodListing
)

router.delete('/:id', requireRoles(['DONOR_SELLER']), deleteFoodListing)

router.post('/:id/negotiate',
  requireRoles(['BUYER']), 
  validateRequestBody(negotiatePriceSchema),
  negotiatePrice
)

router.patch('/:id/status', requireRoles(['DONOR_SELLER']), toggleListingStatus)

export default router