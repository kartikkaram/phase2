import { Request, Response } from "express";
import { apiError } from "../../utils/apiError";
import { apiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { User } from "../../entities/user.entities";

interface UpdatePasswordBody {
  oldPassword?: string;
  newPassword?: string;
}

// PATCH /users/password
export const updatePassword = asyncHandler(
  async (req: Request, res: Response) => {
    const { oldPassword, newPassword } =
      req.body as UpdatePasswordBody;

    if (
      [oldPassword, newPassword].some(
        (field) => field !== undefined && field.trim() === ""
      )
    ) {
      throw new apiError(400, "Fields should not be empty");
    }

    if (!oldPassword || !newPassword) {
      throw new apiError(400, "Old password and new password are required");
    }

    const user = await User.findOne({
      where: { id: req.user!.id },
    });

    if (!user) {
      throw new apiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
      throw new apiError(401, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return res
      .status(200)
      .json(
        new apiResponse(200, {}, "Password updated successfully")
      );
  }
);
