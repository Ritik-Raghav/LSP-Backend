// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profileImage: { type: String }, // URL or path to profile image
  location: {
    type: { type: String, default: "Point" },
    coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
  },
}, { timestamps: true });

userSchema.index({ location: "2dsphere" }); // For geospatial queries

export default mongoose.model("User", userSchema);
