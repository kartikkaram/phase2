import { Request, Response } from "express";
import { apiError } from "../../utils/apiError";
import { apiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { User } from "../../entities/user.entities";
import { uploadOnCloudinary } from "../../utils/cloudinaryUpload";

interface RegisterBody {
  username?: string;
  email?: string;
  password?: string;
}

export const userRegistration = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      throw new apiError(400, "Request body cannot be empty");
    }

    const { username, email, password } = req.body as RegisterBody;

    if (
      [username, email, password].some(
        (field) => field !== undefined && field.trim() === ""
      )
    ) {
      throw new apiError(400, "Fields cannot be empty");
    }

    if (!username || !email || !password) {
      throw new apiError(400, "Username, email and password are required");
    }

    const existingUser = await User.findOne({
      where: [
        { username: username.toLowerCase() },
        { email },
      ],
    });

    if (existingUser) {
      throw new apiError(
        401,
        "User with same email or username already exists"
      );
    }

    const imageLocalPath = req.file?.path;

    if (!imageLocalPath) {
      throw new apiError(400, "Image file is missing");
    }

    let uploadedImage: { url: string };

    try {
      uploadedImage = await uploadOnCloudinary(imageLocalPath);
    } catch {
      throw new apiError(
        400,
        "Error while uploading image to Cloudinary"
      );
    }

    try {
      const user = User.create({
        username: username.toLowerCase(),
        email,
        password,
        imageUrl: uploadedImage.url,
      });

      await user.save();

      const createdUser = await User.findOne({
        where: { id: user.id },
        select: {
          password: false,
          refreshToken: false,
        },
      });

      if (!createdUser) {
        throw new apiError(
          400,
          "Something went wrong while registering"
        );
      }

      return res
        .status(201)
        .json(
          new apiResponse(
            201,
            createdUser,
            "User registered successfully"
          )
        );
    } catch (error) {
      console.error("User creation failed:", error);
      throw new apiError(
        500,
        "User was not created; uploaded image deleted from Cloudinary"
      );
    }
  }
);
