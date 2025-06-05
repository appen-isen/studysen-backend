import express, { Express } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import eventRoutes from '@routes/event/event';
import participantsRoutes from '@routes/participants/participants';
import permissionsRoutes from '@routes/permissions/permissions';
import usersRoutes from '@routes/users/users';
import organizationsRoutes from '@routes/organizations/organizations';
import githubRoutes from '@routes/github/github';
import notificationsRoutes from '@routes/notifications/notifications';
import pingRoutes from '@routes/ping/ping';
import loginRoutes from '@routes/login/login';
import clubsRoutes from '@routes/clubs/clubs';
import postsRoutes from '@routes/posts/posts';
import adminRoutes from '@routes/admin/admin';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

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

// Routes non utilisées pour le moment
// app.use("/v1", loginRoutes);
// app.use("/v1/events", eventRoutes);
// app.use("/v1/participants", participantsRoutes);
// app.use("/v1/permissions", permissionsRoutes);
// app.use("/v1/users", usersRoutes);
// app.use("/v1/organizations", organizationsRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
