import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

// Global Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Raw body parser for Razorpay webhook (must be before express.json)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Rentlo API server is healthy' });
});

// Main API Routes
app.use('/api', routes);

// Global Error Handling Middleware
app.use(errorMiddleware);

export default app;
