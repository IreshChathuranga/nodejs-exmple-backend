import { Router } from "express";
import {
  getMyDetails,
  login,
  register,
  registerAdmin
} from "../controller/authController";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/authRole";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMyDetails);
router.post("/admin/register",authenticate,authorizeRoles("ADMIN"),registerAdmin);

export default router;
