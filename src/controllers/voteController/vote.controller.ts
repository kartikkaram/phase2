import { apiError } from "../../utils/apiError";
import { Vote, VoteTargetType } from "../../entities/vote.entities";
import { Post } from "../../entities/post.entities";
import { Comment } from "../../entities/comment.entities";
import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { apiResponse } from "../../utils/apiResponse";

interface ApplyVoteArgs {
  userId: string;
  targetId: string;
  targetType: VoteTargetType;
  value: 1 | -1;
}

const applyVote = async ({
  userId,
  targetId,
  targetType,
  value,
}: ApplyVoteArgs): Promise<Post | Comment> => {
  if (value !== 1 && value !== -1) {
    throw new apiError(400, "value must be 1 (upvote) or -1 (downvote)");
  }

  // find existing vote
  const existingVote = await Vote.findOne({
    where: {
      user: { id: userId },
      targetType,
      targetId,
    },
  });

  let targetDoc: Post | Comment | null = null;

  if (targetType === VoteTargetType.POST) {
    targetDoc = await Post.findOne({ where: { id: targetId } });
  } else {
    targetDoc = await Comment.findOne({ where: { id: targetId } });
  }

  if (!targetDoc) {
    throw new apiError(404, `${targetType} not found`);
  }

  // CASE 1: no previous vote → create
  if (!existingVote) {
    const vote = Vote.create({
      user: { id: userId },
      targetType,
      targetId,
      value,
    });
    await vote.save();

    if (value === 1) targetDoc.upvotesCount += 1;
    if (value === -1) targetDoc.downvotesCount += 1;
  }
  // CASE 2: same vote again → toggle off
  else if (existingVote.value === value) {
    await Vote.delete({ id: existingVote.id });

    if (value === 1 && targetDoc.upvotesCount > 0) {
      targetDoc.upvotesCount -= 1;
    } else if (value === -1 && targetDoc.downvotesCount > 0) {
      targetDoc.downvotesCount -= 1;
    }
  }
  // CASE 3: opposite vote → switch
  else {
    if (existingVote.value === 1) {
      if (targetDoc.upvotesCount > 0) targetDoc.upvotesCount -= 1;
      targetDoc.downvotesCount += 1;
    } else {
      if (targetDoc.downvotesCount > 0) targetDoc.downvotesCount -= 1;
      targetDoc.upvotesCount += 1;
    }

    existingVote.value = value;
    await existingVote.save();
  }

  await targetDoc.save();
  return targetDoc;
};

interface VotePostBody {
  postId?: string;
  value?: number;
}

export const votePost = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId, value } = req.body as VotePostBody;

    if (!postId) {
      throw new apiError(400, "postId is required");
    }

    const updatedPost = await applyVote({
      userId: req.user!.id,
      targetId: postId,
      targetType: VoteTargetType.POST,
      value: Number(value) as 1 | -1,
    });

    return res.status(200).json(
      new apiResponse(
        200,
        {
          postId: updatedPost.id,
          upvotesCount: updatedPost.upvotesCount,
          downvotesCount: updatedPost.downvotesCount,
        },
        "post vote updated"
      )
    );
  }
);

interface VoteCommentBody {
  commentId?: string;
  value?: number;
}

export const voteComment = asyncHandler(
  async (req: Request, res: Response) => {
    const { commentId, value } = req.body as VoteCommentBody;

    if (!commentId) {
      throw new apiError(400, "commentId is required");
    }

    const updatedComment = await applyVote({
      userId: req.user!.id,
      targetId: commentId,
      targetType: VoteTargetType.COMMENT,
      value: Number(value) as 1 | -1,
    });

    return res.status(200).json(
      new apiResponse(
        200,
        {
          commentId: updatedComment.id,
          upvotesCount: updatedComment.upvotesCount,
          downvotesCount: updatedComment.downvotesCount,
        },
        "comment vote updated"
      )
    );
  }
);
