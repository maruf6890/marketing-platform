import axios from "axios";
import { pool } from "../database/db.js";
import { deleteFiles, activityAnalytics } from "./utilsController.js";
export const reqUsersPageList = async (req, res) => {
  console.log("Requesting user's Facebook pages...");
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `
      SELECT access_token,id
      FROM user_platform_accounts
      WHERE user_id = ?
      AND platform_id = (
        SELECT id
        FROM platforms
        WHERE name = 'facebook'
      )
      `,
      [userId],
    );
    console.log("Database query result:", result);
    const accessToken = result[0][0]?.access_token;
    const accountId = result[0][0]?.id;
    console.log("Retrieved access token:", accessToken);

    if (!accessToken) {
      return res.status(404).json({
        message: "Facebook access token not found",
      });
    }

    const response = await axios.get(
      "https://graph.facebook.com/v25.0/me/accounts",
      {
        params: {
          access_token: accessToken,
          fields: "id,name,access_token",
        },
      },
    );

    console.log("Facebook API response:", response.data);
    for (const page of response.data.data) {
      await pool.query(
        `
    INSERT INTO user_platform_assets
    (
      account_id,
      asset_id,
      name,
      type,
      access_token
    )
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      type = VALUES(type),
      access_token = VALUES(access_token)
    `,
        [accountId, page.id, page.name, "facebook_page", page.access_token],
      );
    }
    console.log("Facebook pages saved to database");

    // Return facebook pages list  select id, asset_id, name, type from user_platform_assets;
    const [rows] = await pool.query(
      `
      SELECT id, asset_id, name, type
        FROM user_platform_assets
        WHERE account_id = ?
        AND type = 'facebook_page'
      `,
      [accountId],
    );

    return res.status(200).json({
      data: rows,
      message: "Facebook pages retrieved successfully",
      success: true,
    });
  } catch (error) {
    console.error(error.response?.data || error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// get users pages list from database
export const getUsersPageList = async (req, res) => {
  console.log("Getting user's Facebook pages from database...");
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `
        SELECT a.id, a.asset_id, a.name, a.type
        FROM user_platform_assets a
        JOIN user_platform_accounts ac ON a.account_id = ac.id
        WHERE ac.user_id = ?
        AND a.type = 'facebook_page'
        `,
      [userId],
    );
    console.log("Facebook pages retrieved from database:", rows);
    return res.status(200).json({
      data: rows,
      message: "Facebook pages retrieved successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const createPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { pageId, message, images, tags, status, scheduled_at } = req.body;

    console.log("Creating post with data:", {
      pageId,
      message,
      images,
      tags,
      status,
      scheduled_at,
    });
    const [rows] = await pool.query(
      `
    SELECT access_token,asset_id
    FROM user_platform_assets    WHERE id = ?
    `,
      [pageId],
    );
    if (rows.length === 0) {
      return res.status(404).json({
        message: "Page not found",
      });
    }
    console.log("Retrieved page access token:", rows[0].access_token);

    const pageAccessToken = rows[0]?.access_token;
    const pageAssetId = rows[0]?.asset_id;

    //save posts
    //insert into posts (user_id,content_type,content,status,scheduled_at) value
    const [result] = await pool.query(
      `
  INSERT INTO posts (user_id, content_type, content, status, scheduled_at, platform_asset_id)
  VALUES (?, ?, ?, ?, ?, ?)
  `,
      [
        userId,
        "post",
        message + " " + tags.map((tag) => `${tag}`).join(" "),
        status,
        scheduled_at && status === "scheduled" ? new Date(scheduled_at) : null,
        pageId,
      ],
    );
    const postId = result.insertId;

    if (images && images.length > 0) {
      const mediaValues = images.map((image) => [
        userId,
        postId,
        "image",
        image.url,
        "uploaded",
        image.public_id || null,
      ]);

      const [mediaResult] = await pool.query(
        `
    INSERT INTO media (user_id, post_id, type, url, upload_status, public_id)
    VALUES ?
    `,
        [mediaValues],
      );
      if (mediaResult.affectedRows === 0) {
        return res.status(500).json({
          success: false,
          message: "Failed to save media",
        });
      }
    }
    if (status === "scheduled" || status === "draft") {
      try {
        activityAnalytics(status=="scheduled" ? "post_scheduled" : "post_draft",
          status == "scheduled" ? `A schedule post created` : `A draft post created`,
          `${userId} has created a ${status} post on facebook`, userId)
      } catch (error) {
        console.error("Error saving activity analytics:", error);
      }
      return res.status(200).json({
        message: "Post saved successfully",
        success: true,
      });
    }
    if (status === "publishable") {
      if (images.length == 0) {
        //send post request to facebook with text only
        const postRes = await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/feed`,
          {
            message: message + " " + tags.map((tag) => `${tag}`).join(" "),
            access_token: pageAccessToken,
          },
        );
        console.log("Facebook API response for text-only post:", postRes.data);
      } else {
        if (images.length === 1) {
          //send post request to facebook with text and single image
          const singleImageRes = await axios.post(
            `https://graph.facebook.com/v25.0/${pageAssetId}/photos`,
            {
              caption: message + " " + tags.map((tag) => `${tag}`).join(" "),
              url: images[0].url,
              access_token: pageAccessToken,
            },
          );


          console.log(
            "Facebook API response for single image post:",
            singleImageRes.data,
          );
        } else {
          //send post request to facebook with text and multiple images
          const mediaIds = [];
          for (const image of images) {
            const mediaRes = await axios.post(
              `https://graph.facebook.com/v25.0/${pageAssetId}/photos`,
              {
                url: image.url,
                access_token: pageAccessToken,
                published: false,
              },
            );
            mediaIds.push(mediaRes.data.id);
          }
          const multipleImageRes = await axios.post(
            `https://graph.facebook.com/v25.0/${pageAssetId}/feed`,
            {
              message: message + " " + tags.map((tag) => `${tag}`).join(" "),
              attached_media: mediaIds.map((id) => ({ media_fbid: id })),
              access_token: pageAccessToken,
            },
          );

          console.log(
            "Facebook API response for multiple image post:",
            multipleImageRes.data,
          );
        }
      }
      //update post status to published
      await pool.query(
        `
      UPDATE posts
      SET status = 'published', published_at = NOW()
      WHERE id = ?
      `,
        [postId],
      );

      try {
        activityAnalytics("post_published",
          `A published post created`,
          `${userId} has published post on facebook`, userId)
      } catch (error) {
        console.error("Error saving activity analytics:", error);
      }
      return res.status(200).json({
        message: "Post created and published successfully",
        success: true,
      });
    }
  } catch (error) {
    console.error(error.response?.data || error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export const getDraftsPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `
      SELECT p.id, p.content, p.scheduled_at, pa.name, pa.type, GROUP_CONCAT(m.url) AS media_urls
      FROM posts p
      LEFT JOIN media m ON p.id = m.post_id
      LEFT JOIN user_platform_assets pa ON p.platform_asset_id = pa.id
      WHERE p.user_id = ? AND p.status = 'draft'
      GROUP BY p.id
      ORDER BY p.created_at DESC
      `,
      [userId],
    );
    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getScheduledPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `
      SELECT p.id, p.content, p.scheduled_at, pa.name, pa.type, GROUP_CONCAT(m.url) AS media_urls
      FROM posts p
      LEFT JOIN media m ON p.id = m.post_id
      LEFT JOIN user_platform_assets pa ON p.platform_asset_id = pa.id
      WHERE p.user_id = ? AND p.status = 'scheduled'
      GROUP BY p.id
      ORDER BY p.created_at DESC
      `,
      [userId],
    );
    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const loadFacebookFeed = async (userId) => {
  try {
    // Get all user's Facebook pages with access tokens
    const [pages] = await pool.query(
      `
      SELECT id, asset_id, name, access_token
      FROM user_platform_assets
      WHERE account_id IN (
        SELECT id FROM user_platform_accounts
        WHERE user_id = ?
      )
      AND type = 'facebook_page'
      `,
      [userId],
    );

    let allPosts = [];

    // Fetch posts from each page
    for (const page of pages) {
      try {
        const response = await axios.get(
          `https://graph.facebook.com/v25.0/${page.asset_id}/feed`,
          {
            params: {
              access_token: page.access_token,
              fields:
                "id,message,created_time,status_type,permalink_url,attachments{media,type,subattachments{media}}",
              limit: 50,
            },
          },
        );

        // Add page info to posts and extract multiple images
        const postsWithPageInfo = response.data.data.map((post) => {
          const images = [];

          // Extract images from attachments and subattachments
          if (
            post.attachments &&
            post.attachments.data &&
            post.attachments.data.length > 0
          ) {
            for (const attachment of post.attachments.data) {
              if (
                attachment.media &&
                attachment.media.image &&
                attachment.media.image.src
              ) {
                if (!images.includes(attachment.media.image.src)) {
                  images.push(attachment.media.image.src);
                }
              }

              if (attachment.subattachments && attachment.subattachments.data) {
                // remove attachment media from images if exist in subattachments
                if (
                  attachment.media &&
                  attachment.media.image &&
                  attachment.media.image.src
                ) {
                  const index = images.indexOf(attachment.media.image.src);
                  if (index > -1) {
                    images.splice(index, 1);
                  }
                }
                for (const subattachment of attachment.subattachments.data) {
                  if (
                    subattachment.media &&
                    subattachment.media.image &&
                    subattachment.media.image.src
                  ) {
                    if (!images.includes(subattachment.media.image.src)) {
                      images.push(subattachment.media.image.src);
                    }
                  }
                }
              }
            }
          }

          return {
            ...post,
            page_id: page.id,
            page_name: page.name,
            page_asset_id: page.asset_id,
            access_token: page.access_token,
            images: images,
          };
        });

        allPosts = allPosts.concat(postsWithPageInfo);
      } catch (error) {
        console.error(
          `Error fetching posts from page ${page.name}:`,
          error.response?.data || error,
        );
      }
    }

    // Sort by created_time descending
    allPosts.sort(
      (a, b) => new Date(b.created_time) - new Date(a.created_time),
    );

    return allPosts;
  } catch (error) {
    console.error("Error loading Facebook feed:", error);
    throw error;
  }
};

export const getFacebookFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await loadFacebookFeed(userId);

    return res.status(200).json({
      success: true,
      data: posts,
      message: "Facebook feed loaded successfully",
    });
  } catch (error) {
    console.error("Error getting Facebook feed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load Facebook feed",
    });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Access token is required",
      });
    }

    const response = await axios.get(
      `https://graph.facebook.com/v25.0/${postId}/comments`,
      {
        params: {
          access_token: accessToken,
          fields:
            "id,message,created_time,from.fields(id,name,picture),comments.limit(50){id,message,created_time,from.fields(id,name,picture)}",
          limit: 100,
        },
      },
    );

    return res.status(200).json({
      success: true,
      data: response.data.data,
      message: "Comments loaded successfully",
    });
  } catch (error) {
    console.error(
      "Error fetching post comments:",
      error.response?.data || error,
    );
    return res.status(500).json({
      success: false,
      message: "Failed to load comments",
    });
  }
};

