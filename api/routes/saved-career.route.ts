import { Router } from 'express';

import { saveCareer, unsaveCareer, getSavedCareers } from '../controllers/saved-career.controller';
import  authMiddleware  from '../middleware/auth.middleware'; 
const router = Router();

router.use(authMiddleware); // 

router.get('/', getSavedCareers);
router.post('/:careerId', saveCareer);
router.delete('/:careerId', unsaveCareer);

export default router;