import { Request, Response } from "express";
import { apiError } from "../../utils/apiError";
import { apiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Comment, CommentStatus } from "../../entities/comment.entities";

interface ModerateCommentBody {
  commentId?: string;
  action?: "approve" | "reject";
}

// GET /admin/comments/pending
export const getPendingComments = asyncHandler(
  async (_req: Request, res: Response) => {
    const comments = await Comment.find({
      where: { status: CommentStatus.PENDING },
      relations: {
        post: true,
        author: true,
      },
      order: { createdAt: "DESC" },
    });

    return res
      .status(200)
      .json(new apiResponse(200, comments, "pending comments"));
  }
);

// PATCH /admin/comments/moderate
export const moderateComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { commentId, action } = req.body as ModerateCommentBody;

    if (!commentId || !action) {
      throw new apiError(400, "commentId and action are required");
    }

    if (action !== "approve" && action !== "reject") {
      throw new apiError(400, "invalid action");
    }

    const comment = await Comment.findOne({
      where: { id: commentId },
    });

    if (!comment) {
      throw new apiError(404, "comment not found");
    }

    comment.status =
      action === "approve"
        ? CommentStatus.APPROVED
        : CommentStatus.REJECTED;

    await comment.save();

    return res
      .status(200)
      .json(new apiResponse(200, comment, `comment ${action}d`));
  }
);


// DELETE /admin/comments/:commentId
export const deleteComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { commentId } = req.params as { commentId: string };

    if (!commentId) {
      throw new apiError(400, "commentId is required");
    }

    const result = await Comment.delete({ id: commentId });

    if (result.affected === 0) {
      throw new apiError(404, "comment not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, {}, "comment deleted successfully"));
  }
);
