import express from 'express';
import appController from '../controllers/app-controller.mjs';

const router = express.Router();

router.get('/scrape-data',appController.doScraping);

export default router;