const { uploadImageToCloudinary } = require("../utills/imageUploader");
const fs = require("fs");
const asyncHandler = require("express-async-handler");

exports.imageUpload = asyncHandler(async (req, res) => {
  try {
    const thumbnail = req.files.file;

    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );

    res.status(200).json({
      success: true,
      message: "Image upload successfully",
      thumbnailImage,
    });
  } catch (error) {}
});


exports.uploadImages = asyncHandler(async (req, res) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files were uploaded." });
    }

    const files = req.files.thumbnail; // Assumes files are uploaded with the name 'thumbnail'
    const urls = [];

    // Ensure files is an array
    const fileArray = Array.isArray(files) ? files : [files];

    // Upload each file to Cloudinary
    for (const file of fileArray) {
      const newpath = await uploadImageToCloudinary(
        file,
        process.env.FOLDER_NAME
      );
      urls.push(newpath);
      fs.unlinkSync(file.tempFilePath); // Delete the temp file
    }

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      images: urls,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res
      .status(500)
      .json({ success: false, message: "Image upload failed", error });
  }
});
