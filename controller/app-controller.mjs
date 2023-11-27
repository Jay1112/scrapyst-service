import awsService        from '../service/aws-service.mjs';
import fireBaseService     from '../service/firebase-service.mjs';
import scrapeService from '../service/scrape-service.mjs';
import mailService from '../service/mail-service.mjs';
import csvService from '../service/csv-service.mjs';

import StatusCodeTypes from '../enums/status-code-types.mjs';

class AppController {

    async startScraping(req,res){
        try{
            // get users list
            const usersList = await fireBaseService.getUsers();

            // get excel sheet data
            const excelData = await awsService.getProductsFromMasterSheet();

            // products
            let productData = excelData.filter((item,index)=>{
                if(index <= 1){
                    return false;
                }
                return true;
            })
            .map((item)=>{
                return { SR_NO : item[0], PRODUCT_ID : item[1], TITLE : item[2]};
            });

            // scrape service
            const scrapedList = [];
            await scrapeService.scrapeAllProduct(productData,scrapedList,0);

            const scrapeSheet = csvService.csvTransformationUsing2DList(scrapedList);

            // mail service
            // const mailResponse = await mailService.composeMail(csvData,usersList);

            res.status(StatusCodeTypes.OK).json({success  :true, data : scrapedList});
                    
        }catch(err){
            res.status(StatusCodeTypes.BAD_REQUEST).json({ success : false, message : err.message });
        }
    }
}

const appController = new AppController();

export default appController;