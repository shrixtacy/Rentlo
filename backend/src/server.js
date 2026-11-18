import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './configs/db.config.js';

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Rentlo backend server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to Database:', err);
    process.exit(1);
  });
