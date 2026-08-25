import { Router } from 'express';

import { saveMentor, unsaveMentor, getSavedMentors } from '../controllers/saved-mentor.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', getSavedMentors);
router.post('/:mentorId', saveMentor);
router.delete('/:mentorId', unsaveMentor);

export default router;