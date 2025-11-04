import express from 'express';
import { createGithubIssue } from '@/controllers/github/createIssue';

const router = express.Router();

// Route pour créer une issue GitHub
router.post('/', createGithubIssue);

export default router;
