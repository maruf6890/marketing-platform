import axios from "axios";
import { pool } from "../database/db.js";

//delete post
export const deletePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    // Check if post exists and belongs to user
    const [postRows] = await pool.query(
      `SELECT id FROM posts WHERE id = ? AND user_id = ?`,
      [postId, userId],
    );
    if (postRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    //delete post
    await pool.query(`DELETE FROM posts WHERE id = ?`, [postId]);
    return res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//get post by post id
export const getPostById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    // Check if post exists and belongs to user
    const [postRows] = await pool.query(
      `SELECT id, content, status, scheduled_at FROM posts WHERE id = ? AND user_id = ?`,
      [postId, userId],
    );
    if (postRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }
    const post = postRows[0];
    const [mediaRows] = await pool.query(
      `SELECT id, type, url, public_id FROM media WHERE post_id = ?`,
      [postId],
    );
    post.media = mediaRows;
    return res.status(200).json({
      success: true,
      data: post,
      message: "Post retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//delete medias
export const deleteMediaByUrls = async (urls) => {
  try {
    const [result] = await pool.query(`DELETE FROM media WHERE url IN (?)`, [
      urls,
    ]);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

//get posts with filters like by month,by days, by weeks,by years
export const getPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const { from, to } = req.query;

    let query = `
      SELECT 
        p.id,
        p.content,
        p.status,

        CASE
          WHEN p.status = 'scheduled' THEN p.scheduled_at
          WHEN p.status = 'published' THEN p.published_at
          ELSE p.updated_at
        END AS event_date,

        (SELECT COUNT(*) 
         FROM media 
         WHERE media.post_id = p.id) AS media_count

      FROM posts p
      WHERE p.user_id = ?
    `;

    const params = [userId];

    if (from && to) {
      const startDate = new Date(from);
      const endDate = new Date(to);
      endDate.setHours(23, 59, 59, 999);

      query += `
        AND (
          (p.status = 'scheduled' AND p.scheduled_at BETWEEN ? AND ?)
          OR
          (p.status = 'published' AND p.published_at BETWEEN ? AND ?)
          OR
          (p.status IN ('draft', 'cancelled') AND p.updated_at BETWEEN ? AND ?)
        )
      `;

      params.push(startDate, endDate, startDate, endDate, startDate, endDate);
    }

    const [posts] = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      data: posts,
      message: "Posts retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};