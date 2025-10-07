import User from "../models/user.js";
import Provider from "../models/provider.js";
import mongoose from "mongoose";
import Review from "../models/review.js";

const updateUserLocation = async (req, res) => {
  try {
    const userId = req.user._id; // Get logged-in user ID from req.user
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.location = {
      type: "Point",
      coordinates: [lng, lat], // [lng, lat] for GeoJSON
    };

    await user.save();

    res.status(200).json({
      message: "Location updated successfully",
      location: user.location,
    });
  } catch (error) {
    console.error("Error updating location:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllProviders = async (req, res) => {
  try {
    // Fetch all providers, return only relevant fields
    const providers = await Provider.find().select(
      "name profileImage mobile category location address rating price description availability"
    );

    res.status(200).json({ success: true, providers });
  } catch (err) {
    console.error("Error fetching providers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getNearbyProviders = async (req, res) => {
  try {
    // 1️⃣ Get the user from req.user (assumes middleware added it)
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user || !user.location || !user.location.coordinates) {
      return res.status(400).json({
        success: false,
        message: "User location not found.",
      });
    }

    const [userLng, userLat] = user.location.coordinates;

    // 2️⃣ Define search radius (in meters)
    const maxDistance = 10000; // 10 km radius — you can adjust

    // 3️⃣ Fetch nearby providers using geospatial query
    const providers = await Provider.find({
      availability: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [userLng, userLat] },
          $maxDistance: maxDistance,
        },
      },
    }).select(
      "name profileImage mobile category location address rating price description availability"
    );

    // 4️⃣ Return nearby providers
    res.status(200).json({
      success: true,
      message: "Nearby providers fetched successfully",
      providers,
    });
  } catch (err) {
    console.error("Error fetching nearby providers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUserLocation = async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware
    const user = await User.findById(userId).select("location");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.location || !user.location.coordinates) {
      return res.status(200).json({ message: "No location saved yet", location: null });
    }

    const [lng, lat] = user.location.coordinates;
    res.status(200).json({
      message: "User location fetched successfully",
      location: { lat, lng },
    });
  } catch (error) {
    console.error("Error fetching user location:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const searchProviders = async (req, res) => {
  try {
    const { query } = req.query;

    // If query is empty, return nearby providers as fallback
    if (!query || query.trim() === "") {
      return getNearbyProviders(req, res);
    }

    // Build search regex (case-insensitive)
    const searchRegex = new RegExp(query, "i");

    // Optional: you can include location-based filtering if user is logged in
    let user = null;
    if (req.user && req.user._id) {
      user = await User.findById(req.user._id);
    }

    // Build query conditions
    const conditions = {
      availability: true,
      $or: [
        { name: { $regex: searchRegex } },
        { category: { $regex: searchRegex } },
        { address: { $regex: searchRegex } },
      ],
    };

    // If user has a location, apply distance filtering (optional)
    if (user?.location?.coordinates) {
      const [userLng, userLat] = user.location.coordinates;
      conditions.location = {
        $near: {
          $geometry: { type: "Point", coordinates: [userLng, userLat] },
          $maxDistance: 10000, // 10 km radius
        },
      };
    }

    const providers = await Provider.find(conditions).select(
      "name profileImage mobile category location address rating price description availability"
    );

    res.status(200).json({
      success: true,
      message: "Providers search results fetched successfully",
      providers,
    });
  } catch (err) {
    console.error("Error searching providers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getCategoryCounts = async (req, res) => {
  try {
    const user = req.user; // assuming middleware attaches user
    if (!user || !user.location || !user.location.coordinates) {
      return res
        .status(400)
        .json({ success: false, message: "User location not found" });
    }

    const [lng, lat] = user.location.coordinates; // Mongo stores as [lng, lat]
    const radius = 10; // default radius in km
    const maxDistance = radius * 1000; // convert km to meters

    const counts = await Provider.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [lng, lat],
          },
          distanceField: "distance",
          maxDistance,
          spherical: true,
        },
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const formatted = counts.map((c) => ({
      category: c._id,
      count: c.count,
    }));

    res.status(200).json({
      success: true,
      message: "Nearby category counts fetched successfully",
      data: formatted,
    });
  } catch (err) {
    console.error("Error fetching nearby category counts:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getProvidersByCategory = async (req, res) => {
  try {
    const { category, radius = 10 } = req.query; // radius in km

    if (!category) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }

    const user = req.user; // get logged-in user
    if (!user || !user.location || !user.location.coordinates) {
      return res
        .status(400)
        .json({ success: false, message: "User location not found" });
    }

    const [lng, lat] = user.location.coordinates; // MongoDB stores [lng, lat]
    const maxDistance = parseFloat(radius) * 1000; // km → meters

    const providers = await Provider.find({
      category: { $regex: new RegExp(category, "i") },
      availability: true,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: maxDistance,
        },
      },
    }).select(
      "name profileImage mobile category location address rating price description availability"
    );

    res.status(200).json({
      success: true,
      message: "Nearby providers fetched successfully",
      providers,
    });
  } catch (error) {
    console.error("Error fetching nearby category providers:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getProviderById = async (req, res) => {
  try {
    const { id } = req.params; // provider ID from URL

    if (!id) {
      return res
        .status(400)
        .json({ success: false, message: "Provider ID is required" });
    }

    const provider = await Provider.findById(id).select(
      "name profileImage mobile category location address rating price description availability"
    );

    if (!provider) {
      return res
        .status(404)
        .json({ success: false, message: "Provider not found" });
    }

    res.status(200).json({
      success: true,
      message: "Provider fetched successfully",
      provider,
    });
  } catch (error) {
    console.error("Error fetching provider by ID:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const rateProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const { rating } = req.body;
    const userId = req.user._id; // set by authMiddleware

    // Validate providerId
    if (!mongoose.Types.ObjectId.isValid(providerId)) {
      return res.status(400).json({ message: "Invalid provider ID" });
    }

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if provider exists
    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    // Upsert review
    let review = await Review.findOne({ providerId, userId });

    if (review) {
      review.rating = rating;
      await review.save();
    } else {
      review = new Review({ providerId, userId, rating });
      await review.save();
    }

    // Recalculate average rating
    const reviews = await Review.find({ providerId });
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    provider.rating = avgRating;
    await provider.save();

    res.status(200).json({
      message: "Rating submitted successfully",
      rating: avgRating.toFixed(1),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(userId).select("name email profileImage");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const userController = {
  updateUserLocation,
  getAllProviders,
  getUserLocation,
  getNearbyProviders,
  searchProviders,
  getCategoryCounts,
  getProvidersByCategory,
  getProviderById,
  rateProvider,
  getUserProfile,
};

export default userController;
