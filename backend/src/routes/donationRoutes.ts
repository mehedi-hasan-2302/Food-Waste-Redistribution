import { Router } from 'express'
import { 
    createDonationClaim,
    authorizeDonationPickup,
    completeDonationDelivery,
    reportDonationDeliveryFailure,
    getDonationClaimById,
    getMyDonationClaims,
    getMyDonationOffers,
    getMyDonationDeliveries,
    getDonationStats,
    cancelDonationClaim
} from '../controllers/donationController'
import { verifyToken, requireRoles } from '../middlewares/authMiddleware'

const router = Router()

router.use(verifyToken)

router.post('/:id/create-claim', requireRoles(["CHARITY_ORG"]), createDonationClaim)

router.post('/:id/authorize-pickup', requireRoles(["DONOR_SELLER"]), authorizeDonationPickup)

router.post('/:id/complete-delivery', requireRoles(["ORG_VOLUNTEER", "CHARITY_ORG"]), completeDonationDelivery)

router.post('/:id/report-failure', requireRoles(["ORG_VOLUNTEER", "CHARITY_ORG"]), reportDonationDeliveryFailure)

router.get('/:id', requireRoles(["DONOR_SELLER", "CHARITY_ORG", "ORG_VOLUNTEER"]), getDonationClaimById)

router.get('/my/claims', requireRoles(["CHARITY_ORG"]), getMyDonationClaims)

router.get('/my/offers', requireRoles(["DONOR_SELLER"]), getMyDonationOffers)

router.get('/my/deliveries', requireRoles(["ORG_VOLUNTEER"]), getMyDonationDeliveries)

router.get('/my/stats', requireRoles(["DONOR_SELLER", "CHARITY_ORG"]), getDonationStats)

router.put('/:id/cancel', requireRoles(["DONOR_SELLER", "CHARITY_ORG"]), cancelDonationClaim)

export default router