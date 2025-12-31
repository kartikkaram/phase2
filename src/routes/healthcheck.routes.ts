import express from 'express';
import { healthcheck } from '../controllers/healthcheckController/healthcheck.controller.js';



const healthcheckRouter = express.Router();

// Public routes
healthcheckRouter.get("/",healthcheck);


export {healthcheckRouter};
