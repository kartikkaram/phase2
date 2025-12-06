import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { GenerateAccessAndRefreshTokens } from "../../utils/GenerateTokens.js";

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(400, "Refresh token is required");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (error) {
    console.error("Verification failed:", error);
    throw new apiError(401, "Invalid refresh token");
  }

  if (!decodedToken) {
    throw new apiError(401, "Invalid refresh token");
  }

  const user = await User.findById(decodedToken._id);
  if (!user) {
    throw new apiError(404, "User not found");
  }

  if (incomingRefreshToken !== user.refreshToken) {
    throw new apiError(403, "Incorrect refresh token");
  }

  const { accessToken, refreshToken: newRefreshToken } = await GenerateAccessAndRefreshTokens(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new apiResponse(
        201,
        { user, accessToken, refreshToken: newRefreshToken },
        "Tokens refreshed successfully"
      )
    );
});

export { refreshAccessToken };
