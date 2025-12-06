import User from "../../models/user.model.js";
import { apiError } from "../../utils/apiError.js";
import { apiResponse } from "../../utils/apiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../../utils/couldinaryUpload.js";


const userRegistration = asyncHandler(async (req, res) => {
  let uploadedImage = null;

  if (!req.body || Object.keys(req.body).length === 0) {
    throw new apiError(400, "Request body cannot be empty");
  }

  const { username, email, password } = req.body;

  if ([username, email, password].some(field => field?.trim() === "")) {
    throw new apiError(400, "Fields cannot be empty");
  }

  const existingUser = await User.findOne({
    $or: [{ username: username.toLowerCase() }, { email }],
  });

  if (existingUser) {
    throw new apiError(401, "User with same email or username already exists");
  }

const imageLocalPath = req.file?.path;

  if (!imageLocalPath) {
    throw new apiError(400, "Image file is missing");
  }

  try {
    uploadedImage = await uploadOnCloudinary(imageLocalPath);
  } catch (error) {
    console.log("Error uploading image:", error);
    throw new apiError(400, "Error while uploading image to Cloudinary");
  }

  try {
    const user = await User.create({
      username: username.toLowerCase(),
      email,
      password,
      imageUrl: uploadedImage.url,
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
      throw new apiError(400, "Something went wrong while registering");
    }

    return res
      .status(201)
      .json(new apiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    console.log("User creation failed:", error);
    throw new apiError(
      500,
      "User was not created; uploaded image deleted from Cloudinary"
    );
  }
});

export { userRegistration };
