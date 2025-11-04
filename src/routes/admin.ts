import { verifyAdminAuth } from '@/middlewares/auth';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { loginAdmin, verifyAdmin } from '@/controllers/admin/adminAuth';

const router = express.Router();

const adminLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  limit: 10, // each IP can make up to 10 requests per `windowsMs` (5 minutes)
  standardHeaders: true, // add the `RateLimit-*` headers to the response
  legacyHeaders: false // remove the `X-RateLimit-*` headers from the response
});

// Route pour vérifier si l'utilisateur est un administrateur
router.get('/verify', verifyAdminAuth, verifyAdmin);

// Route pour se connecter en tant qu'administrateur
router.post('/login', adminLimiter, loginAdmin);

export default router;
