// utils/multer.js
import multer from "multer";
import path from "path";
import fs from "fs";

export const uploadFile = (fieldName, dir_name, maxFileSizeMB = 2) => {
  // Ensure the directory exists
  const uploadDir = path.join(process.cwd(), dir_name);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Multer storage config
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const name = file.fieldname + "-" + Date.now() + ext;
      cb(null, name);
    },
  });

  // File filter (accept only images)
  const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxFileSizeMB * 1024 * 1024 }, // Max file size in bytes
  }).single(fieldName);
};
