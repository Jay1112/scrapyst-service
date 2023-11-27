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

    async composeMail(csvData,usersList){
      try{
        const date = new Date();
        let fileString = '';
        if(date.getHours() < 12){
          fileString = date.getDate() + '_' + date.getMonth() + '_' + date.getFullYear() + '-' + date.getHours() + '_' + 'AM' + '.xlsx' ;
        }else{
          fileString = date.getDate() + '_' + date.getMonth() + '_' + date.getFullYear() + '-' + date.getHours() + '_' + 'PM' + '.xlsx' ;
        }
        let MailGenerator = new Mailgen({
          theme : 'default',
          product : {
            name : 'Scrapyst',
            link : 'https://fovera.in'
          }
        });

        let response = {
          body : {
            intro : `CSV File is attached at the Bottom.`
          }
        }

        let mail = MailGenerator.generate(response);

        const packetData = {
          from: `${this.gmail}`, 
          to: usersList, 
          subject: "Product Data", 
          html: mail, 
          attachments: [
            {
              filename: fileString,
              content: csvData,
              encoding: 'base64',
            },
          ],
        };

        const mailResponse = await this.transporter.sendMail(packetData);
        return mailResponse ;
      }catch(err){
        console.log(err);
        return null;
      }
    }
}

// necessary variables
const gmail       = process.env.GMAIL ;
const password    = process.env.PASSWORD ;
const mailService = new MailService(gmail,password);

export default mailService ;