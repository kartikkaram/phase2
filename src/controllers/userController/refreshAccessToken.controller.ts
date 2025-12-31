import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { apiError } from "../../utils/apiError";
import { apiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { User } from "../../entities/user.entities";
import { generateAccessAndRefreshTokens } from "../../utils/generateToken";

interface RefreshTokenPayload extends JwtPayload {
  id: string;
}

export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
      throw new apiError(400, "Refresh token is required");
    }

    let decodedToken: RefreshTokenPayload;

    try {
      decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as RefreshTokenPayload;
    } catch {
      throw new apiError(401, "Invalid refresh token");
    }

    if (!decodedToken?.id) {
      throw new apiError(401, "Invalid refresh token");
    }

    const user = await User.findOne({
      where: { id: decodedToken.id },
    });

    if (!user) {
      throw new apiError(404, "User not found");
    }

    if (incomingRefreshToken !== user.refreshToken) {
      throw new apiError(403, "Incorrect refresh token");
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
    } = await generateAccessAndRefreshTokens(user.id);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new apiResponse(
          201,
          {
            user,
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Tokens refreshed successfully"
        )
      );
  }
);
