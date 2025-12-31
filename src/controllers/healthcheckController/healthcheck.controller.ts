import { Request, Response } from "express";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";


const healthcheck = asyncHandler(async (req:Request, res:Response) => {
  return res.status(200).json(
    new apiResponse(200, { status: "OK" }, "API is healthy")
  );
});

export { healthcheck };