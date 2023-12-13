import express from 'express';
import appController from '../controllers/app-controller.mjs';

const router = express.Router();

router.get('/scrape-data',appController.doScraping);
router.get('/test',(req,res)=>{
    res.status(200).json({ test : 'SuccessFully deployed' });
});

export default router;