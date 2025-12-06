import User from "../../models/user.model.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const currentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new apiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { username, email, password} = req.body;

  if (!password) {
    throw new apiError(400, "Password is required to update account details");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new apiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new apiError(401, "Password is incorrect");
  }

  if (username?.trim() !== "") {
    user.username = username.toLowerCase();
  }

  if (email?.trim() !== "") {
    user.email = email;
  }



  await user.save();

  const savedUser = await User.findById(user._id).select("-password -refreshToken");
  if (!savedUser) {
    throw new apiError(500, "Something went wrong while saving updated user");
  }

  return res
    .status(200)
    .json(new apiResponse(200, savedUser, "Account details updated successfully"));
});

export { currentUser, updateAccountDetails };
