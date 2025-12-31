import { Request, Response } from "express";
import { apiError } from "../../utils/apiError";
import { apiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { User } from "../../entities/user.entities";

interface UpdateAccountBody {
  username?: string;
  email?: string;
  password?: string;
}


// PATCH /users/me
export const updateAccountDetails = asyncHandler(
  async (req: Request, res: Response) => {
    const { username, email, password } =
      req.body as UpdateAccountBody;

    if (!password) {
      throw new apiError(
        400,
        "Password is required to update account details"
      );
    }

    const user = await User.findOne({
      where: { id: req.user!.id },
    });

    if (!user) {
      throw new apiError(404, "User not found");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new apiError(401, "Password is incorrect");
    }

    if (username !== undefined && username.trim() !== "") {
      user.username = username.toLowerCase();
    }

    if (email !== undefined && email.trim() !== "") {
      user.email = email;
    }

    await user.save();

    const savedUser = await User.findOne({
      where: { id: user.id },
      select: {
        password: false,
        refreshToken: false,
      },
    });

    if (!savedUser) {
      throw new apiError(
        500,
        "Something went wrong while saving updated user"
      );
    }

    return res
      .status(200)
      .json(
        new apiResponse(
          200,
          savedUser,
          "Account details updated successfully"
        )
      );
  }
);
