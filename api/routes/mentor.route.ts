import { Router } from 'express';

import { getMentors, getMentorById } from '../controllers/mentor.controller';

const router = Router();

router.get('/', getMentors);
router.get('/:id', getMentorById);

export default router;