import express from "express";
import { authMiddleware } from "../middlewares/auth.middlewares.js";
import {
  votePost,
  voteComment,
} from "../controllers/voteController/vote.controller.js";

const voteRouter = express.Router();

/* -------------------- PROTECTED ROUTES -------------------- */

voteRouter.use(authMiddleware);

// Upvote / Downvote a post
// body: { postId, value: 1 or -1 }
voteRouter.post("/post", votePost);

// Upvote / Downvote a comment
// body: { commentId, value: 1 or -1 }
voteRouter.post("/comment", voteComment);

export { voteRouter };