export const publishScheduledOrDraftPost = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const userId = req.user.id;
    const {
      pageId,
      postId,
      message,
      images,
      tags,
      scheduled_at = null,
    } = req.body;

    console.log("Creating post with data:", {
      pageId,
      postId,
      message,
      images,
      tags,
      scheduled_at,
    });
    const [rows] = await pool.query(
      `
      SELECT access_token,asset_id
      FROM user_platform_assets WHERE id = ?
      `,
      [pageId],
    );
    if (rows.length === 0) {
      return res.status(404).json({
        message: "Page not found",
      });
    }
    console.log("Retrieved page access token:", rows[0].access_token);

    const pageAccessToken = rows[0]?.access_token;
    const pageAssetId = rows[0]?.asset_id;

    const publishImages = Array.isArray(images) ? images : [];

    if (publishImages.length == 0) {
      //send post request to facebook with text only
      const postRes = await axios.post(
        `https://graph.facebook.com/v25.0/${pageAssetId}/feed`,
        {
          message: message + " " + tags.map((tag) => `${tag}`).join(" "),
          access_token: pageAccessToken,
        },
      );
      console.log("Facebook API response for text-only post:", postRes.data);
    } else {
      if (publishImages.length === 1) {
        //send post request to facebook with text and single image
        const singleImageRes = await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/photos`,
          {
            caption: message + " " + tags.map((tag) => `${tag}`).join(" "),
            url: publishImages[0].url,
            access_token: pageAccessToken,
          },
        );

        console.log(
          "Facebook API response for single image post:",
          singleImageRes.data,
        );
      } else {
        //send post request to facebook with text and multiple images
        const mediaIds = [];
        for (const image of publishImages) {
          const mediaRes = await axios.post(
            `https://graph.facebook.com/v25.0/${pageAssetId}/photos`,
            {
              url: image.url,
              access_token: pageAccessToken,
              published: false,
            },
          );
          mediaIds.push(mediaRes.data.id);
        }
        const multipleImageRes = await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/feed`,
          {
            message: message + " " + tags.map((tag) => `${tag}`).join(" "),
            attached_media: mediaIds.map((id) => ({ media_fbid: id })),
            access_token: pageAccessToken,
          },
        );

        console.log(
          "Facebook API response for multiple image post:",
          multipleImageRes.data,
        );
      }
    }
    //update post status to published
    await connection.query(
      `
        UPDATE posts
        SET status = 'published', published_at = NOW()
        WHERE id = ?
        `,
      [postId],
    );

    return res.status(200).json({
      message: "Post created and published successfully",
      success: true,
    });

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error(error.response?.data || error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  } finally {
    await connection.release();
  }
};
//edit post

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
      `SELECT id, type, url FROM media WHERE post_id = ?`,
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

//edit post by post id
export const editPost = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;
    if (!postId) {
      return res.status(400).json({
        success: false,
        message: "Post ID is required",
      });
    }
    const {
      pageId,
      message,
      images = [],
      tags = [],
      status,
      scheduled_at,
    } = req.body;

    console.log("Updating post with data:", {
      pageId,
      message,
      images,
      tags,
      status,
      scheduled_at,
    });

    // 1. Get page access token
    const [rows] = await pool.query(
      `
      SELECT access_token, asset_id
      FROM user_platform_assets
      WHERE id = ?
      `,
      [pageId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Page not found" });
    }

    const pageAccessToken = rows[0].access_token;
    const pageAssetId = rows[0].asset_id;

    // 2. Update post content
    const fullContent = message + " " + (tags.length ? tags.join(" ") : "");

    const scheduledDate = scheduled_at ? new Date(scheduled_at) : null;

    await pool.query(
      `
      UPDATE posts
      SET content = ?, status = ?, scheduled_at = ?
      WHERE id = ? AND user_id = ?
      `,
      [fullContent, status, scheduledDate, postId, userId],
    );

    // 3. Get existing media
    const [existingMediaRows] = await pool.query(
      `
      SELECT *
      FROM media
      WHERE post_id = ?
      `,
      [postId],
    );

    // 4. Find removed media (to delete)
    const removedMedia = existingMediaRows.filter(
      (row) => !images.some((img) => img.url === row.url),
    );

    const removedPublicIds = removedMedia
      .map((row) => row.public_id)
      .filter(Boolean);

    console.log("Removing media:", removedPublicIds);

    // 5. Delete from DB
    if (removedMedia.length > 0) {
      const ids = removedMedia.map((m) => m.id);

      await pool.query(
        `
        DELETE FROM media
        WHERE post_id = ?
        AND id IN (?)
        `,
        [postId, ids],
      );
    }

    // 6. Delete from Cloudinary
    if (removedPublicIds.length > 0) {
      await deleteFiles(removedPublicIds);
    }

    // 7. Find new images (avoid duplicates)
    const existingUrls = new Set(existingMediaRows.map((m) => m.url));

    const newImages = images.filter((img) => !existingUrls.has(img.url));

    // 8. Insert new media
    if (newImages.length > 0) {
      const mediaValues = newImages.map((img) => [
        userId,
        postId,
        "image",
        img.url,
        "uploaded",
        img.public_id || null,
      ]);
      //
      const [mediaResult] = await pool.query(
        `
        INSERT INTO media (user_id, post_id, type, url, upload_status, public_id)
        VALUES ?
        ON DUPLICATE KEY UPDATE
        url = VALUES(url)
        `,
        [mediaValues],
      );

      if (mediaResult.affectedRows === 0) {
        return res.status(500).json({
          success: false,
          message: "Failed to save media",
        });
      }
    }

    // 9. Handle draft/scheduled
    if (status === "scheduled" || status === "draft") {
      return res.status(200).json({
        message: "Post saved successfully",
        success: true,
      });
    }

    // 10. Publish to Facebook
    if (status === "publishable") {
      if (images.length === 0) {
        await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/feed`,
          {
            message: fullContent,
            access_token: pageAccessToken,
          },
        );
      } else if (images.length === 1) {
        await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/photos`,
          {
            caption: fullContent,
            url: images[0].url,
            access_token: pageAccessToken,
          },
        );
      } else {
        const mediaIds = [];

        for (const image of images) {
          const mediaRes = await axios.post(
            `https://graph.facebook.com/v25.0/${pageAssetId}/photos`,
            {
              url: image.url,
              published: false,
              access_token: pageAccessToken,
            },
          );
          mediaIds.push(mediaRes.data.id);
        }

        await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/feed`,
          {
            message: fullContent,
            attached_media: mediaIds.map((id) => ({
              media_fbid: id,
            })),
            access_token: pageAccessToken,
          },
        );
      }

      // 11. Mark published
      await pool.query(
        `
        UPDATE posts
        SET status = 'published', published_at = NOW()
        WHERE id = ?
        `,
        [postId],
      );

      return res.status(200).json({
        message: "Post updated and published successfully",
        success: true,
      });
    }
  } catch (error) {
    console.error(error.response?.data || error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};
function extractReplies(comment) {
  const replies = comment.comments?.data || comment.replies || [];

  return replies.map((reply) => ({
    id: reply.id,
    message: reply.message,
    created_time: reply.created_time,
    comment_by: reply.from,

    // 🔥 recursion happens here
    replies: extractReplies(reply),
  }));
}
function formatComments(comments = []) {
  return comments.map((comment) => ({
    id: comment.id,
    message: comment.message,
    created_time: comment.created_time,
    comment_by: comment.from,
    replies: extractReplies(comment),
  }));
}

function formatMySQLDate(dateStr) {
  const date = new Date(dateStr);
  return date.toISOString().slice(0, 19).replace("T", " ");
}
//analytics for facebook post
export const getPostAnalytics = async (req, res) => {
  try {
    const { postId, pageId } = req.params;
    const { force_regenerate = false } = req.query;
    const userId = req.user.id;

    //check if the post exists in database
    const [postRows] = await pool.query(
      `SELECT id FROM post_analytics WHERE  platform_post_id= ? and user_id = ?`,
      [postId, userId],
    );
    // if exist then delete the old analytics to insert the new one
    if (postRows.length > 0) {
      const analyticsId = postRows[0].id;
      if (force_regenerate === "false") {
        return res.status(200).json({
          success: true,
          message: "Analytics already exists for this post",
          data: {
            analytics_id: analyticsId,
            is_updated: false,
          },
        });
      }

      await pool.query(
        `DELETE FROM post_analytics WHERE platform_post_id = ?`,
        [postId],
      );
    }

    const [rows] = await pool.query(
      `
      SELECT name, access_token, asset_id
      FROM user_platform_assets WHERE id = ?
      `,
      [pageId],
    );
    if (rows.length === 0) {
      return res.status(404).json({
        message: "Page not found",
      });
    }
    console.log("Retrieved page access token:", rows[0].access_token);

    const pageAccessToken = rows[0]?.access_token;
    const pageAssetId = rows[0]?.asset_id;
    const pageName = rows[0]?.name || "Unknown Page";

    //retrive facebook post insights
    const post = await axios.get(`https://graph.facebook.com/v25.0/${postId}`, {
      params: {
        access_token: pageAccessToken,
        fields: "reactions.summary(true),comments.summary(true),shares",
      },
    });

    const result = {
      postId: post.data.id || null,
      total_reactions: post.data.reactions?.summary?.total_count ?? 0,
      total_comments: post.data.comments?.summary?.total_count ?? 0,
      total_shares: post.data.shares?.count ?? 0,
    };

    const CommentResponse = await axios.get(
      `https://graph.facebook.com/v25.0/${postId}/comments`,
      {
        params: {
          access_token: pageAccessToken,
          fields:
            "id,message,created_time,from.fields(id,name),comments.limit(50){id,message,created_time,from.fields(id,name)}",
          limit: 100,
        },
      },
    );

    result.comments = formatComments(CommentResponse.data.data) || [];
    //get post details
    const postDetails = await axios.get(
      `https://graph.facebook.com/v25.0/${postId}`,
      {
        params: {
          access_token: pageAccessToken,
          fields: "message,created_time,permalink_url",
        },
      },
    );
    console.log("postDetails.data", postDetails.data);

    console.log("Post analytics result:", {
      comments: result.comments,
      reaction_count: result.total_reactions,
      share_count: result.total_shares,
      comment_count: result.total_comments,
      description: postDetails.data || "No description available",
      platform: "facebook",
      page_name: pageName,
    });
    const aiResponse = await axios.post(
      `http://127.0.0.1:8000/api/v1/generate/analytics`,
      {
        comments: result.comments,
        reaction_count: result.total_reactions,
        share_count: result.total_shares,
        comment_count: result.total_comments,
        description: postDetails.data.message || "No description available",
        platform: "facebook",
        page_name: pageName,
      },
    );
    console.log("AI Response:", aiResponse.data);

    if (!aiResponse.data.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to generate analytics",
      });
    }
    const analyticsData = aiResponse.data.data.analytics;

    const [analyticsRows] = await pool.query(
      `
      INSERT INTO post_analytics (user_id,platform_post_id, platform_name,total_reactions,total_comments,total_shares,description,response_summary,comment_insights,marketing_suggestions,sentiment_summary,content_recommendations,performance_label)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      on duplicate key update
      platform_post_id = VALUES(platform_post_id)
      `,
      [
        userId,
        postId,
        pageName,
        result.total_reactions,
        result.total_comments,
        result.total_shares,
        postDetails.data.message || "No description available",
        analyticsData.response_summary,
        analyticsData.comments_summary,
        analyticsData.marketing_recommendations,
        analyticsData.sentiment_summary,
        analyticsData.content_recommendations,
        analyticsData.performance_label,
      ],
    );
    const analyticsId = analyticsRows.insertId;

    // Return analytics result
    if (
      aiResponse.data.data.comment_insights &&
      aiResponse.data.data.comment_insights.comments.length > 0
    ) {
      //insert all the comments analytics into database with post id and comment id
      const commentInsights =
        aiResponse.data.data.comment_insights.comments || [];
      for (const insight of commentInsights) {
        await pool.query(
          `INSERT INTO comments (
      platform_comment_id,
      analytics_id,
      user_name,
      message,
      message_summary,
      sentiment,
      priority,
      created_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            insight.comment_id,
            analyticsId,
            insight.user_name,
            insight.message,
            insight.message_summary,
            insight.sentiment,
            insight.priority,
            formatMySQLDate(insight.created_time),
          ],
        );
      }
    }

    try {
      activityAnalytics("facebook_analytics_generated",
        `Analytics for post generated`,
        `${userId} has generated analytics for post ${postId} on facebook`, userId)
    } catch (error) {
      console.error("Error saving activity analytics:", error);
    }

    return res.status(200).json({
      success: true,
      data: {
        analytics_id: analyticsId,
        is_updated:true,
      },
      message: "Post analytics retrieved successfully",
    });
  } catch (error) {
    console.error(error.response?.data || error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

//get single report by analytics id
export const getPostAnalyticsById = async (req, res) => {
  const  userId= req.user.id;
  try {
    const { analyticsId } = req.params;
    const [rows] = await pool.query(
      `select id,post_id,platform_post_id,platform_name,total_reactions,content_recommendations,total_shares,total_comments,comment_insights,response_summary,marketing_suggestions,sentiment_summary,performance_label,description from post_analytics  where id =  ? and user_id = ?`,
      [analyticsId, userId],
    );
    console.log("Single analytics retrieved from database:", rows);
    console.log("Analytics ID from request params:", analyticsId);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found",
      });
    }
    const analytics = rows[0];
    const [commentRows] = await pool.query(
      `select * from comments where analytics_id = ?`,
      [analytics.id],
    );
    analytics.comment_insights = commentRows;
    return res.status(200).json({
      success: true,
      data: analytics,
      message: "Analytics retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getListOfPostAnalytics = async (req, res) => {
  const userId = req.user.id;
  try {
    console.log("Retrieving list of analytics for user ID:", userId);
    const [rows] = await pool.query(
      `select id,post_id,platform_post_id,platform_name,total_reactions,last_updated,total_shares,total_comments,performance_label,description from post_analytics  where user_id = ?`,
      [userId]
    );
    console.log("List of analytics retrieved from database:", rows);
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Analytics not found",
      });
    }
  
    console.log("Single analytics retrieved from database:", rows);

    return res.status(200).json({
      success: true,
      data: rows,
      message: "Analytics retrieved successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

