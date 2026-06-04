import axios from "axios";
import { pool } from "../database/db.js";
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
    [accountId, page.id, page.name, "facebook_page", page.access_token]
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
  if(status==="scheduled" || status === "draft"){
    return res.status(200).json({
      message: "Post saved successfully",
      success: true,
    });
  }
    if (status === "publishable") { 
   
    if (images.length == 0) {
      //send post request to facebook with text only
      const postRes = await axios.post(
        `https://graph.facebook.com/v25.0/${pageId}/feed`,
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
        
        console.log("Facebook API response for single image post:", singleImageRes.data);
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
       
        console.log("Facebook API response for multiple image post:", multipleImageRes.data);
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

export const getDraftsPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `
      SELECT p.id, p.content, p.scheduled_at, GROUP_CONCAT(m.url) AS media_urls
      FROM posts p
      LEFT JOIN media m ON p.id = m.post_id
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
}

export const getScheduledPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      `
      SELECT p.id, p.content, p.scheduled_at, GROUP_CONCAT(m.url) AS media_urls
      FROM posts p
      LEFT JOIN media m ON p.id = m.post_id
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
}
