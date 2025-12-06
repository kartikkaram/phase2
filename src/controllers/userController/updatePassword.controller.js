import User from "../../models/user.model.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";


const updatePassword = asyncHandler(async (req, res) => {
  const { newPassword, oldPassword } = req.body;

  if ([newPassword, oldPassword].some(field => field?.trim() === "")) {
    throw new apiError(400, "Fields should not be empty");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new apiError(404, "User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new apiError(401, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res.status(200).json(new apiResponse(200, {}, "Password updated successfully"));
});

export { updatePassword };
