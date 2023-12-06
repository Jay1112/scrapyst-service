import awsService        from '../service/aws-service.mjs';
import fireBaseService     from '../service/firebase-service.mjs';
import scrapeService from '../service/scrape-service.mjs';
import mailService from '../service/mail-service.mjs';
import csvService from '../service/csv-service.mjs';

import StatusCodeTypes from '../enums/status-code-types.mjs';

class AppController {
    async doScrape(req,res){
        try{
            const MAX_LIMIT = 150 ; 
            const GROUP_SIZE = 50 ;
            const company = 'etrade' ;
            if(!company){
                res.status(StatusCodeTypes.BAD_REQUEST).json({success : false, data : 'Company Name is missing from query Params'});
            }else{
                // get users list
                const usersList = await fireBaseService.getUsers();

                // get excel sheet data
                const excelData = await awsService.getProductsFromMasterSheet(process.env.ETRADE_FILE_URL);

                // company name
                const excel1Company = 'ETRADE'; 

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
                const rangeObj = await fireBaseService.getRange();
                await scrapeService.scrapeAllProduct(productData,scrapedList,rangeObj.etrade - GROUP_SIZE,rangeObj.etrade);
                const prevScrapedData = scrapeService.getDataContainer();
                scrapeService.setDataContainer([...prevScrapedData,...scrapedList]);
                if(rangeObj['etrade'] === MAX_LIMIT){
                    const finalData = scrapeService.getDataContainer();
                    const scrapeSheetBuffer = csvService.csvTransformationUsing2DList(finalData,excel1Company);
                    scrapeService.clearContainer();

                    // file buffers
                    const bufferArr = [{ companyName : 'ETRADE' ,bufferData :  scrapeSheetBuffer}];

                    // mail service
                    const mailResponse = await mailService.composeMail(bufferArr,usersList);
                }
                await scrapeService.updateRangeForNextStep('etrade',false);
                res.status(StatusCodeTypes.OK).json({success  :true, data : 'Done'});
            }
        }catch(err){
            await scrapeService.updateRangeForNextStep('etrade',true);
            res.status(StatusCodeTypes.BAD_REQUEST).json({ success : false, message : err.message });
        }
    }
}

const appController = new AppController();

export default appController;