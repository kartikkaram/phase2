import { Request, Response, NextFunction } from "express";
import { apiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";
import { UserRole } from "../entities/user.entities";

export const roleMiddleware = (...allowedRoles: UserRole[]) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new apiError(401, "Not authenticated");
    }

    if (!allowedRoles.includes(user.role)) {
      throw new apiError(403, "Forbidden: insufficient permissions");
    }

    next();
  });
