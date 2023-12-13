import cheerio from 'cheerio-httpcli';
import fireBaseService from "./firebase-service.mjs";
import axios from 'axios';

class ScrapeService {

    lambdaConcurrency = 5 ;

    getRandomDelay(){
        const delay = Math.floor(Math.random() * 30000 ) + 60000;
        return delay;
    }

    async scrapeProduct(productData){
        try{
            const { PRODUCT_ID } = productData ;
            const { $ } = await cheerio.fetch(`https://www.amazon.in/dp/${PRODUCT_ID}`);
            const Seller_1 = $("#merchant-info > .a-link-normal").text();
            const SL_1 = $("#corePriceDisplay_desktop_feature_div > .a-section.a-spacing-none.aok-align-center > .a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay");
            let realPrice = '';
            $(SL_1).each((index, element) => {
                const price = $(element).text();
                const priceArr = price.split('₹');
                realPrice = priceArr.length > 1 ? priceArr[1] : '-';
            });
            const Deal_Text = $("#dealBadgeSupportingText > span").eq(0).text();
            const SL_2 = $("#mbc-price-1").text().trim();
            const Seller_2 = $("#mbc-sold-by-1 > .a-size-small.mbcMerchantName").text().trim();
            const SL_3 = $("#mbc-price-2").text().trim();
            const Seller_3 = $("#mbc-sold-by-2 > .a-size-small.mbcMerchantName").text().trim();
        
            const data = {
                Seller_1,
                SL_1 : realPrice,
                Deal_Text,
                Seller_2,
                SL_2,
                Seller_3,
                SL_3
            };
        
            return {
                success : true,
                ...productData,
                ...data,
            };

        }catch(err){
            return {
                success  : false,
            }
        }
    }

    sleep(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    async updateRangeForNextStep(company,isError,curr_val,GROUP_SIZE,MAX_LIMIT){
        const rangeObj = await fireBaseService.getRange();
        let value = rangeObj[company];
        if(isError){
            value = -1;
        }
        if(value === MAX_LIMIT){
            value = GROUP_SIZE;
        }else{
            value = value + GROUP_SIZE;
        }
        await fireBaseService.updateRange(rangeObj,company,value);
    }

    async scrapeAllProduct(productList,scrapedList,curr_ind,max_ind){
        if(curr_ind >= max_ind){
            return ;
        }
        // const product = productList[curr_ind];
        // const random = this.getRandomDelay();
        // await this.sleep(random);
        // const data = await this.scrapeProduct(product);
        // if(data.success){
        //     scrapedList.push(data);
        // }
        // https://jcivl3hiqaxhbwfzutidtv7oye0hwwye.lambda-url.ap-south-1.on.aws/?product_id=B084MMG3PB

        const axiosAPIs = [];
        for(let i = curr_ind ; i < curr_ind + this.lambdaConcurrency; i++){
            if(i <= max_ind){
                const product = productList[i];
                axiosAPIs.push(axios.get(`https://jcivl3hiqaxhbwfzutidtv7oye0hwwye.lambda-url.ap-south-1.on.aws/?product_id=${product.PRODUCT_ID}`));
            }else{
                break;
            }
        }

        try{
            const response = await Promise.allSettled(axiosAPIs);
            response.forEach((item,index)=>{
                if(item.status === 'fulfilled'){
                    const product = productList[curr_ind + index];
                    scrapedList.push({ ...item?.value?.data?.data, ...product });
                }
            });
        }catch(error){
        }
        const random = this.getRandomDelay();
        await this.sleep(random);
        await this.scrapeAllProduct(productList,scrapedList,curr_ind+this.lambdaConcurrency,max_ind);
    }
}

const scrapeService = new ScrapeService();

export default scrapeService;