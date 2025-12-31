import { Request, Response } from "express";
import { apiError } from "../../utils/apiError";
import { apiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Post, PostStatus } from "../../entities/post.entities";

interface PostQuery {
  status?: PostStatus;
  authorId?: string;
}

interface UpdatePostStatusBody {
  postId?: string;
  status?: PostStatus;
}

// GET /admin/posts?status=&authorId=
export const getAllPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const { status, authorId } = req.query as PostQuery;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (authorId) {
      where.author = { id: authorId };
    }

    const posts = await Post.find({
      where,
      relations: {
        author: true,
        categories: true,
      },
      order: { createdAt: "DESC" },
    });

    return res
      .status(200)
      .json(new apiResponse(200, posts, "all posts"));
  }
);

// PATCH /admin/posts/status
// body: { postId, status: PostStatus }
export const updatePostStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId, status } = req.body as UpdatePostStatusBody;

    if (!postId || !status) {
      throw new apiError(400, "postId and status are required");
    }

    if (
      status !== PostStatus.DRAFT &&
      status !== PostStatus.PUBLISHED
    ) {
      throw new apiError(400, "invalid status");
    }

    const post = await Post.findOne({
      where: { id: postId },
    });

    if (!post) {
      throw new apiError(404, "post not found");
    }

    post.status = status;

    if (status === PostStatus.PUBLISHED && !post.publishedAt) {
      post.publishedAt = new Date();
    }

    await post.save();

    return res
      .status(200)
      .json(new apiResponse(200, post, "post status updated"));
  }
);

// DELETE /admin/posts/:postId
export const deletePost = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId } = req.params as { postId: string };

    if (!postId) {
      throw new apiError(400, "postId is required");
    }

    const result = await Post.delete({ id: postId });

    if (result.affected === 0) {
      throw new apiError(404, "post not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, {}, "post deleted successfully"));
  }
);
