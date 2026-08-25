import { Router } from 'express';

import { getCareers, getCareerById } from '../controllers/career.controller';

const router = Router();

router.get('/', getCareers);
router.get('/:id', getCareerById);

export default router;