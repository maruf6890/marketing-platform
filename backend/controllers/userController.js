import { sendOtpMail } from "../emailVerify/sendOtpMail.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import {pool} from "../database/db.js"

export const registerUser = async (req, res) => {
    try {
        console.log(req.body)
        const { user_name, email, password,role= "user" } = req.body;
        if (!user_name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10)
        const [result] = await pool.query("INSERT INTO users (user_name, email, password,role) VALUES (?, ?, ?, ?)", [user_name, email, hashedPassword, role]);
   
        const token = jwt.sign({ id: result.insertId ,email: email,role:role}, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });
       
        return res.status(201).json({
            token: token,   
            success: true,
            message: "User registered successfully",
            data: {
                token,
                user: { id: result.insertId, user_name, email, role }  
            }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })

    }
}

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
                message: 'All fields are required'
            })
        }
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (!rows || rows.length === 0) {
            return res.status(400).json({
                success: false,
                message: "User not found, please register first"
        })
        }
        const passwordCheck = await bcrypt.compare(password, rows[0].password)
        if (!passwordCheck) {
            return res.status(402).json({
                success: false,
                message: "Incorrect Password"
            })
        }
        const accessToken = jwt.sign({ id: rows[0].id,email: rows[0].email,role: rows[0].role }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });

        return res.status(200).json({
            success: true,
            message: `Welcome back ${rows[0].user_name}`,
            accessToken,
            user: { id: rows[0].id, user_name: rows[0].user_name, email: rows[0].email, role: rows[0].role }
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const logoutUser = async (req, res) => {
    try {
        const userId = req.userId;
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email)
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if (!rows || rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiry = new Date(Date.now() + 10 * 60 * 1000)

        rows[0].otp = otp;
        rows[0].otpExpiry = expiry;
        await pool.query(
          "UPDATE users SET otp = ?, otp_expire = ? WHERE email = ?",
          [otp, expiry, email],
        );
        await sendOtpMail(email, otp);
        return res.status(200).json({
            success:true,
            message:"OTP sent successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const verifyOTP = async (req, res)=>{
    const {otp} = req.body
    const email = req.params.email

    if(!otp){
        return res.status(400).json({
            success:false,
            message:"OTP is required"
        })
    }

    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if(!rows || rows.length === 0){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        if(!rows[0].otp || !rows[0].otp_expire){
            return res.status(407).json({
                success:false,
                message:"There is no OTP request for this email. Please request for OTP"
            })
        }
        if (rows[0].otp_expire < new Date()){
            return res.status(400).json({
                success:false,
                message:"OTP has expired. Please request a new one"
            })
        }
        if(otp !== rows[0].otp){
            return res.status(400).json({
                success:false,
                message:"Invalid OTP"
            })
        }

       await pool.query("UPDATE users SET otp = null, otp_expire = null WHERE email = ?", [email]);

        return res.status(200).json({
            success:true,
            message:"OTP verified successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}

export const changePassword = async (req, res)=>{
    const {new_password, confirm_password} = req.body
    const email = req.params.email
    
    if(!new_password || !confirm_password){
        return res.status(400).json({
            success:false,
            message:"All fields are required"
        })
    }

    if(new_password !== confirm_password) {
        return res.status(400).json({
            success:false,
            message:"Password do not match"
        })
    }

    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
        if(!rows || rows.length === 0){
            return res.status(404).json({
                success:false,
                message:"User not found"
            })
        }
        const user = rows[0];

        const hashedPassword = await bcrypt.hash(new_password, 10)
        user.password = hashedPassword
        await pool.query("UPDATE users SET password = ? WHERE email = ?", [hashedPassword, email]);

        return res.status(200).json({
            success:true,
            message:"Password changed successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}
export const getUsersList = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT id, user_name, email, role FROM users");
        return res.status(200).json({
            success: true,
            data: rows
        })  
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}
 
export const  getCurrentUser = async (req, res) => {
    userId= req.userId
}
