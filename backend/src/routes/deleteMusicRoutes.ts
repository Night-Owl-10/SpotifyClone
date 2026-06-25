import { Router } from "express";
import { deleteMusicController } from "../controllers/deleteMusicController";

const router = Router();

// POST /api/delete-music
router.post("/delete-music", deleteMusicController);

export default router;
