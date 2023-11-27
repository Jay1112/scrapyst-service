import express  from 'express';
import appController from '../controller/app-controller.mjs';

const appRouter = express.Router();

appRouter.get('/start-scraping',appController.startScraping);

export default appRouter;