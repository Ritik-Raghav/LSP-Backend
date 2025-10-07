// models/Provider.js
import mongoose from "mongoose";

const providerSchema = new mongoose.Schema({
  name: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobile: { type: String, default: "" },
  profileImage: { type: String, default: "" }, // URL or path to profile image
  category: { type: String, default: "" }, // plumber, tutor, etc.
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
  address: { type: String, default: "" }, // human-readable address
  rating: { type: Number, default: 0 },
  price: { type: Number, default: 0 },
  description: { type: String, default: "" },
  availability: { type: Boolean, default: true },
}, { timestamps: true });

// Add geospatial index for location
providerSchema.index({ location: "2dsphere" });

export default mongoose.model("Provider", providerSchema);
