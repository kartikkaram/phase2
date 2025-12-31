import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { apiResponse } from "../../utils/apiResponse";
import { User } from "../../entities/user.entities";
import { Post } from "../../entities/post.entities";
import { Comment, CommentStatus } from "../../entities/comment.entities";

// GET /admin/dashboard/stats
export const getAdminStats = asyncHandler(
  async (_req: Request, res: Response) => {
    const [
      totalUsers,
      totalPosts,
      totalComments,
      pendingComments,
    ] = await Promise.all([
      User.count(),
      Post.count(),
      Comment.count(),
      Comment.count({
        where: { status: CommentStatus.PENDING },
      }),
    ]);

    const data = {
      totalUsers,
      totalPosts,
      totalComments,
      pendingComments,
    };

    return res
      .status(200)
      .json(new apiResponse(200, data, "admin dashboard stats"));
  }
);
