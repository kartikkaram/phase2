import { Request, Response } from "express";
import { apiError } from "../../utils/apiError";
import { apiResponse } from "../../utils/apiResponse";
import { asyncHandler } from "../../utils/asyncHandler";
import { User, UserRole } from "../../entities/user.entities";
import { redisClient } from "../../config/redisClient";

interface UpdateRoleBody {
  userId?: string;
  newRole?: UserRole;
}

// GET /admin/users
export const getUsers = asyncHandler(
  async (_req: Request, res: Response) => {
    const cacheKey = "users:all";

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      return res
        .status(200)
        .json(new apiResponse(200, JSON.parse(cached), "all users (cached)"));
    }

    const users = await User.find({
      where: [
        { role: UserRole.AUTHOR },
        { role: UserRole.READER },
      ],
      select: {
        password: false,
        refreshToken: false,
      },
    });

    await redisClient.setEx(cacheKey, 120, JSON.stringify(users)); 

    return res
      .status(200)
      .json(new apiResponse(200, users, "all users"));
  }
);


// GET /admin/users/:userId
export const getUserById = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };

    if (!userId) {
      throw new apiError(400, "userId is required");
    }

    const user = await User.findOne({
      where: { id: userId },
      select: {
        password: false,
        refreshToken: false,
      },
    });

    if (!user) {
      throw new apiError(404, "user not found");
    }

    return res
      .status(200)
      .json(new apiResponse(200, user, "user details"));
  }
);

// DELETE /admin/users/:userId
export const deleteUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.params as { userId: string };

    if (!userId) {
      throw new apiError(400, "userId is required");
    }

    // prevent self-delete
    if (req.user && req.user.id === userId) {
      throw new apiError(400, "You cannot delete your own account");
    }

    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new apiError(404, "user not found");
    }

    if (user.role === UserRole.ADMIN) {
      throw new apiError(401, "you cannot delete an admin");
    }

    await User.delete({ id: userId });

    return res
      .status(200)
      .json(new apiResponse(200, {}, "user deleted successfully"));
  }
);

// PATCH /admin/users/role
export const updateRole = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, newRole } = req.body as UpdateRoleBody;

    if (!userId || !newRole) {
      throw new apiError(400, "userId and newRole are required");
    }

    if (
      newRole !== UserRole.ADMIN &&
      newRole !== UserRole.AUTHOR &&
      newRole !== UserRole.READER
    ) {
      throw new apiError(400, "invalid role");
    }

    const user = await User.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new apiError(404, "user not found");
    }

    if (user.role === UserRole.ADMIN) {
      throw new apiError(401, "you cannot update the role of an admin");
    }

    if (user.role === newRole) {
      return res
        .status(200)
        .json(new apiResponse(200, {}, "user already has this role"));
    }

    user.role = newRole;
    await user.save();

    return res
      .status(200)
      .json(new apiResponse(200, { user }, "user role updated"));
  }
);
