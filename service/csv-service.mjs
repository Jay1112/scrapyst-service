import xlsx from 'xlsx';

class CsvService {

    csvTransformationUsing2DList(productList){
        // scrapeSheet
        const scrapeSheet = [];
        
        // date
        const date = new Date();
        let dateString = '' ; 
        if(date.getHours() < 12){
            dateString = date.getHours() + '_' + 'AM';
        }else{
            dateString = date.getHours() + '_' + 'PM';
        }
        scrapeSheet.push([dateString]);

        // fields
        const fields = ["SR_NO","PRODUCT_ID","TITLE","Seller_1","SP_1","Deal_Text","Seller_2","SP_2","Seller_3","SP_3"];
        scrapeSheet.push(fields);

        // product Data
        productList.forEach((item) => {
            let product = [];
            item.SR_NO ? product.push(item.SR_NO) : product.push('');
            item.PRODUCT_ID ? product.push(item.PRODUCT_ID) : product.push('');
            item.TITLE ? product.push(item.TITLE) : product.push('');

            item.Seller_1 ? product.push(item.Seller_1) : product.push('');
            item.SL_1 ? product.push(item.SL_1) : product.push('');
            item.Deal_Text ? product.push(item.Deal_Text) : product.push('');

            item.Seller_2 ? product.push(item.Seller_2) : product.push('');
            item.SL_2 ? product.push(item.SL_2) : product.push('');

            item.Seller_3 ? product.push(item.Seller_3) : product.push('');
            item.SL_3 ? product.push(item.SL_3) : product.push('');

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