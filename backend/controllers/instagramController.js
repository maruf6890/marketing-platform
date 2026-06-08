import axios from "axios";
import { pool } from "../database/db.js";

export const reqUsersAccountList = async (req, res) => {
  try {
    const userId = req.user.id;

    const [accounts] = await pool.query(
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
      [userId]
    );

    const accessToken = accounts[0]?.access_token;
    const accountId = accounts[0]?.id;

    if (!accessToken) {
      return res.status(404).json({
        message: "Facebook access token not found",
        success: false,
      });
    }

    // Get Facebook pages
    const { data: pagesResponse } = await axios.get(
      "https://graph.facebook.com/v25.0/me/accounts",
      {
        params: {
          access_token: accessToken,
          fields: "id,name",
        },
      }
    );

    const instagramAccounts = [];

    for (const page of pagesResponse.data) {
      try {
        // Get Instagram Business Account linked to page
        const { data: pageInfo } = await axios.get(
          `https://graph.facebook.com/v25.0/${page.id}`,
          {
            params: {
              access_token: accessToken,
              fields: "instagram_business_account",
            },
          }
        );

        const igId = pageInfo.instagram_business_account?.id;

        if (!igId) {
          continue;
        } else {
          console.log("No Instagram account linked to page:", page.name);
        }

        // Get Instagram account details
        const { data: igAccount } = await axios.get(
          `https://graph.facebook.com/v25.0/${igId}`,
          {
            params: {
              access_token: accessToken,
              fields: "id,name,username,profile_picture_url",
            },
          }
        );

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
            access_token = VALUES(access_token)
          `,
          [
            accountId,
            igAccount.id,
            igAccount.name,
            "instagram_account",
            accessToken,
          ]
        );

        console.log("Instagram account saved to database");

        // Return instagram accounts list  select id, asset_id, name, type from user_platform_assets;
        const [rows] = await pool.query(
          `
          SELECT id, asset_id, name, type
            FROM user_platform_assets
            WHERE account_id = ?
            AND type = 'instagram_account'
          `,
          [accountId],
        );

        return res.status(200).json({
          data: rows,
          message: "Instagram accounts retrieved successfully",
          success: true,
        });

      } catch (err) {
        console.error(
          `Failed to fetch Instagram account for page ${page.id}`,
          err.response?.data || err.message
        );
      }
    }

    return res.status(200).json({
      data: instagramAccounts,
      success: true,
      message: "Instagram accounts retrieved successfully",
    });
  } catch (error) {
    console.error(error.response?.data || error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// get users accounts list from database
export const getUsersAccountList = async (req, res) => {
  console.log("Getting user's Instagram accounts from database...");
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `
        SELECT a.id, a.asset_id, a.name, a.type
        FROM user_platform_assets a
        JOIN user_platform_accounts ac ON a.account_id = ac.id
        WHERE ac.user_id = ?
        AND a.type = 'instagram_account'
        `,
      [userId],
    );
    console.log("Instagram accounts retrieved from database:", rows);
    return res.status(200).json({
      data: rows,
      message: "Instagram accounts retrieved successfully",
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
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const userId = req.user.id;
    const {
      pageId,
      message,
      images,
      tags,
      status,
      scheduled_at = null,
    } = req.body;

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

    //save posts
    //insert into posts (user_id,content_type,content,status,scheduled_at) value
    const [result] = await connection.query(
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
      ]);

      const [mediaResult] = await connection.query(
        `
        INSERT INTO media (user_id, post_id, type, url, upload_status)
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
      return res.status(200).json({
        message: "Post saved successfully",
        success: true,
      });
    }
    if (status === "publishable") {

      const caption = `${message} ${tags.join(" ")}`.trim();

      if (images.length === 0) {
        throw new Error(
          "Instagram feed posts require at least one image or video."
        );
      }

      let publishedPostId = null;

      if (images.length === 1) {
        // Create media container
        const { data: container } = await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/media`,
          null,
          {
            params: {
              image_url: images[0].url,
              caption,
              access_token: pageAccessToken,
            },
          }
        );

        // Publish media
        const { data: publish } = await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/media_publish`,
          null,
          {
            params: {
              creation_id: container.id,
              access_token: pageAccessToken,
            },
          }
        );

        publishedPostId = publish.id;

        console.log("Instagram single image published:", publish);
      } else {
        // Create carousel items
        const childIds = [];

        for (const image of images) {
          const { data: child } = await axios.post(
            `https://graph.facebook.com/v25.0/${pageAssetId}/media`,
            null,
            {
              params: {
                image_url: image.url,
                is_carousel_item: true,
                access_token: pageAccessToken,
              },
            }
          );

          childIds.push(child.id);
        }

        // Create carousel container
        const { data: carousel } = await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/media`,
          null,
          {
            params: {
              media_type: "CAROUSEL",
              children: childIds.join(","),
              caption,
              access_token: pageAccessToken,
            },
          }
        );

        // Publish carousel
        const { data: publish } = await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/media_publish`,
          null,
          {
            params: {
              creation_id: carousel.id,
              access_token: pageAccessToken,
            },
          }
        );

        publishedPostId = publish.id;

        console.log("Instagram carousel published:", publish);
      }

      console.log("Instagram Post ID:", publishedPostId);

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
    }
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
}

