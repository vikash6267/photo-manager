const Folder = require('../models/FoldrSchema'); // Ensure the correct model name is used



exports.createFolder = async (req, res) => {
  try {
    const { folderName } = req.body;
    
    // Check if folderName is provided
    if (!folderName || typeof folderName !== 'string' || folderName.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing folder name",
      });
    }

    const userId = req.user.id;

    // Check if folder with the same name already exists for the user
    const existingFolder = await Folder.findOne({ folderName, createdBy: userId });
    if (existingFolder) {
      return res.status(400).json({
        success: false,
        message: "Folder with this name already exists",
      });
    }

    // Create new folder
    const newFolder = await Folder.create({
      folderName,
      createdBy: userId
    });

    return res.status(200).json({
      success: true,
      message: "Folder created successfully",
      folder: newFolder
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating folder",
      error: error.message,
    });
  }
};

// Upload Photo Controller
exports.uploadPhoto = async (req, res) => {
    try {
      const { folderNameId, images } = req.body;
      const userId = req.user.id;
      
      // Parse the `images` array from the request body if needed
      const imagesArray = Array.isArray(images) ? images : JSON.parse(images);
  
      // Validate inputs
      if (!folderNameId || !imagesArray || !imagesArray.length) {
        return res.status(400).json({
          success: false,
          message: "Invalid folder ID or images",
        });
      }
  
      // Check if the folder exists and is owned by the current user
      const folder = await Folder.findOne({ _id: folderNameId, createdBy: userId });
      if (!folder) {
        return res.status(404).json({
          success: false,
          message: "Folder not found. Please create one first.",
        });
      }
  
      // Check each image to ensure it's not already in the folder
      const duplicateImages = imagesArray.filter(imageUrl => folder.images.includes(imageUrl));
      
      if (duplicateImages.length) {
        return res.status(400).json({
          success: false,
          message: `These images already exist in the folder: ${duplicateImages.join(', ')}`,
        });
      }
  
      // Add new images to the folder
      folder.images.push(...imagesArray);
      await folder.save();
  
      return res.status(200).json({
        success: true,
        message: "Photos uploaded successfully",
        folder,
      });
    } catch (error) {
      // console.log(error)
      return res.status(500).json({
        success: false,
        message: "Error uploading photos",
        error: error.message,
      });
    }
  };
  
// Fetch Images by User ID and Folder ID
exports.getImagesByFolder = async (req, res) => {
    try {
      const { folderId } = req.params; // Use params for folderId
      const userId = req.user.id;
  
      // Check if the folder exists and is owned by the current user
      const folder = await Folder.findOne({ _id: folderId, createdBy: userId });
  
      if (!folder) {
        return res.status(404).json({
          success: false,
          message: "Folder not found or you do not have access to this folder.",
        });
      }
  
      // Return the images in the folder
      return res.status(200).json({
        success: true,
        images: folder.images,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error fetching images",
        error: error.message,
      });
    }
  };
  

  // Get All Folders by User ID
exports.getAllFolders = async (req, res) => {
    try {
      const userId = req.user.id;
  console.log(userId)
      // Retrieve all folders created by the user
      const folders = await Folder.find({ createdBy: userId });
  
      if (!folders || folders.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No folders found for this user.",
        });
      }
  
      return res.status(200).json({
        success: true,
        folders,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error retrieving folders",
        error: error.message,
      });
    }
  };
 
exports.getSingleFolder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { folderId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1); // Ensure page is at least 1
    const limit = Math.max(1, parseInt(req.query.limit) || 6); // Ensure limit is at least 1

    // Find the folder by its ID and check if it belongs to the user
    const folder = await Folder.findOne({ _id: folderId, createdBy: userId });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: "Folder not found or does not belong to this user.",
      });
    }

    // Optional: Sort images by createdAt date in descending order
    folder.images.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination logic for images
    const startIndex = (page - 1) * limit;
    const paginatedImages = folder.images.slice(startIndex, startIndex + limit);

    return res.status(200).json({
      success: true,
      images: paginatedImages, // Return the paginated images
      currentPage: page,
      totalImages: folder.images.length,
      totalPages: Math.ceil(folder.images.length / limit),
      limit: limit,
    });
  } catch (error) {
    console.error("Error retrieving folder:", error); // Log the error for debugging
    return res.status(500).json({
      success: false,
      message: "Error retrieving folder",
      error: error.message,
    });
  }
};

  
  