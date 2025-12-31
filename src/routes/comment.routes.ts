import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import { 
  getPostComments,
  createComment,
  replyToComment,
  deleteComment,
} from "../controllers/commentController/comment.controller.js";

const commentRouter = express.Router();

/* -------------------- PUBLIC ROUTES -------------------- */

// Get approved comments for a post
commentRouter.get("/post/:postId", getPostComments);

/* -------------------- PROTECTED ROUTES -------------------- */

commentRouter.use(authMiddleware);

// Create top-level comment
commentRouter.post("/", createComment);

// Reply to a comment
commentRouter.post("/reply", replyToComment);

// Delete a comment (owner or admin)
commentRouter.delete("/:commentId", deleteComment);

export { commentRouter };
