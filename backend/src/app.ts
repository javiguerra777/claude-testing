import cors from 'cors';
import express from 'express';
import { prisma } from './prisma';
import { authRouter } from './routes/auth';
import { authenticate } from './middleware/authenticate';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', db: 'unreachable' });
  }
});

app.use('/api/v1/auth', authRouter);

app.get('/api/v1/me', authenticate, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true },
  });

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({ user });
});
