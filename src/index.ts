import express, { Express } from "express";
import dotenv from "dotenv";

import eventRoutes from "@routes/event/event";
import participantsRoutes from "@routes/participants/participants";
import permissionsRoutes from '@routes/permissions/permissions';
import usersRoutes from '@routes/users/users'
import organizationsRoutes from '@routes/organizations/organizations';
import githubRoutes from '@routes/github/github';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Définition des routes
app.use("/v1/events", eventRoutes);
app.use("/v1/participants", participantsRoutes);
app.use("/v1/permissions", permissionsRoutes);
app.use("/v1/users", usersRoutes);
app.use("/v1/organizations", organizationsRoutes);
app.use("/v1/github", githubRoutes);


app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});