import { Router } from "express";

import { protectRoute } from "../middleware/auth";
import { authCallback, getMe } from "../controllers/authConrollers";

const router = Router();

//   /api/auh/me
router.get("/me", protectRoute, getMe)
router.post("/callback", authCallback)

export default router;