export const loadInstagramFeed = async (userId) => {
  try {
    const [accounts] = await pool.query(
      `
      SELECT id, asset_id, name, access_token
      FROM user_platform_assets
      WHERE account_id IN (
        SELECT id
        FROM user_platform_accounts
        WHERE user_id = ?
      )
      AND type = 'instagram_account'
      `,
      [userId]
    );

    let allPosts = [];

    for (const account of accounts) {
      try {
        const response = await axios.get(
          `https://graph.facebook.com/v25.0/${account.asset_id}/media`,
          {
            params: {
              access_token: account.access_token,
              fields:
                "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,children{media_type,media_url,thumbnail_url}",
              limit: 50,
            },
          }
        );

        const posts = response.data.data.map((post) => {
          const images = [];

          // Single image
          if (post.media_type === "IMAGE" && post.media_url) {
            images.push(post.media_url);
          }

          // Carousel
          if (
            post.media_type === "CAROUSEL_ALBUM" &&
            post.children?.data
          ) {
            for (const child of post.children.data) {
              if (
                ["IMAGE", "VIDEO"].includes(child.media_type) &&
                child.media_url
              ) {
                images.push(child.media_url);
              }
            }
          }

          // Video cover image
          if (
            post.media_type === "VIDEO" &&
            post.thumbnail_url
          ) {
            images.push(post.thumbnail_url);
          }

          return {
            id: post.id,
            caption: post.caption,
            media_type: post.media_type,
            media_url: post.media_url,
            thumbnail_url: post.thumbnail_url,
            permalink: post.permalink,
            timestamp: post.timestamp,

            page_id: account.id,
            page_name: account.name,
            page_asset_id: account.asset_id,
            access_token: account.access_token,

            images,
          };
        });

        allPosts.push(...posts);
      } catch (error) {
        console.error(
          `Error fetching Instagram posts from ${account.name}:`,
          error.response?.data || error.message
        );
      }
    }

    allPosts.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    return allPosts;
  } catch (error) {
    console.error("Error loading Instagram feed:", error);
    throw error;
  }
};

export const getInstagramFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await loadInstagramFeed(userId);

    return res.status(200).json({
      success: true,
      data: posts,
      message: "Instagram feed loaded successfully",
    });
  } catch (error) {
    console.error('Error getting Instagram feed:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to load Instagram feed",
    });
  }
}

