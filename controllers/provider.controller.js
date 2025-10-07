import Provider from "../models/provider.js";
import fs from "fs";

const updateProviderProfile = async (req, res) => {
  try {
    const { name, mobile, category, price, description } = req.body;
    const providerId = req.user?.id; // assuming you're using authentication

    if (!providerId) {
      return res.status(401).json({ error: "Unauthorized: user not logged in" });
    }

    const provider = await Provider.findById(providerId);
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }

    // update fields if provided
    if (name) provider.name = name;
    if (mobile) provider.mobile = mobile;
    if (category) provider.category = category;
    if (price) provider.price = price;
    if (description) provider.description = description;

    // if image uploaded, update and delete old one
    if (req.file) {
      if (provider.profileImage && fs.existsSync(`.${provider.profileImage}`)) {
        fs.unlinkSync(`.${provider.profileImage}`);
      }
      provider.profileImage = req.file.path
        .replace(/\\/g, "/")
        .replace(/^.*uploads/, "/uploads");
    }

    await provider.save();

    res.status(200).json({
      message: "Provider profile updated successfully",
      provider,
    });
  } catch (error) {
    console.error("Error updating provider:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getProviderProfile = async (req, res) => {
  try {
    const providerId = req.user._id;

    const provider = await Provider.findById(providerId, {
      name: 1,
      email: 1,
      mobile: 1,
      category: 1,
      profileImage: 1,
      rating: 1,
      location: 1,
      price: 1,
      description: 1,
      address: 1,
      availability: 1,
    });

    if (!provider) {
      return res.status(404).json({ message: "Provider not found" });
    }

    res.status(200).json({ provider });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch provider data" });
  }
};

const updateProviderLocation = async (req, res) => {
  const providerId = req.user._id;
  const { lat, lng, address } = req.body;

  if (!providerId) return res.status(400).json({ message: "Provider ID is required" });
  if (lat == null || lng == null || !address) {
    return res.status(400).json({ message: "Latitude, longitude, and address are required" });
  }

  try {
    const provider = await Provider.findById(providerId);
    if (!provider) return res.status(404).json({ message: "Provider not found" });

    provider.location = {
      type: "Point",
      coordinates: [lng, lat],
    };
    provider.address = address;

    await provider.save();

    return res.json({ message: "Location saved successfully", location: provider.location });
  } catch (err) {
    console.error("Error saving provider location:", err);
    return res.status(500).json({ message: "Server error" });
  }
};



const providerController = {
  updateProviderProfile,
  getProviderProfile,
  updateProviderLocation
};

export default providerController;