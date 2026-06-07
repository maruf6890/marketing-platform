import { sendOtpMail } from "../emailVerify/sendOtpMail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../database/db.js";
import axios from "axios";

export const registerUser = async (req, res) => {
  try {
    console.log(req.body);
    const { user_name, email, password } = req.body;
    if (!user_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [user_name, email, hashedPassword],
    );

    const token = jwt.sign(
      { id: result.insertId, email: email },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    return res.status(201).json({
      token: token,
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: result.insertId,
          name: result.name,
          email: result.email,
          role: result.role,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// export const verification = async (req, res) => {
//     try {
//         const authHeader = req.headers.authorization;
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Authorization token is missing or invalid"
//             })
//         }

//         const token = authHeader.split(" ")[1]

//         let decoded;
//         try {
//             decoded = jwt.verify(token, process.env.SECRET_KEY)
//         } catch (err) {
//             if (err.name === "TokenExpiredError") {
//                 return res.status(400).json({
//                     success: false,
//                     message: "The registration token has expired"
//                 })
//             }
//             return res.status(400).json({
//                 success: false,
//                 message: "Token verification failed"
//             })
//         }
//         const user = await User.findById(decoded.id)
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 message: "User not found"
//             })
//         }

//         user.token = null
//         user.isVerified = true
//         await user.save()

//         return res.status(200).json({
//             success: true,
//             message: "Email verified successfully"
//         })
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User not found, please register first",
      });
    }
    const passwordCheck = await bcrypt.compare(password, rows[0].password);
    if (!passwordCheck) {
      return res.status(402).json({
        success: false,
        message: "Incorrect Password",
      });
    }
    const accessToken = jwt.sign(
      { id: rows[0].id, email: rows[0].email, role: rows[0].role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back ${rows[0].name}`,
      data: {
        accessToken,
        user: {
          id: rows[0].id,
          name: rows[0].name,
          email: rows[0].email,
          role: rows[0].role,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Clear auth-related cookies set by the frontend/server
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    res.clearCookie("token", cookieOptions);
    res.clearCookie("user_name", cookieOptions);
    res.clearCookie("email", cookieOptions);
    res.clearCookie("user_id", cookieOptions);
    res.clearCookie("role", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    rows[0].otp = otp;
    rows[0].otpExpiry = expiry;
    await pool.query(
      "UPDATE users SET otp = ?, otp_expire = ? WHERE email = ?",
      [otp, expiry, email],
    );
    await sendOtpMail(email, otp);
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyOTP = async (req, res) => {
  const { otp } = req.body;
  const email = req.params.email;

  if (!otp) {
    return res.status(400).json({
      success: false,
      message: "OTP is required",
    });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!rows[0].otp || !rows[0].otp_expire) {
      return res.status(407).json({
        success: false,
        message:
          "There is no OTP request for this email. Please request for OTP",
      });
    }
    if (rows[0].otp_expire < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one",
      });
    }
    if (otp !== rows[0].otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await pool.query(
      "UPDATE users SET otp = null, otp_expire = null WHERE email = ?",
      [email],
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const changePassword = async (req, res) => {
  const { new_password, confirm_password } = req.body;
  const email = req.params.email;

  if (!new_password || !confirm_password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({
      success: false,
      message: "Password do not match",
    });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const user = rows[0];

    const hashedPassword = await bcrypt.hash(new_password, 10);
    user.password = hashedPassword;
    await pool.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedPassword,
      email,
    ]);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const getUsersList = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, user_name, email, role FROM users",
    );
    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const [rows] = await pool.query("SELECT id, name,email,avatar_url FROM users WHERE id = ?", [
      userId,
    ]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = { ...rows[0] };

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const redirectFacebookLogin = (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  // secure id with jwt and send as state parameter
  const state = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

  const url = new URL("https://www.facebook.com/v25.0/dialog/oauth");
  url.searchParams.set("client_id", process.env.FB_APP_ID);
  url.searchParams.set("redirect_uri", process.env.REDIRECT_URI);
  url.searchParams.set("response_type", "code");
 url.searchParams.set(
   "scope",
   "public_profile,pages_show_list,pages_read_engagement,pages_read_user_content,pages_manage_posts",
 );

 url.searchParams.set("state", state);
  url.searchParams.set("state", state);
  res.status(200).json({
    success: true,
    data: {
      url: url.toString(),
    },
  });
};
export const handleFacebookCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    // -------------------------
    // 1. Validate state
    // -------------------------
    if (!state) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/admin/integrations?facebook=error&reason=missing_state`,
      );
    }

    let decodedState;
    try {
      decodedState = jwt.verify(state, process.env.JWT_SECRET);
    } catch (err) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/admin/integrations?facebook=error&reason=invalid_state`,
      );
    }

    if (!decodedState?.id) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/admin/integrations?facebook=error&reason=invalid_user`,
      );
    }

    // -------------------------
    // 2. Validate code
    // -------------------------
    if (!code) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/admin/integrations?facebook=error&reason=missing_code`,
      );
    }

    // -------------------------
    // 3. Check user exists
    // -------------------------
    const [rows] = await pool.query("SELECT id FROM users WHERE id = ?", [
      decodedState.id,
    ]);

    if (!rows.length) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/admin/integrations?facebook=error&reason=user_not_found`,
      );
    }

    // -------------------------
    // 4. Exchange code for access token
    // -------------------------
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v25.0/oauth/access_token?client_id=${process.env.FB_APP_ID}&redirect_uri=${encodeURIComponent(
        process.env.REDIRECT_URI,
      )}&client_secret=${process.env.FB_APP_SECRET}&code=${code}`,
    );

    const tokenData = await tokenResponse.json();

    // ❌ Facebook error handling
    if (tokenData.error) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/admin/integrations?facebook=error&reason=token_failed`,
      );
    }

    // -------------------------
    // 5. Get platform id
    // -------------------------
    const [platformRows] = await pool.query(
      "SELECT id FROM platforms WHERE name = ?",
      ["facebook"],
    );

    if (!platformRows.length) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/admin/integrations?facebook=error&reason=platform_missing`,
      );
    }

    // -------------------------
    // 6. Save token in DB
    // -------------------------
    await pool.query(
      `INSERT INTO user_platform_accounts 
       (user_id, platform_id, access_token, token_expires_at) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       access_token = VALUES(access_token),
       token_expires_at = VALUES(token_expires_at)`,
      [
        decodedState.id,
        platformRows[0].id,
        tokenData.access_token,
        tokenData.expires_in
          ? new Date(Date.now() + tokenData.expires_in * 1000)
          : null,
      ],
    );

    // -------------------------
    // 7. SUCCESS REDIRECT
    // -------------------------
    return res.redirect(
      `${process.env.FRONTEND_URL}/admin/integrations?facebook=success`,
    );
  } catch (err) {
    console.error(err);

    return res.redirect(
      `${process.env.FRONTEND_URL}/admin/integrations?facebook=error&reason=server_error`,
    );
  }
};

//get users connected platforms list

export const getUserPlatforms = async (req, res) => {
  const userId = req.userId;
  if (!userId) {
     return res.status(401).json({
       success: false,
       message: "Unauthorized User",
     });
  }

  const [platforms] = await pool.query(
    `SELECT p.name, ac.connected_at, ac.last_synced_at, ac.is_active 
     FROM platforms p 
     LEFT JOIN user_platform_accounts ac ON ac.platform_id = p.id AND ac.user_id = ?`,
    [userId],
  );
  return res.json({
    message: "User platforms fetched successfully",
    success: true,
    data: platforms
  });
}