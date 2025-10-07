import express from "express";
import userController from "../controllers/user.controller.js";
import { uploadFile } from "../middlewares/multer.js";

const router = express.Router();

// Multer middleware for profile image
const upload = uploadFile("profileImage", "uploads/profiles");

//------- User Routes -------//
router.post("/update-user-location", userController.updateUserLocation);
router.get("/get-all-providers", userController.getAllProviders);
router.get("/get-user-location", userController.getUserLocation);
router.get("/get-nearby-providers", userController.getNearbyProviders);
router.get("/search-providers", userController.searchProviders);
router.get("/get-category-counts", userController.getCategoryCounts);
router.get("/get-providers-by-category", userController.getProvidersByCategory);
router.get("/get-provider-by-id/:id", userController.getProviderById);
router.post("/rate-provider/:providerId", userController.rateProvider);
router.get("/get-user-profile", userController.getUserProfile);


export default router;
