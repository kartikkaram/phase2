import express from 'express';
import { userRegistration } from '../controllers/userController/userRegistration.controller.js';
import { userLogin } from '../controllers/userController/userLogin.controller.js';
import { refreshAccessToken } from '../controllers/userController/refreshAccessToken.controller.js';
import { currentUser } from '../controllers/userController/getCurrentUser.controller.js';
import { updateAccountDetails } from '../controllers/userController/updateDetails.controller.js';
import { logOutUser } from '../controllers/userController/userLogout.controller.js';
import { updatePassword } from '../controllers/userController/updatePassword.controller.js';
import { authMiddleware } from '../middlewares/auth.middlewares.js';
import { upload } from '../middlewares/multer.middlewares.js';

const userRouter = express.Router();

// Public routes
userRouter.post("/register",upload.single("image"), userRegistration);
userRouter.post("/login", userLogin);
userRouter.post("/refresh-token", refreshAccessToken);

// Protected routes
userRouter.use(authMiddleware);

userRouter.get("/current-user", currentUser);
userRouter.patch("/update-account", updateAccountDetails);
userRouter.post("/update-password", updatePassword);
userRouter.post("/logout", logOutUser);

export {userRouter};
