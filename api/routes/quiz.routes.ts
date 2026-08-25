import { Router } from 'express';
import { 
  startQuiz, 
  getAttemptStatus, 
  submitNlpDiscovery, 
  submitAnswer, 
  skipQuestion, 
  getResults 
} from '../controllers/quiz.controller';
import authMiddleware from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/start', startQuiz);
router.get('/:attemptId', getAttemptStatus);

// NLP Discovery Phase Route
router.post('/:attemptId/nlp-discovery', submitNlpDiscovery);

// Structured Question Routes
router.post('/:attemptId/answer', submitAnswer);
router.post('/:attemptId/skip', skipQuestion);
router.get('/:attemptId/results', getResults);

export default router;