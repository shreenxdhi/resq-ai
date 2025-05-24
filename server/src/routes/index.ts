import express from 'express';
import healthRoutes from './health';
import cityRoutes from './cities';
import weatherRoutes from './weather';
import planRoutes from './plans';
import tipsRoutes from './tips';
import analyticsRoutes from './analytics';

const router = express.Router();

// Register all routes
router.use('/health', healthRoutes);
router.use('/top-cities', cityRoutes);
router.use('/weather', weatherRoutes);
router.use('/plans', planRoutes);
router.use('/generate-tips', tipsRoutes);
router.use('/analytics', analyticsRoutes);

export default router; 