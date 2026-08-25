import 'dotenv/config';
import http from 'http';
import { Server } from 'socket.io'; // 👈 keep this import
import app from './app';
import { connectDB, pool } from './config/db';
import { setupChatSocket } from './sockets/chatSockets'; // 👈 Import the setup

const PORT = process.env.PORT || 3000;

const main = async () => {
  await connectDB();

  app.get('/', (_req, res) => {
    res.json({ message: 'Welcome to the CareerMap API' });
  });

  app.get('/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.json({ status: 'healthy', database: 'connected' });
    } catch {
      res.status(503).json({ status: 'unhealthy', database: 'error' });
    }
  });

  const server = http.createServer(app);

  // 👇 Create your ONE and ONLY io instance here
  const io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'http://localhost:5173'],
      credentials: true,
    }
  });

  // 👇 Pass that single instance into your setup function!
  setupChatSocket(io);

  server.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
  });
};

main();