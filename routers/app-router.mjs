import express  from 'express';
import appController from '../controller/app-controller.mjs';

const appRouter = express.Router();

appRouter.get('/start-scraping',appController.doScrape);

export default appRouter;