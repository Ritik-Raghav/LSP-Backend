import express from "express";
import publicController from "../controllers/public.controller.js";
import { uploadFile } from "../middlewares/multer.js";

const router = express.Router();

// Multer middleware for profile image
const upload = uploadFile("profileImage", "uploads/profiles");

//------- User Routes -------//
router.post("/user-signup", upload, publicController.signupUser);
router.post("/user-login", publicController.loginUser);

//------- Provider Routes -------//
router.post("/provider-signup", upload, publicController.signupProvider);
router.post("/provider-login", publicController.loginProvider);

export default router;
