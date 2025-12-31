import { Request, Response } from "express";
import { apiError } from "../../utils/apiError";
import { apiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Post, PostStatus } from "../../entities/post.entities";
import { Category } from "../../entities/category.entities";
import type * as Multer from "multer";
import { uploadOnCloudinary } from "../../utils/cloudinaryUpload";
import { In } from "typeorm";

interface CreatePostBody {
  title?: string;
  content?: string;
  categories?: string[];
}

interface UpdatePostBody {
  title?: string;
  content?: string;
  categories?: string[];
}


/* -----------------------------------------------------------
   CREATE POST (Author only)
   POST /posts
------------------------------------------------------------ */
export const createPost = asyncHandler(
  async (req: Request, res: Response) => {
    const { title, content, categories } = req.body as CreatePostBody;

    if (!title || !content) {
      throw new apiError(400, "title and content are required");
    }

    // upload attachments
   const files = (req.files as Express.Multer.File[]) || [];
    const attachments = await Promise.all(
      files.map(async (file) => {
        try {
          const uploaded = await uploadOnCloudinary(file.path);
          return uploaded.url;
        } catch {
          throw new apiError(
            400,
            "Error while uploading image to Cloudinary"
          );
        }
      })
    );

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[\s\W-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const categoryEntities = categories
      ? await Category.findBy({ id: In(categories) })
      : [];
    const post = Post.create({
      title,
      slug,
      content,
      author:req.user,
      categories: categoryEntities,
      attachments,
      status: PostStatus.DRAFT,
    });

    await post.save();

    return res
      .status(201)
      .json(new apiResponse(201, post, "post created successfully"));
  }
);

/* -----------------------------------------------------------
   UPDATE POST (Author/Admin)
   PATCH /posts/:postId
------------------------------------------------------------ */
export const updatePost = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId } = req.params as { postId: string };
    const body = req.body as UpdatePostBody;

    const post = await Post.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post) {
      throw new apiError(404, "post not found");
    }

    if (
      post.author.id !== req.user!.id &&
      req.user!.role !== "admin"
    ) {
      throw new apiError(403, "not allowed to edit this post");
    }

    if (body.title !== undefined && body.title.trim() !== "") {
      post.title = body.title;
      post.slug = body.title
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    if (body.content !== undefined) {
      post.content = body.content;
    }

    if (body.categories) {
      post.categories = await Category.findByIds(body.categories);
    }

    await post.save();

    return res
      .status(200)
      .json(new apiResponse(200, post, "post updated successfully"));
  }
);

/* -----------------------------------------------------------
   DELETE POST
   DELETE /posts/:postId
------------------------------------------------------------ */
export const deletePost = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId } = req.params as { postId: string };

    const post = await Post.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post) {
      throw new apiError(404, "post not found");
    }

    if (
      post.author.id !== req.user!.id &&
      req.user!.role !== "admin"
    ) {
      throw new apiError(403, "not allowed to delete this post");
    }

    await Post.delete({ id: postId });

    return res
      .status(200)
      .json(new apiResponse(200, {}, "post deleted successfully"));
  }
);

/* -----------------------------------------------------------
   PUBLISH POST
   PATCH /posts/:postId/publish
------------------------------------------------------------ */
export const publishPost = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId } = req.params as { postId: string };

    const post = await Post.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post) {
      throw new apiError(404, "post not found");
    }

    if (
      post.author.id !== req.user!.id &&
      req.user!.role !== "admin"
    ) {
      throw new apiError(403, "not allowed to publish this post");
    }

    post.status = PostStatus.PUBLISHED;
    post.publishedAt = new Date();

    await post.save();

    return res
      .status(200)
      .json(new apiResponse(200, post, "post published successfully"));
  }
);

/* -----------------------------------------------------------
   UNPUBLISH POST
   PATCH /posts/:postId/unpublish
------------------------------------------------------------ */
export const unpublishPost = asyncHandler(
  async (req: Request, res: Response) => {
    const { postId } = req.params as { postId: string };

    const post = await Post.findOne({
      where: { id: postId },
      relations: { author: true },
    });

    if (!post) {
      throw new apiError(404, "post not found");
    }

    if (
      post.author.id !== req.user!.id &&
      req.user!.role !== "admin"
    ) {
      throw new apiError(403, "not allowed to unpublish this post");
    }

    post.status = PostStatus.DRAFT;
    await post.save();

    return res
      .status(200)
      .json(new apiResponse(200, post, "post unpublished successfully"));
  }
);

/* -----------------------------------------------------------
   GET ALL PUBLISHED POSTS (PUBLIC)
   GET /posts
------------------------------------------------------------ */
export const getPublishedPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const { category, author, search } = req.query as {
      category?: string;
      author?: string;
      search?: string;
    };

    const where: any = { status: PostStatus.PUBLISHED };

    if (author) {
      where.author = { id: author };
    }

    if (category) {
      where.categories = { id: category };
    }

    const posts = await Post.find({
      where,
      relations: {
        author: true,
        categories: true,
      },
      order: { publishedAt: "DESC" },
    });

    return res
      .status(200)
      .json(new apiResponse(200, posts, "published posts"));
  }
);

/* -----------------------------------------------------------
   GET SINGLE POST + INCREMENT VIEW COUNT
   GET /posts/:slug
------------------------------------------------------------ */
export const getSinglePost = asyncHandler(
  async (req: Request, res: Response) => {
    const { slug } = req.params as { slug: string };

    const post = await Post.findOne({
      where: {
        slug,
        status: PostStatus.PUBLISHED,
      },
      relations: {
        author: true,
        categories: true,
      },
    });

    if (!post) {
      throw new apiError(404, "post not found");
    }

    post.viewCount += 1;
    await post.save();

    return res
      .status(200)
      .json(new apiResponse(200, post, "post details"));
  }
);

/* -----------------------------------------------------------
   GET POSTS OF CURRENT AUTHOR
   GET /posts/mine
------------------------------------------------------------ */
export const getMyPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const posts = await Post.find({
      where: { author: { id: req.user!.id } },
    });

    return res
      .status(200)
      .json(new apiResponse(200, posts, "your posts"));
  }
);
