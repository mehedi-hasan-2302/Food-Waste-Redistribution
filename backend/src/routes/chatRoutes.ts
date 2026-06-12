import { Router } from 'express'
import {
  getConversations,
  getMessages,
  getOrCreateConversation,
  sendMessage,
} from '../controllers/chatController'
import { verifyToken } from '../middlewares/authMiddleware'

const router = Router()

router.use(verifyToken)

router.get('/conversations', getConversations)
router.post('/conversations/:userId', getOrCreateConversation)
router.get('/conversations/:conversationId/messages', getMessages)
router.post('/messages', sendMessage)

export default router
