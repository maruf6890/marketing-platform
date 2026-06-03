import cloudinary from "../config/cloudinary.js"
import { uploadBufferToCloudinary } from "../config/uploadBuffer.js";
import { uploadMultipleFiles } from "../config/uploadMultipleFile.js";
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload_stream(
      {
        folder: "uploads",
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return res.status(500).json({ message: error.message });
        }

        return res.status(200).json({
          message: "Upload successful",
          url: result.secure_url,
          public_id: result.public_id,
        });
      },
    );

    result.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const uploadSingleFile = async (req, res) => { 
  try {
    const result = await uploadBufferToCloudinary(req.file.buffer);
    return res.status(200).json({
      message: "Upload successful",
      url: result.secure_url,
      public_id: result.public_id,
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
}

export const uploadMultiple = async (req, res) => {
  try {
    const results = await uploadMultipleFiles(req.files);
    return res.status(200).json({
      message: "Upload successful",
      files: results.map((result) => ({
        url: result.secure_url,
        public_id: result.public_id,
        success: true,
      })),
      success: true,
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
}
