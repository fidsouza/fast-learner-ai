import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { authRoutes } from './routes/auth';
import { lessonRoutes } from './routes/lessons';
import { vocabularyRoutes } from './routes/vocabulary';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/vocabulary', vocabularyRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});