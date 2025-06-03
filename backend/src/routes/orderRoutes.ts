import { Router } from 'express'
import { 
    createOrder,
    authorizePickup,
    completeDelivery,
    reportDeliveryFailure,
    getOrderById,
    getMyOrders,
    getMySales,
    getMyDeliveries,
    getOrderStats,
    cancelOrder
} from '../controllers/orderController'
import { verifyToken, requireRoles } from '../middlewares/authMiddleware'

const router = Router()


router.use(verifyToken)


router.post('/:id/create-order', requireRoles(["DONOR_SELLER", "INDEP_DELIVERY", "ORG_VOLUNTEER", "BUYER", "CHARITY_ORG"]), createOrder)

router.post('/:id/authorize-pickup', requireRoles(["DONOR_SELLER"]),  authorizePickup)

router.post('/:id/complete-delivery', requireRoles(["CHARITY_ORG", "BUYER"]),completeDelivery)

router.post('/:id/report-failure', requireRoles(["INDEP_DELIVERY", "ORG_VOLUNTEER"]), reportDeliveryFailure)

router.get('/:id', requireRoles(["DONOR_SELLER", "INDEP_DELIVERY", "ORG_VOLUNTEER", "BUYER"]), getOrderById)

router.get('/my/purchases', requireRoles(["BUYER"]), getMyOrders)

router.get('/my/sales', requireRoles(["DONOR_SELLER"]), getMySales)

router.get('/my/deliveries', requireRoles(["INDEP_DELIVERY", "ORG_VOLUNTEER"]), getMyDeliveries)

router.get('/my/stats', requireRoles(["BUYER", "DONOR_SELLER", "CHARITY_ORG"]), getOrderStats)

router.put('/:id/cancel', requireRoles(["BUYER"]), cancelOrder)

export default router