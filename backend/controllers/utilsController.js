import cloudinary from "../config/cloudinary.js";
import { uploadBufferToCloudinary } from "../config/uploadBuffer.js";
import { uploadMultipleFiles } from "../config/uploadMultipleFile.js";
import { pool } from "../database/db.js";
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
};

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
};

export const deleteSingle = async (req, res) => {
  try {
    const { publicId } = req.params;
    if (!publicId) {
      return res
        .status(400)
        .json({ message: "Public ID is required for deletion" });
    }
    const result = await deleteFile(publicId);
    return res.status(200).json({
      message: "File deleted successfully",
      result,
      success: true,
    });
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return res.status(500).json({ message: error.messagem, success: false });
  }
};
export const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
    }); //invalidate true to remove from CDN cache
    return result;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw error;
  }
};

export const deleteFiles = async (publicIds) => {
  try {
    const result = await cloudinary.api.delete_resources(publicIds, {
      invalidate: true,
    }); //invalidate true to remove from CDN cache
    return result;
  } catch (error) {
    console.error("Error deleting files from Cloudinary:", error);
    throw error;
  }
};

export const activityAnalytics = async (type, title, description, userId) => {
  try {
    console.log("Saving activity analytucs:", type, title, description, userId);
    await pool.query(
      `
    INSERT INTO activities (activity_type, title, description, user_id)
    VALUES (?, ?, ?, ?)
    `,
      [type, title, description, userId],
    );

    console.log("Activity analytucs saved:", type, title, description, userId);
  } catch (error) {
    console.error("Error saving activity analytucs:", error);
  }
};

export const getActivityAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    const { startDate, endDate, trend_type = "daily" } = req.query;

    // -----------------------------
    // 1. Base date filter
    // -----------------------------
    let dateFilter = "";
    const values = [userId];

    if (startDate && endDate) {
      dateFilter += ` AND created_at BETWEEN ? AND ? `;
      values.push(startDate, endDate);
    }

    // -----------------------------
    // 2. Activity Summary (COUNT by type)
    // -----------------------------
    const [summaryRows] = await pool.query(
      `
      SELECT activity_type, COUNT(*) AS total_activity
      FROM activities
      WHERE user_id = ?
      ${dateFilter}
      GROUP BY activity_type
      `,
      values,
    );

    // -----------------------------
    // 3. Recent Activities
    // -----------------------------
    const [recentActivities] = await pool.query(
      `
      SELECT 
        a.id,
        a.title,
        a.description,
        a.created_at,
        a.activity_type,
        u.name
      FROM activities a
      JOIN users u ON a.user_id = u.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
      LIMIT 10
      `,
      [userId],
    );

    // -----------------------------
    // 4. Trend Data (daily / monthly / yearly)
    // -----------------------------
    let groupByFormat = "%Y-%m-%d";

    if (trend_type === "monthly") {
      groupByFormat = "%Y-%m";
    } else if (trend_type === "yearly") {
      groupByFormat = "%Y";
    }

    const [trendRows] = await pool.query(
      `
      SELECT 
        DATE_FORMAT(created_at, ?) AS date,
        activity_type,
        COUNT(*) AS total
      FROM activities
      WHERE user_id = ?
      ${dateFilter}
      GROUP BY date, activity_type
      ORDER BY date ASC
      `,
      [groupByFormat, userId],
    );

    // -----------------------------
    // 5. Response
    // -----------------------------
    return res.status(200).json({
      success: true,
      message: "Activity analytics retrieved successfully",
      data: {
        summary: summaryRows,
        recentActivities,
        trend: trendRows,
      },
    });
  } catch (error) {
    console.error("Error getting activity analytics:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};