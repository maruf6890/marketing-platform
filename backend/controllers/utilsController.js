import cloudinary from "../config/cloudinary.js"

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
