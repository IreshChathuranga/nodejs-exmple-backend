import { Router } from "express";
import { create ,myPost , viewAll} from "../controller/postController";
import { authenticate } from "../middleware/auth";
import { authorizeRoles } from "../middleware/authRole";
import { upload } from "../middleware/upload";
import { genrateContent } from "../controller/ai.controller";

const router = Router();

router.post("/create", authenticate,authenticate,authorizeRoles("ADMIN","AUTHOR") , upload.single("image"), create)  // file eke key eka denn oni , as a example image 
router.get("/", viewAll)
router.get("/me", authenticate,authenticate,authorizeRoles("ADMIN","AUTHOR") ,myPost)
router.post("/ai/genarate", genrateContent)

export default router;