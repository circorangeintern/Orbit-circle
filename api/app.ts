// app.ts
import express, { type ErrorRequestHandler } from 'express';
import authRoutes from './routes/auth.route';
import careerRoutes from './routes/career.route';
import mentorRoutes from './routes/mentor.route';
import savedMentorRoutes from './routes/saved-mentor.route';
import savedCareerRoutes from './routes/saved-career.route';
import quizRoutes from './routes/quiz.routes';
import conversationRoutes from './routes/conversation.route';
import googleAuthRouter from './routes/auth.google.route';

import swaggerRouter from './swagger'; // <-- import
import cors from 'cors';

const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());

// Mount routes
app.use('/auth', authRoutes);
app.use('/auth/google', googleAuthRouter);
app.use('/careers', careerRoutes);
app.use('/mentors', mentorRoutes);
app.use('/saved-mentors', savedMentorRoutes);
app.use('/saved-careers', savedCareerRoutes);
app.use('/quiz', quizRoutes);
app.use('/conversations', conversationRoutes);
// app.get('/docs', (_req, res) => {
//   res.redirect('/api-docs');
// });
// app.get('/docs/api-docs', (_req, res) => {
//   res.redirect('/api-docs');
// });
app.use('/api-docs', swaggerRouter);

// Error handler
const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
};
app.use(errorHandler);

export default app;