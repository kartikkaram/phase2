import jwt from "jsonwebtoken";
import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";


const VerifyJwt = asyncHandler(async function (req, _, next) {
try {
      // Extract token from different places
      const Token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken;
    
      if (!Token) {
        throw new apiError(400, "Token is required. Please provide it in cookies, body, or Authorization header.");
      }
    
      let DecodedToken = null;
    
      try {
        // Verify the token
        DecodedToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET);
      } catch (error) {
        if (error.name === "TokenExpiredError") {
          throw new apiError(401, "Access token expired");
        }
        console.error("Verification failed:", error);
        throw new apiError(401, "Invalid Access token");
      }
    
      // Token should not be null if verified
      if (!DecodedToken) {
        throw new apiError(401, "Invalid Access token");
      }
    
      // Look up the user from the database
      const user = await User.findById(DecodedToken._id).select("-password -refreshToken");
    
      if (!user) {
        throw new apiError(401, "User not found or invalid access token");
      }
    
      // Attach the user object to the request for further processing
      req.user = user;
      next(); // Proceed to the next middleware
} catch (error) {
    console.error("Error in VerifyJwt middleware:", error);
    next(error); // Pass the error to the next error handling middleware
}
});

export  { VerifyJwt };
