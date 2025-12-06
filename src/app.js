import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { Error_Handler } from './middlewares/Errors.middlewares.js';
import dotenv from "dotenv"
import userRouter from './routes/user.routes.js';
import { healthCheck } from './controllers/healthCheckController/healthCheck.controller.js';


dotenv.config()



const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,  
    credentials: true,              
  }),
);
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.json({limit:"16kb"}))
app.use(express.static("public"));
app.use(cookieParser())

// routes
app.use("/api/v1/healthcheck",healthCheck)
app.use("/api/v1/users", userRouter);


app.use(Error_Handler)
export default app

