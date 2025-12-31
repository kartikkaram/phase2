
import { Request, Response } from "express";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { User } from "../../entities/user.entities.js";


const logOutUser = asyncHandler(async (req:Request, res:Response) => {
  try {

    const user=await User.findOne({where:{id:req.user!.id}})
    if(!user){
      throw new apiError(404, "user not found")
    }

    user.refreshToken=""
    user.accessToken=""
    await user.save()
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };

    return res
      .status(201)
      .clearCookie("accessToken", cookieOptions)
      .clearCookie("refreshToken", cookieOptions)
      .json(
        new apiResponse(201, {}, "User logged out successfully")
      );
  } catch (error) {
    console.error("Error while logging out:", error);
    throw new apiError(402, "Error while logging out");
  }
});

export { logOutUser };
