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
      INSERT INTO posts (user_id, content_type, content, status, scheduled_at)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        userId,
        "post",
        message + " " + tags.map((tag) => `${tag}`).join(" "),
        status,
        scheduled_at,
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
