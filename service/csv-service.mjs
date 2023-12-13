import xlsx from 'xlsx';
import axios from  'axios';

class CsvService {

    async extractProductDataFromJSON(start,end,groupSize){
        
        const apis = [];
        for(let i = start; i<= end; i+=groupSize){
            const url = `https://scrapyst.s3.ap-south-1.amazonaws.com/jsonfiles/${i}.json`;
            apis.push(url);
        }

        const axiosAPIs = apis.map((api)=>{
            return  axios.get(api);
        });

        const response = await Promise.allSettled(axiosAPIs);
        let jsonData = [];
        response.forEach((item)=>{
            if(item.status === 'fulfilled'){
                jsonData.push(...item.value.data.productsData);
            }
          })
        return jsonData ;
    }


    csvTransformationUsing2DList(productList,primeSeller){
        // scrapeSheet
        const scrapeSheet = [];
        
        // date
        const date = new Date();
        let dateString = '' ;

        // Specify the desired time zone (e.g., 'Asia/Kolkata' for Indian Standard Time)
        const timeZone = 'Asia/Kolkata';
        const hoursInIST = date.toLocaleString('en-US', { timeZone, hour: 'numeric', hour12: false }); 
        if(hoursInIST < 12){
            dateString = hoursInIST + '_' + 'AM';
        }else if(hoursInIST ===  12){
            dateString = '12_PM';
        }
        else{
            dateString = (hoursInIST - 12 ) + '_' + 'PM';
        }
        scrapeSheet.push(['DATE_&_TIME',dateString,primeSeller]);

        // fields
        const fields = ["SR_NO","PRODUCT_ID","TITLE","True_Deal_Price","SP_1","Seller_1","Deal_Text","SP_2","Seller_2","SP_3","Seller_3"];
        scrapeSheet.push(fields);

        // product Data
        productList.forEach((item) => {
            let product = [];
            item.SR_NO ? product.push(item.SR_NO) : product.push('');
            item.PRODUCT_ID ? product.push(item.PRODUCT_ID) : product.push('');
            item.TITLE ? product.push(item.TITLE) : product.push('');
            item.True_Deal_Price ? product.push(item.True_Deal_Price) : product.push('');

            item.SL_1 ? product.push(item.SL_1) : product.push('');
            item.Seller_1 ? product.push(item.Seller_1) : product.push('');
            item.Deal_Text ? product.push(item.Deal_Text) : product.push('');

            item.SL_2 ? product.push(item.SL_2) : product.push('');
            item.Seller_2 ? product.push(item.Seller_2) : product.push('');

            item.SL_3 ? product.push(item.SL_3) : product.push('');
            item.Seller_3 ? product.push(item.Seller_3) : product.push('');

            scrapeSheet.push(product);
        });

        const ws = xlsx.utils.aoa_to_sheet(scrapeSheet);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, 'Sheet 1');

        // Create a buffer from the workbook
        const buffer = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });

        // const scrapeSheetString = scrapeSheet.map(style => style.join(' ')).join('\n');

        return buffer;
    }

}

const csvService = new CsvService();

export default csvService;