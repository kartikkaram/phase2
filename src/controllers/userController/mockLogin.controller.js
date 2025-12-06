import User from "../../models/user.model.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { GenerateAccessAndRefreshTokens } from "../../utils/GenerateTokens.js";

const mockLogin = asyncHandler(async (req, res) => {
  const { username, email } = req.body;

  if (!username && !email) {
    return res.status(400).json({ message: "Username or email required" });
  }

  let user = await User.findOne({
    $or: [{ username: username?.toLowerCase() }, { email }],
  });

  if (!user) {
    user = await User.create({
      username: username?.toLowerCase() || `user_${Date.now()}`,
      email: email || `user${Date.now()}@mock.com`,
      password: "mockpassword123", 
    });
  }

  const { accessToken, refreshToken } = await GenerateAccessAndRefreshTokens(user._id);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new apiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Mock login successful"
      )
    );
});

export { mockLogin };
