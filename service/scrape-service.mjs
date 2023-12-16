import cheerio from 'cheerio-httpcli';
import fireBaseService from "./firebase-service.mjs";
import axios from 'axios';
import fetch from 'node-fetch';

class ScrapeService {

    lambdaConcurrency = 1 ;

    getRandomDelay(){
        const delay = Math.floor(Math.random() * 10000) +  10000;
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

    getLambdaUrl(product_id){
        const lambdaList = [
            `https://jcivl3hiqaxhbwfzutidtv7oye0hwwye.lambda-url.ap-south-1.on.aws/?product_id=${product_id}`,
            `https://jrnsqncrkey2it2grw62fnrahe0wqmkc.lambda-url.ap-south-1.on.aws/?product_id=${product_id}`,
            `https://rk6h6tvu45jtowigpye25x4w3m0jlnoq.lambda-url.ap-south-1.on.aws/?product_id=${product_id}`,
            `https://cwd7genlhnucrltegk4iqkbjou0trjzc.lambda-url.ap-south-1.on.aws/?product_id=${product_id}`,
        ];
        const random = Math.floor(Math.random() * (lambdaList.length));
        console.log(lambdaList[random]);
        return lambdaList[random];
    }

    async scrapeAllProduct(productList,scrapedList){
        let toggle = true;
        for (const product of productList) {
            const random = this.getRandomDelay();
            await this.sleep(random);
            if(toggle){
                const productData = await this.scrapeProduct(product);
                if(productData.success){
                    scrapedList.push(productData);
                }else{
                    scrapedList.push({...product})
                }
            }else{
                const resp = await fetch('https://product-scraper-1n2a.vercel.app/api/product',{
                    method : 'POST',
                    body : JSON.stringify({urls : product.PRODUCT_ID})
                });
                const data = await resp.json();
                if(data?.success){
                    scrapedList.push({...data?.data['0'],...product});
                }else{
                    scrapedList.push({...product})
                }
            }
            toggle = !toggle;
        }
    }
}

const scrapeService = new ScrapeService();

export default scrapeService;