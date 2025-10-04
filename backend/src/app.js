import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './router/user.router.js';
import authRouter from './router/auth.router.js';
import cookieParser from "cookie-parser"

// Load environment variables
dotenv.config({ path: '.env' });

// import badgesRouter from './src/router/badges.router.js';
// import pullRequestsRouter from './src/router/pullRequests.router.js';

const app = express();

app.use(cors({
  origin: 'http://localhost:3000', // Explicit origin for credentials
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(cookieParser())
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static("public"))

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});


app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
// app.use('/api/badges', badgesRouter);
// app.use('/api/pull-requests', pullRequestsRouter);

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to MergeQuest API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      badges: '/api/badges',
      pullRequests: '/api/pull-requests',
      health: '/api/health'
    }
  });
});




export { app };