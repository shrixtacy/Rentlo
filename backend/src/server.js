import dotenv from 'dotenv';
dotenv.config();
import { createServer } from 'http';
import app from './app.js';
import { connectDB } from './configs/db.config.js';
import { initSocket } from './socket.js';

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = initSocket(httpServer);
app.set('io', io);

connectDB()
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`🚀 Rentlo backend server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to Database:', err);
    process.exit(1);
  });
