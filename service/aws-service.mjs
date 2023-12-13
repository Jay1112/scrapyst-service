import AWS from 'aws-sdk';
import {config} from 'dotenv';
import axios from 'axios';
import xlsx from 'xlsx';

config();

class AwsService {
        s3Client = null;

    constructor(accessKeyId, secretAccessKey) {
        this.s3Client = new AWS.S3({
        accessKeyId,
        secretAccessKey
        });
    }

    async put(request){
        return new Promise((resolve, reject) => {
        this.s3Client.putObject(request, (error, data) => {
            if (error) {
            return reject(error)
            }
            return resolve(data)
        })
        })
    }

    createPutPublicJsonRequest(location,filename,contents) {
        const request = {
        Bucket: location,
        Key: filename,
        Body: contents,
        ContentType: 'application/json; charset=utf-8',
        }
        return request;
    }

    async getFile(url,resType){
        const excelData  = await axios.get(url, { responseType: resType });
        return excelData;
    }

    async getProductsFromMasterSheet(fileurl){
        const excelData = await this.getFile(fileurl,'arraybuffer');
        const workbook = xlsx.read(excelData.data, { type: 'buffer' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        let extractedData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

        // products
        let productData = extractedData.filter((item,index)=>{
            if(index <= 1){
                return false;
            }
            return true;
        })
        .map((item)=>{
            return { SR_NO : item[0], PRODUCT_ID : item[1], TITLE : item[2], True_Deal_Price : item[3]};
        });

        return productData;
    }
}

const awsService = new AwsService();

// const s3PutRequest = s3Client.createPutPublicJsonRequest(
//     'mybucket/bucketpath',
//     'filename.json',
//     JSON.stringify({ hello: 'world' })
//   )
  
//   const s3Response = await s3Client.put(s3PutRequest)

export default awsService;