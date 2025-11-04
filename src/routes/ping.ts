import express from 'express';
import { ping } from '@/controllers/ping';

const router = express.Router();

// Route de test simple
router.get('/', ping);

export default router;
