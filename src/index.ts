import path from 'node:path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Express } from 'express';
import adminRoutes from '@/routes/admin';
import clubsRoutes from '@/routes/clubs';
import githubRoutes from '@/routes/github';
import notificationsRoutes from '@/routes/notifications';
import pingRoutes from '@/routes/ping';
import postsRoutes from '@/routes/posts';
import telemetryRoutes from '@/routes/telemetry';
import { initDatabase } from './utils/database';
import { initializeMailer, verifyConnection } from './utils/email';
import Logger, { initLogger } from './utils/logger';

dotenv.config();

const app: Express = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://studysen.fr',
      'https://clubs.studysen.fr',
      'tauri://localhost',
      'http://tauri.localhost'
    ],
    methods: ['HEAD', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
  })
);

app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir les fichiers statiques pour la landing page
app.use(express.static(path.join(__dirname, '../static')));

// Définition des routes

app.use('/v1/github', githubRoutes);
app.use('/v1/notifications', notificationsRoutes);
app.use('/v1/ping', pingRoutes);
app.use('/v1/clubs', clubsRoutes);
app.use('/v1/posts', postsRoutes);
app.use('/v1/admin', adminRoutes);
app.use('/v1/telemetry', telemetryRoutes);

app.listen(port, '0.0.0.0', async () => {
  initLogger();

  // Initialiser la base de données au démarrage
  await initDatabase();

  try {
    // Initialiser le transporteur de mail
    initializeMailer();
    await verifyConnection();
  } catch (error) {
    new Logger('API').error("Impossible d'initialiser le transporteur de mail:", error);
  }

  new Logger('API').info(`Server is running at http://0.0.0.0:${port}`);
});
