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
    await pool.query(
      `DELETE FROM posts WHERE id = ?`,
      [postId],
    );
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
}

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
}

//delete medias 
export const deleteMediaByUrls = async (urls) => {
  try {
    const [result] = await pool.query(
      `DELETE FROM media WHERE url IN (?)`,
      [urls]
    );
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
