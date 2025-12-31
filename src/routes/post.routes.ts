import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { roleMiddleware } from "../middlewares/role.middleware.js";

import {
  createPost,
  updatePost,
  deletePost,
  publishPost,
  unpublishPost,
  getPublishedPosts,
  getSinglePost,
  getMyPosts,
} from "../controllers/postController/post.controller.js";
import { UserRole } from "../entities/user.entities.js";
import { upload } from "../middlewares/multer.middlewares.js";

const postRouter = express.Router();

/* -------------------- PUBLIC ROUTES -------------------- */

// Get all published posts (with filters: ?category=&author=&search=)
postRouter.get("/", getPublishedPosts);

// Get single post by slug (also increments viewCount)
postRouter.get("/:slug", getSinglePost);

/* -------------------- PROTECTED ROUTES -------------------- */

// Everything below this line needs auth
postRouter.use(authMiddleware);
postRouter.use(roleMiddleware(UserRole.ADMIN, UserRole.AUTHOR));

// Get posts of current logged-in user (author dashboard)
postRouter.get("/mine/list", getMyPosts); 

// Create a post (author or admin)
postRouter.post(
  "/create",upload.array("photos", 5),
  createPost
);

// Update a post
postRouter.patch(
  "/:postId",
  updatePost
);

// Delete a post
postRouter.delete(
  "/:postId",
   deletePost
);

// Publish a post
postRouter.patch(
  "/:postId/publish",
  publishPost
);

// Unpublish a post
postRouter.patch(
  "/:postId/unpublish",
  unpublishPost
);

export {postRouter};
