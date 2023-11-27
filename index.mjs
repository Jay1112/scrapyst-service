import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';  
import appRouter from './routers/app-router.mjs';
const PORT = process.env.PORT ;

const app = express();

dotenv.config();

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());


function MountRoutes(app){
    app.use('/api/v1/app',appRouter);
}

MountRoutes(app);

app.listen(PORT,()=>{
    console.log(`Server is Listening `);
})