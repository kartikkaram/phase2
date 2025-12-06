import User from "../../models/user.model.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { GenerateAccessAndRefreshTokens } from "../../utils/GenerateTokens.js";


const userLogin = asyncHandler(async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new apiError(400, "Request body cannot be empty");
  }

  const { username, email, password } = req.body;

  if ([username, email, password].some(field => field?.trim() === "")) {
    throw new apiError(401, "All fields are required");
  }

  const user = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email }],
  });

  if (!user) {
    throw new apiError(404, "User not found, incorrect username or email");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new apiError(402, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await GenerateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  if (!loggedInUser) {
    throw new apiError(400, "You are not logged in");
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new apiResponse(
        201,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

export { userLogin };
