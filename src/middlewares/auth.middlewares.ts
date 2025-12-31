import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, NextFunction } from "express";
import { apiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../entities/user.entities";

interface AccessTokenPayload extends JwtPayload {
  id: string;
}

export const authMiddleware = asyncHandler(
  async (req: Request, _res, next: NextFunction) => {
  
    const token =
      req.header("Authorization")?.replace("Bearer ", "") ||
      req.cookies?.accessToken;

    if (!token) {
      throw new apiError(
        400,
        "Token is required. Please provide it in cookies or Authorization header."
      );
    }


    let decoded: AccessTokenPayload;

    try {
      decoded = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      ) as AccessTokenPayload;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new apiError(401, "Access token expired");
      }
      throw new apiError(401, "Invalid access token");
    }

    if (!decoded?.id) {
      throw new apiError(401, "Invalid access token");
    }

    
    const user = await User.findOne({
      where: { id: decoded.id },
      select: {
        password: false,
        refreshToken: false,
      },
    });

    if (!user) {
      throw new apiError(401, "User not found or invalid access token");
    }

 
    req.user = user;

    next();
  }
);
