import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRoles = req.user?.roles || [];
    const isAuthorized = userRoles.some((role: string) =>
      roles.includes(role)
    );

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not have permission" });
    }

    next();
  };
};
