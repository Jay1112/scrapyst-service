import xlsx from 'xlsx';
import {config} from 'dotenv';
import axios from 'axios';

config();

class AwsService {

    async getFile(url){
        // Make an HTTP request to fetch the Excel file content
        const excelData  = await axios.get(url, { responseType: 'arraybuffer' });
    
        return excelData;
    }

    async getProductsFromMasterSheet(){
        const excelData = await this.getFile(process.env.MASTER_FILE_URL);
        const workbook = xlsx.read(excelData.data, { type: 'buffer' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let extractedData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
        return extractedData;
    }

}

const awsService = new AwsService();

export default awsService;