import { Router } from 'express';

import {
    listConversations,
    startConversation,
    getMessages,
    markRead,
    setArchived
} from '../controllers/conversation.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', listConversations);
router.post('/', startConversation);
router.get('/:id/messages', getMessages);
router.patch('/:id/read', markRead);
router.patch('/:id/archive', setArchived);

export default router;