export const getPostComments = async (req, res) => {
  try {
    const { mediaId } = req.params;
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: "Access token is required",
      });
    }

    const response = await axios.get(
      `https://graph.facebook.com/v25.0/${mediaId}/comments`,
      {
        params: {
          access_token: accessToken,
          fields:
            "id,text,timestamp,username,replies{id,text,timestamp,username},like_count,from",
          limit: 100,
        },
      }
    );

    return res.status(200).json({
      success: true,
      data: response.data.data,
      message: "Instagram comments loaded successfully",
    });
  } catch (error) {
    console.error(
      "Error fetching Instagram comments:",
      error.response?.data || error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load Instagram comments",
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

      const caption = `${message} ${tags.join(" ")}`.trim();

      if (images.length === 0) {
        throw new Error(
          "Instagram feed posts require at least one image or video."
        );
      }

      if (images.length === 1) {
        // Create media container
        const { data: container } = await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/media`,
          null,
          {
            params: {
              image_url: images[0].url,
              caption,
              access_token: pageAccessToken,
            },
          }
        );

        // Publish media
        const { data: publish } = await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/media_publish`,
          null,
          {
            params: {
              creation_id: container.id,
              access_token: pageAccessToken,
            },
          }
        );

        publishedPostId = publish.id;

        console.log("Instagram single image published:", publish);
      } else {
        // Create carousel items
        const childIds = [];

        for (const image of images) {
          const { data: child } = await axios.post(
            `https://graph.facebook.com/v25.0/${pageAssetId}/media`,
            null,
            {
              params: {
                image_url: image.url,
                is_carousel_item: true,
                access_token: pageAccessToken,
              },
            }
          );

          childIds.push(child.id);
        }

        // Create carousel container
        const { data: carousel } = await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/media`,
          null,
          {
            params: {
              media_type: "CAROUSEL",
              children: childIds.join(","),
              caption,
              access_token: pageAccessToken,
            },
          }
        );

        // Publish carousel
        const { data: publish } = await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/media_publish`,
          null,
          {
            params: {
              creation_id: carousel.id,
              access_token: pageAccessToken,
            },
          }
        );

        publishedPostId = publish.id;

        console.log("Instagram carousel published:", publish);
      }

      console.log("Instagram Post ID:", publishedPostId);

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
    }
  } catch (error) {
    console.error(error.response?.data || error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
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

    const caption = `${message} ${tags.join(" ")}`.trim();

    if (images.length === 0) {
      throw new Error(
        "Instagram feed posts require at least one image or video."
      );
    }

    let publishedPostId = null;

    if (images.length === 1) {
      // Create media container
      const { data: container } = await axios.post(
        `https://graph.facebook.com/v25.0/${pageAssetId}/media`,
        null,
        {
          params: {
            image_url: images[0].url,
            caption,
            access_token: pageAccessToken,
          },
        }
      );

      // Publish media
      const { data: publish } = await axios.post(
        `https://graph.facebook.com/v25.0/${pageAssetId}/media_publish`,
        null,
        {
          params: {
            creation_id: container.id,
            access_token: pageAccessToken,
          },
        }
      );

      publishedPostId = publish.id;

      console.log("Instagram single image published:", publish);
    } else {
      // Create carousel items
      const childIds = [];

      for (const image of images) {
        const { data: child } = await axios.post(
          `https://graph.facebook.com/v25.0/${pageAssetId}/media`,
          null,
          {
            params: {
              image_url: image.url,
              is_carousel_item: true,
              access_token: pageAccessToken,
            },
          }
        );

        childIds.push(child.id);
      }

      // Create carousel container
      const { data: carousel } = await axios.post(
        `https://graph.facebook.com/v25.0/${pageAssetId}/media`,
        null,
        {
          params: {
            media_type: "CAROUSEL",
            children: childIds.join(","),
            caption,
            access_token: pageAccessToken,
          },
        }
      );

      // Publish carousel
      const { data: publish } = await axios.post(
        `https://graph.facebook.com/v25.0/${pageAssetId}/media_publish`,
        null,
        {
          params: {
            creation_id: carousel.id,
            access_token: pageAccessToken,
          },
        }
      );

      publishedPostId = publish.id;

      console.log("Instagram carousel published:", publish);
    }

    console.log("Instagram Post ID:", publishedPostId);
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