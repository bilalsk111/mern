import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../services/mail.service.js";
import { redisClient } from "../config/redis.js";
import { v4 as uuidv4 } from "uuid";

export async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        const existingUser = await userModel.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).json({ success: false, message: "This email is already registered." });
            }
            if (existingUser.username === username) {
                return res.status(400).json({ success: false, message: "This username is already taken." });
            }
        }

        const user = await userModel.create({ username, email, password });

        const emailVerificationToken = jwt.sign({
            email: user.email,
        }, process.env.JWT_TOKEN, { expiresIn: '1d' });

        await sendEmail({
            to: email,
            subject: "Welcome to Perplexity!",
            html: `
                <p>Hi ${username},</p>
                <p>Thank you for registering at <strong>Perplexity</strong>. We're excited to have you on board!</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="http://localhost:3000/api/auth/verify?token=${emailVerificationToken}">Verify Email</a>
                <p>If you did not create an account, please ignore this email.</p>
                <p>Best regards,<br>The Perplexity Team</p>
            `
        });

        res.status(201).json({
            message: "User registered successfully.",
            success: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error during registration." });
    }
}

export async function login(req, res) {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({ message: "Invalid email or password", success: false });
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
        return res.status(400).json({ message: "Invalid email or password", success: false });
    }

    if (!user.verified) {
        return res.status(400).json({ message: "Please verify your email before logging in", success: false });
    }
    const jti = uuidv4()
    const token = jwt.sign({
        id: user._id,
        jti,
        username: user.username,
    }, process.env.JWT_TOKEN, { expiresIn: "7d" });
    res.cookie("token", token);

    res.status(200).json({
        message: "Login successful",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

export async function getMe(req, res) {
    const userId = req.user.id;
    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
    }

    res.status(200).json({ message: "User details fetched successfully", success: true, user });
}

export async function verifyEmail(req, res) {
    const { token } = req.query;

    try {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN);
        const user = await userModel.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({ message: "Invalid token", success: false });
        }

        user.verified = true;
        await user.save();

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verified | Cognivex</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                    body { 
                        background-color: #000000; 
                        color: #ffffff; 
                        font-family: 'Inter', system-ui, sans-serif; 
                        margin: 0; 
                        overflow: hidden; 
                    }
                    .fade-in-up { 
                        animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
                    }
                    @keyframes fadeInUp { 
                        from { opacity: 0; transform: translateY(20px); } 
                        to { opacity: 1; transform: translateY(0); } 
                    }
                </style>
            </head>
            <body class="min-h-screen flex items-center justify-center p-4 sm:p-6 relative selection:bg-white/20">
                <div class="absolute top-0 inset-x-0 h-[500px] pointer-events-none" style="background: radial-gradient(ellipse at top center, rgba(255,255,255,0.06) 0%, transparent 70%);"></div>

                <div class="max-w-[400px] w-full z-10 fade-in-up text-center">
                    
                    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 mb-6 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    
                    <h1 class="text-[28px] font-semibold tracking-tight text-white mb-3">Email verified</h1>
                    <p class="text-[#a1a1aa] text-[15px] mb-8 leading-relaxed">
                        Your email address has been successfully verified. You can now access your Cognivex account.
                    </p>
                    
                    <a href="http://localhost:5173/login" 
                       class="inline-flex w-full items-center justify-center rounded-xl bg-white px-4 py-3.5 text-[15px] font-semibold text-black transition-all hover:bg-zinc-200 active:scale-[0.98] shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                        Continue to login
                    </a>
                </div>
            </body>
            </html>
        `;

        return res.send(html);
    } catch (err) {
        const errorHtml = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verification Failed | Cognivex</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                    body { 
                        background-color: #000000; 
                        color: #ffffff; 
                        font-family: 'Inter', system-ui, sans-serif; 
                        margin: 0; 
                        overflow: hidden; 
                    }
                    .fade-in-up { 
                        animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
                    }
                    @keyframes fadeInUp { 
                        from { opacity: 0; transform: translateY(20px); } 
                        to { opacity: 1; transform: translateY(0); } 
                    }
                </style>
            </head>
            <body class="min-h-screen flex items-center justify-center p-4 sm:p-6 relative selection:bg-white/20">
                <div class="absolute top-0 inset-x-0 h-[500px] pointer-events-none" style="background: radial-gradient(ellipse at top center, rgba(239,68,68,0.08) 0%, transparent 70%);"></div>
                
                <div class="max-w-[400px] w-full z-10 fade-in-up text-center">
                    
                    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 mb-6 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                        <svg class="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </div>
                    
                    <h1 class="text-[28px] font-semibold tracking-tight text-white mb-3">Verification failed</h1>
                    <p class="text-[#a1a1aa] text-[15px] mb-8 leading-relaxed">
                        Your verification link is invalid or has expired. Please try registering again to get a new link.
                    </p>
                    
                    <a href="http://localhost:5173/register" 
                       class="inline-flex w-full items-center justify-center rounded-xl bg-white/5 border border-white/10 px-4 py-3.5 text-[15px] font-medium text-white transition-all hover:bg-white/10 active:scale-[0.98]">
                        Back to register
                    </a>
                </div>
            </body>
            </html>
        `;
        return res.status(400).send(errorHtml);
    }
}



// export async function resendVerificationEmail(req, res) {
//     try {
//         const { email } = req.body;

//         const user = await userModel.findOne({ email });

//         if (!user) {
//             return res.status(404).json({
//                 message: "User not found",
//             });
//         }

//         if (user.verified) {
//             return res.status(400).json({
//                 message: "User already verified",
//             });
//         }

//         // ✅ RATE LIMIT (60s)
//         if (user.lastEmailSent && Date.now() - user.lastEmailSent < 60000) {
//             return res.status(429).json({
//                 message: "Wait before requesting again",
//             });
//         }

//         // ✅ TOKEN (USE SAME SECRET + ID)
//         const token = jwt.sign(
//             { id: user._id },
//             process.env.JWT_TOKEN,
//             { expiresIn: "15m" }
//         );

//        const verifyLink = `http://localhost:3000/api/auth/verify?token=${token}`;

//         // ✅ UPDATE TIME
//         user.lastEmailSent = Date.now();
//         await user.save();

//         // ✅ SEND EMAIL
//         await sendEmail({
//             to: user.email,
//             subject: "Verify your email",
//             html: `
//         <h3>Email Verification</h3>
//         <p>Click below to verify your account:</p>
//         <a href="${verifyLink}">Verify Email</a>
//       `,
//         });

//         res.json({
//             success: true,
//             message: "Verification email resent successfully",
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({
//             message: "Something went wrong",
//         });
//     }
// }
export async function logout(req, res) {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(400).json({ message: "No token provided" });
        }

        const decoded = jwt.decode(token);

        if (!decoded?.jti) {
            return res.status(400).json({ message: "Invalid token" });
        }

        const expiry = decoded.exp - Math.floor(Date.now() / 1000);

        await redisClient.set(decoded.jti, "revoked", { EX: expiry });

        res.clearCookie("token");

        res.status(200).json({ message: "Logged out successfully" });

    } catch (err) {
        res.status(500).json({ message: "Logout failed" });
    }
}