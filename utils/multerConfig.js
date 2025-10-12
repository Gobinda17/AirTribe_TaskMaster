// I'm importing multer for handling multipart/form-data file uploads
const multer = require("multer");
// I'm importing path module for handling file extensions
const path = require("path");

// I'm configuring disk storage for uploaded files
const storage = multer.diskStorage({
  // I'm setting the destination folder where uploaded files will be stored
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // I'm storing files in the 'uploads' directory
  },
  // I'm defining how uploaded files should be named to prevent conflicts
  filename: (req, file, cb) => {
    // I'm creating unique filenames using timestamp and original filename
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

// I'm implementing file type validation to restrict allowed file formats
const fileFilter = (_, file, cb) => {
  // I'm defining allowed file types using regex pattern
  const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
  // I'm checking if the file extension matches allowed types
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  // I'm checking if the MIME type matches allowed types
  const mimetype = allowedTypes.test(file.mimetype);

  // I'm accepting the file only if both extension and MIME type are valid
  if (extname && mimetype) {
    cb(null, true);
  } else {
    // I'm rejecting files that don't match allowed types
    cb(new Error("Only image and document files are allowed!"));
  }
};

// I'm creating the multer instance with all configurations
const upload = multer({
  // I'm using the disk storage configuration I defined above
  storage,
  // I'm applying the file type filter to validate uploads
  fileFilter,
  // I'm setting file size limits to prevent large file uploads (5MB limit)
  limits: { fileSize: 5 * 1024 * 1024 },
});

// I'm exporting the configured multer instance for use in routes
module.exports = upload;
