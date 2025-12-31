import { Request, Response } from "express";
import { apiError } from "../../utils/apiError";
import { apiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { Category } from "../../entities/category.entities";

interface CategoryBody {
  name?: string;
  slug?: string;
  description?: string;
}


// POST /admin/categories
export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, slug, description } = req.body as CategoryBody;

    if (!name) {
      throw new apiError(400, "name is required");
    }

    const existing = await Category.findOne({
      where: [
        { name },
        ...(slug ? [{ slug }] : []),
      ],
    });

    if (existing) {
      throw new apiError(409, "category with this name or slug already exists");
    }

    const category = Category.create({
      name,
      slug,
      description,
    });

    await category.save();

    return res
      .status(201)
      .json(new apiResponse(201, category, "category created"));
  }
);

// GET /admin/categories
export const getCategories = asyncHandler(
  async (_req: Request, res: Response) => {
    const categories = await Category.find({
      order: { name: "ASC" },
    });

    return res
      .status(200)
      .json(new apiResponse(200, categories, "all categories"));
  }
);

// PATCH /admin/categories/:categoryId
export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { categoryId } = req.params as {categoryId:string};
    const { name, slug, description } = req.body as CategoryBody ;

    if (!categoryId) {
      throw new apiError(400, "categoryId is required");
    }

    const category = await Category.findOne({
      where: { id: categoryId },
    });

    if (!category) {
      throw new apiError(404, "category not found");
    }

    if (name !== undefined) category.name = name;
    if (slug !== undefined) category.slug = slug;
    if (description !== undefined) category.description = description;

    await category.save();

    return res
      .status(200)
      .json(new apiResponse(200, category, "category updated"));
  }
);

// DELETE /admin/categories/:categoryId
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { categoryId } = req.params as {categoryId:string};

    if (!categoryId) {
      throw new apiError(400, "categoryId is required");
    }

    const result = await Category.delete({ id: categoryId });

    if (result.affected === 0) {
      throw new apiError(404, "category not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, {}, "category deleted"));
  }
);
