import cheerio  from 'cheerio-httpcli';
import { config } from 'dotenv';

config();

class ScrapeService {

    minLimit = process.env.MIN_LIMIT ;
    maxLimit = process.env.MAX_LIMIT ;
    scrapeRateLimiting = process.env.RATE_LIMIT_VALUE ;
    listLimit = process.env.LIST_LIMIT || 50;

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

    async scrapeAllProduct(productList,scrapedList,curr_ind){
        if(curr_ind === this.listLimit){
            return ;
        }
        const product = productList[curr_ind];
        if( curr_ind !== 0 && (curr_ind % this.scrapeRateLimiting) === 0){
            const random  = Math.floor(this.minLimit + Math.random() * (this.maxLimit - this.minLimit));
            await this.sleep(random);
        }
        const data = await this.scrapeProduct(product);
        if(data.success){
            scrapedList.push(data);
        }
        await this.scrapeAllProduct(productList,scrapedList,curr_ind+1);
    }
}

const scrapeService = new ScrapeService();

export default scrapeService;