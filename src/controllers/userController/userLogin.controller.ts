import { Request, Response } from "express";
import { apiError } from "../../utils/apiError";
import { apiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";

import { User } from "../../entities/user.entities";
import { generateAccessAndRefreshTokens } from "../../utils/generateToken";

interface LoginBody {
  username?: string;
  email?: string;
  password?: string;
}

export const userLogin = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new apiError(400, "Request body cannot be empty");
    }

    const { username, email, password } = req.body as LoginBody;

    if (
      [username, email, password].some(
        (field) => field !== undefined && field.trim() === ""
      )
    ) {
      throw new apiError(401, "All fields are required");
    }

    if (!password || (!username && !email)) {
      throw new apiError(401, "Username/email and password are required");
    }

    const user = await User.findOne({
      where: [
        ...(username ? [{ username: username.toLowerCase() }] : []),
        ...(email ? [{ email }] : []),
      ],
      // IMPORTANT: password must be selected if column is select:false
      select: {
        id: true,
        password: true,
        refreshToken: true,
      },
    });

    if (!user) {
      throw new apiError(
        404,
        "User not found, incorrect username or email"
      );
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
      throw new apiError(402, "Invalid credentials");
    }

    const { accessToken, refreshToken } =
      await generateAccessAndRefreshTokens(user.id);

    const loggedInUser = await User.findOne({
      where: { id: user.id },
      select: {
        password: false,
        refreshToken: false,
      },
    });

    if (!loggedInUser) {
      throw new apiError(400, "You are not logged in");
    }

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
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
  }
);
