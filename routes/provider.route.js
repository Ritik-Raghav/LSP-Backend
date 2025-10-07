import express from "express";
import providerController from "../controllers/provider.controller.js";
import { uploadFile } from "../middlewares/multer.js";

const router = express.Router();

// Multer middleware for profile image
const upload = uploadFile("profileImage", "uploads/provider-profiles");

//------- Provider Routes -------//
router.put("/update-provider-profile", upload, providerController.updateProviderProfile);
router.get("/get-provider-profile", providerController.getProviderProfile);
router.post("/set-provider-location", providerController.updateProviderLocation);


export default router;
