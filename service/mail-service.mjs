import nodemailer from 'nodemailer'; 
import Mailgen from 'mailgen';
import { config } from 'dotenv';

config();

// Mail Service
class MailService {
    transporter = null; 
    gmail = null ; 
    password = null ;
    
    constructor(gmail,password){
        this.gmail = gmail;
        this.password = password ;
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: gmail,
              pass: password
          }
      });
    }

    async composeMail(buffers,usersList){
      try{
        let MailGenerator = new Mailgen({
          theme : 'default',
          product : {
            name : 'Scrapyst',
            link : 'https://fovera.in'
          }
        });

        let response = {
          body : {
            intro : `CSV Files are attached at the Bottom.`
          }
        }

        let mail = MailGenerator.generate(response);

        const attachmentsArr = buffers.map((item)=>{
            // date
            const date = new Date();
            let dateString = '' ;

            // Specify the desired time zone
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
            
            let fileString = date.getDate() + '_' + (date.getMonth()+1) + '_' + date.getFullYear() + '-' + dateString +  '_'  + item.companyName  + '.xlsx' ;

            return {
              filename : fileString,
              content : item.bufferData,
              encoding: 'base64',
            }
        });

        const packetData = {
          from: `${this.gmail}`, 
          to: usersList, 
          subject: "Product Data", 
          html: mail, 
          attachments: [
            ...attachmentsArr
          ],
        };

        const mailResponse = await this.transporter.sendMail(packetData);
        return mailResponse ;
      }catch(err){
        return null;
      }
    }
}

// necessary variables
const gmail       = process.env.GMAIL ;
const password    = process.env.PASSWORD ;
const mailService = new MailService(gmail,password);

export default mailService ;