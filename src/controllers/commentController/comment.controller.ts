import { Request, Response } from "express";
import { apiError } from "../../utils/apiError";
import { apiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Comment, CommentStatus } from "../../entities/comment.entities";
import { Post, PostStatus } from "../../entities/post.entities";
import { sendEmail } from "../../utils/mailer";

interface CreateCommentBody {
  postId?: string;
  content?: string;
}

interface ReplyCommentBody {
  postId?: string;
  parentCommentId?: string;
  content?: string;
}

/* -----------------------------------------------------------
   GET APPROVED COMMENTS FOR A POST (PUBLIC)
   GET /comments/post/:postId
------------------------------------------------------------ */
export const getPostComments = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId } = req.params as { postId: string };

    if (!postId) {
      throw new apiError(400, "postId is required");
    }

    const comments = await Comment.find({
      where: {
        post: { id: postId },
        status: CommentStatus.APPROVED,
      },
      relations: {
        author: true,
      },
      order: { createdAt: "ASC" },
    });

    return res
      .status(200)
      .json(new apiResponse(200, comments, "post comments"));
  }
);

/* -----------------------------------------------------------
   CREATE TOP-LEVEL COMMENT (LOGGED-IN USER)
   POST /comments
   body: { postId, content }
------------------------------------------------------------ */
export const createComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId, content } = req.body as CreateCommentBody;

    if (!postId || !content) {
      throw new apiError(400, "postId and content are required");
    }

    const post = await Post.findOne({
  where: { id: postId },
  relations: {
    author: true,
  },
  select: {
    id: true,
    title: true,
    status:true,
    author: {
      email: true,
    },
  },
});

    if (!post || post.status !== PostStatus.PUBLISHED) {
      throw new apiError(404, "post not found or not published");
    }

    const comment = Comment.create({
      post,
      author: { id: req.user!.id },
      parentComment: null,
      content,
      status: CommentStatus.PENDING,
    });

    await comment.save();

       try {
   await sendEmail(post.author.email,`New comment on your post- ${post.title}`, post.title, content, req.user!.username);
} catch (err:unknown) {
  if(err instanceof Error){
  console.error("Email failed:", err.message);
  }
}

    return res
      .status(201)
      .json(
        new apiResponse(201, comment, "comment created (pending approval)")
      );
  }
);

/* -----------------------------------------------------------
   REPLY TO COMMENT (LOGGED-IN USER)
   POST /comments/reply
   body: { postId, parentCommentId, content }
------------------------------------------------------------ */
export const replyToComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId, parentCommentId, content } =
      req.body as ReplyCommentBody;

    if (!postId || !parentCommentId || !content) {
      throw new apiError(
        400,
        "postId, parentCommentId and content are required"
      );
    }

    const post = await Post.findOne({
      where: { id: postId },
    });

    if (!post || post.status !== PostStatus.PUBLISHED) {
      throw new apiError(404, "post not found or not published");
    }

    const parentComment = await Comment.findOne({
      where: { id: parentCommentId },
      relations: { post: true,
        author:true
       },
       select:{
        post:{
          id:true
        },
        author:{
          email:true
        },
        content:true,
        id:true
       }
    });

    if (!parentComment || parentComment.post.id !== postId) {
      throw new apiError(400, "parent comment not found for this post");
    }

    const comment = Comment.create({
      post,
      author: { id: req.user!.id },
      parentComment,
      content,
      status: CommentStatus.PENDING,
    });

    await comment.save();
       try {
  await sendEmail(parentComment.author.email,`${req.user!.username} replied to your comment- ${parentComment.content}`, post.title, content, req.user!.username);
} catch (err:unknown) {
   if(err instanceof Error){
  console.error("Email failed:", err.message);
  }
}

    return res
      .status(201)
      .json(
        new apiResponse(201, comment, "reply created (pending approval)")
      );
  }
);

/* -----------------------------------------------------------
   DELETE COMMENT (OWNER / ADMIN / POST AUTHOR)
   DELETE /comments/:commentId
------------------------------------------------------------ */
export const deleteComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { commentId } = req.params as { commentId: string };

    if (!commentId) {
      throw new apiError(400, "commentId is required");
    }

    const comment = await Comment.findOne({
      where: { id: commentId },
      relations: {
        post: { author: true },
        author: true,
      },
    });

    if (!comment) {
      throw new apiError(404, "comment not found");
    }

    const isOwner = comment.author.id === req.user!.id;
    const isAdmin = req.user!.role === "admin";
    const isPostAuthor = comment.post.author.id === req.user!.id;

    if (!isOwner && !isAdmin && !isPostAuthor) {
      throw new apiError(403, "not allowed to delete this comment");
    }

    await Comment.delete({ id: commentId });

    return res
      .status(200)
      .json(new apiResponse(200, {}, "comment deleted successfully"));
  }
);
