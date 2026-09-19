import { Router } from "express";
import { protectRoute } from "../middleware/auth";
import { getUsers } from "../controllers/userConrollers";

const router = Router();

router.get("/", protectRoute, getUsers)

export default router;