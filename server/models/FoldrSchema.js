const mongoose = require('mongoose');

// Define the LoverPhoto schema
const loverPhotoSchema = new mongoose.Schema(
  {
    folderName: {
      type: String,
      required: true,
      trim: true
    },
    images: [
        {
            public_id: String,
            url: String,
          },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId, // Refers to the User
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoverPhoto', loverPhotoSchema);
