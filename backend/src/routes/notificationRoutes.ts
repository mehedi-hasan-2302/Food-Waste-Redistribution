import { Router } from 'express';
import { getNotificationsForUser, markNotificationAsRead, markAllNotificationsAsRead } from '../controllers/notificationController';
import { verifyToken } from '../middlewares/authMiddleware';

const router = Router();

router.use(verifyToken);

router.get('/get-notifications', getNotificationsForUser);
router.patch('/:notificationId/read', markNotificationAsRead);
router.patch('/read-all', markAllNotificationsAsRead);

export default router;
