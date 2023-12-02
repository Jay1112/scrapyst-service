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
            const excelData = await awsService.getProductsFromMasterSheet(process.env.ETRADE_FILE_URL);

            // company name
            const excel1Company = excelData[0][2]; 

            // products
            let productData = excelData.filter((item,index)=>{
                if(index <= 1){
                    return false;
                }
                return true;
            })
            .map((item)=>{
                return { SR_NO : item[0], PRODUCT_ID : item[1], TITLE : item[2], True_Deal_Price : item[3]};
            });

            // scrape service
            const scrapedList = [];
            await scrapeService.scrapeAllProduct(productData,scrapedList,0);

            const scrapeSheetBuffer = csvService.csvTransformationUsing2DList(scrapedList,excel1Company);

            /* 2nd Company */
            // get excel sheet data
            const rkworldExcelData = await awsService.getProductsFromMasterSheet(process.env.RK_WORLD_FILE_URL);

            // company name
            const excel2Company = rkworldExcelData[0][2]; 

            // products
            let rkworldData = rkworldExcelData.filter((item,index)=>{
                if(index <= 1){
                    return false;
                }
                return true;
            })
            .map((item)=>{
                return { SR_NO : item[0], PRODUCT_ID : item[1], TITLE : item[2], True_Deal_Price : item[3]};
            });

            // scrape service
            const rkworldDataScrapedList = [];
            await scrapeService.scrapeAllProduct(rkworldData,rkworldDataScrapedList,0);

            const rkworldDataScrapeSheetBuffer = csvService.csvTransformationUsing2DList(rkworldDataScrapedList,excel2Company);

            // file buffers
            const bufferArr = [{ companyName : 'ETRADE' ,bufferData :  scrapeSheetBuffer},{ companyName : 'RK_WORLD', bufferData : rkworldDataScrapeSheetBuffer}];

            // mail service
            // const mailResponse = await mailService.composeMail(bufferArr,usersList);

            res.status(StatusCodeTypes.OK).json({success  :true, data : [...scrapedList,...rkworldDataScrapedList]});
                    
        }catch(err){
            res.status(StatusCodeTypes.BAD_REQUEST).json({ success : false, message : err.message });
        }
    }
}

const appController = new AppController();

export default appController;