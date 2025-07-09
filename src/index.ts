import express, { Express } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import githubRoutes from '@routes/github/github';
import notificationsRoutes from '@routes/notifications/notifications';
import pingRoutes from '@routes/ping/ping';
import clubsRoutes from '@routes/clubs/clubs';
import postsRoutes from '@routes/posts/posts';
import adminRoutes from '@routes/admin/admin';
import Logger, { initLogger } from './utils/logger';

dotenv.config();

const app: Express = express();
const port = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
//On autorisera les requêtes CORS uniquement en mode développement
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true
  })
);

app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Définition des routes

app.use('/v1/github', githubRoutes);
app.use('/v1/notifications', notificationsRoutes);
app.use('/v1/ping', pingRoutes);
app.use('/v1/clubs', clubsRoutes);
app.use('/v1/posts', postsRoutes);
app.use('/v1/admin', adminRoutes);

app.listen(port, '0.0.0.0', () => {
  initLogger();
  new Logger('API').info(`Server is running at http://0.0.0.0:${port}`);
});
