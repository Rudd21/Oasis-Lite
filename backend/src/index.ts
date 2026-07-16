import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Redis from 'ioredis';
import tasksRouter from './routes/tasks.routes';
import pushRouter from './routes/push.routes';
import { startScheduler } from './services/scheduler';

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongodb:27017/oasis_lite';
const REDIS_URL = process.env.REDIS_URL || 'redis://cache:6379';

app.use(cors({
    origin: 'http://localhost:3000'
}));

app.use(express.json());

app.use('/tasks', tasksRouter)
app.use('/push', pushRouter)

// 1. Підключення до MongoDB
mongoose.connect(MONGO_URI)
  .then(() =>{ 
    console.log('🍃 MongoDB успішно підключено!')
    startScheduler();
  }
)
  .catch(err => console.error('Помилка підключення до Mongo:', err));

// 2. Підключення до Redis
const redis = new Redis(REDIS_URL);
redis.on('connect', () => console.log('❤️  Redis успішно підключено!'));
redis.on('error', (err) => console.error('Помилка Redis:', err));

// Базовий роут для перевірки
app.get('/', (req, res) => {
  res.json({ message: 'Oasis Lite API працює на чистій швидкості Express!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер стартував на http://localhost:${PORT}`);
});