import dotenv from 'dotenv';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import connectDB from './config/db.js';
import sessionRoutes from './routes/sessions.js';
import gameSocket from './sockets/gameSocket.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/sessions', sessionRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/guessing_game')
  .then(() => {
    gameSocket(io);

    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => console.error(err));
