import { Router } from "express";
import { deleteAccountController } from "../controllers/deleteAccountController";

const router = Router();

// POST /api/delete-account
router.post("/delete-account", deleteAccountController);

export default router;
