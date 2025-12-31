import { Router } from "express";
import { deleteUser, getUserById, getUsers, updateRole } from "../controllers/adminControllers/adminUser.controller";
import { deletePost, getAllPosts, updatePostStatus } from "../controllers/adminControllers/adminPost.controller";
import { deleteComment, getPendingComments, moderateComment } from "../controllers/adminControllers/adminComment.controller";
import { createCategory, deleteCategory, getCategories, updateCategory } from "../controllers/adminControllers/adminCategory.controller";
import { getAdminStats } from "../controllers/adminControllers/adminDashboard.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";
import { roleMiddleware } from "../middlewares/role.middleware";
import { UserRole } from "../entities/user.entities";


const adminRouter = Router();

// 🔐 all admin routes are protected
adminRouter.use(authMiddleware, roleMiddleware(UserRole.ADMIN));

// users
adminRouter.get("/users", getUsers);
adminRouter.get("/users/:userId", getUserById);
adminRouter.delete("/users/:userId", deleteUser);
adminRouter.patch("/users/role", updateRole);

// posts
adminRouter.get("/posts", getAllPosts);
adminRouter.patch("/posts/status", updatePostStatus);
adminRouter.delete("/posts/:postId", deletePost);

// comments
adminRouter.get("/comments/pending", getPendingComments);
adminRouter.patch("/comments/moderate", moderateComment);
adminRouter.delete("/comments/:commentId", deleteComment);

// categories
adminRouter.post("/categories", createCategory);
adminRouter.get("/categories", getCategories)
adminRouter.patch("/categories/:categoryId", updateCategory);
adminRouter.delete("/categories/:categoryId", deleteCategory);

// dashboard
adminRouter.get("/dashboard/stats", getAdminStats);

export { adminRouter };
