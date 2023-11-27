import cheerio  from 'cheerio-httpcli';

class ScrapeService {
    async scrapeProduct(productData){
        const { PRODUCT_ID } = productData ;
        const { $ } = await cheerio.fetch(`https://www.amazon.in/dp/${PRODUCT_ID}`);
        const Seller_1 = $("#merchant-info > .a-link-normal").text();
        const SL_1 = $("#corePriceDisplay_desktop_feature_div > .a-section.a-spacing-none.aok-align-center > .a-price.aok-align-center.reinventPricePriceToPayMargin.priceToPay > .a-offscreen").eq(0).text().trim();
        const Deal_Text = $("#dealBadgeSupportingText > span").eq(0).text();
        const SL_2 = $("#mbc-price-1").text().trim();
        const Seller_2 = $("#mbc-sold-by-1 > .a-size-small.mbcMerchantName").text().trim();
        const SL_3 = $("#mbc-price-2").text().trim();
        const Seller_3 = $("#mbc-sold-by-2 > .a-size-small.mbcMerchantName").text().trim();
    
        const data = {
            Seller_1,
            SL_1,
            Deal_Text,
            Seller_2,
            SL_2,
            Seller_3,
            SL_3
        };
    
        return {
            ...productData,
            ...data,
        };
    }

    async scrapeAllProduct(productList,scrapedList,curr_ind){
        if(curr_ind === productList.length){
            return ;
        }
        const product = productList[curr_ind];
        const data = await this.scrapeProduct(product);
        scrapedList.push(data);
        await this.scrapeAllProduct(productList,scrapedList,curr_ind+1);
    }
}

const scrapeService = new ScrapeService();

export default scrapeService;