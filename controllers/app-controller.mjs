import { config } from "dotenv";
import fireBaseService from "../service/firebase-service.mjs";
import awsService from "../service/aws-service.mjs";
import scrapeService from "../service/scrape-service.mjs";
import StatusCodeTypes from '../enums/status-code-types.mjs';
import mailService from "../service/mail-service.mjs";
import csvService from "../service/csv-service.mjs";

config();

class AppController {
    async doScraping(req,res){
        const GROUP_SIZE    = 25 ; 
        const MAX_LIMIT     = 250 ;
        let company = process.env.COMPANY;
        try{
            let scomapny = company.toLowerCase();

            const usersList = await fireBaseService.getUsers();

            const productsData = await awsService.getProductsFromMasterSheet(process.env.MASTER_SHEET_URL);

            const scrapedList = [];
            const rangeObj = await fireBaseService.getRange();
            await scrapeService.scrapeAllProduct(productsData,scrapedList,rangeObj[scomapny] - GROUP_SIZE,rangeObj[scomapny]);
            await scrapeService.updateRangeForNextStep(company.toLowerCase(),false,rangeObj[scomapny],GROUP_SIZE,MAX_LIMIT);

            const s3PutRequest = awsService.createPutPublicJsonRequest(
                'scrapyst/jsonfiles',
                ( rangeObj[scomapny] +  '.json'),
                JSON.stringify({ productsData: scrapedList })
              )

            const s3Response = await awsService.put(s3PutRequest);

              const jsonData = await csvService.extractProductDataFromJSON(GROUP_SIZE,MAX_LIMIT,GROUP_SIZE);
              const buffer = await csvService.csvTransformationUsing2DList(jsonData,scomapny);

              if(rangeObj[scomapny] === MAX_LIMIT){
                const bufferArr = [{ companyName : 'ETRADE' ,bufferData :  buffer}];
                const mailResponse = await mailService.composeMail(bufferArr,usersList);
              }

            res.status(StatusCodeTypes.OK).json({ success : true, message : 'Data Extracted SuccessFully', stack : null });

        }catch(err){
            const s3PutRequest = awsService.createPutPublicJsonRequest(
              'scrapyst/jsonfiles',
              ( 'error' +  '.json'),
              JSON.stringify({ err : err.message, stack : err.stack })
            )

          const s3Response = await awsService.put(s3PutRequest);
          res.status(StatusCodeTypes.OK).json({ success : true, message : err.message, stack : err.stack() });
        }
    }
}

const appController = new AppController();

export default appController;