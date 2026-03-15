// import 'dotenv/config'
import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { sendEmail } from "../services/mail.service.js";

export const register = async (req, res) => {
    const { email, username, password } = req.body;

    const isAlreadyUserExists = await userModel.findOne({
        $or: [{ email }, { username }]
    });

    if (isAlreadyUserExists) {
        return res.status(401).json({
            message: "User with this email or username already exists",
            success: false,
            err: "user already exists"
        });
    }

    const user = await userModel.create({ email, username, password });

    const emailVerificationToken = jwt.sign({
        email: user.email,
    }, process.env.JWT_TOKEN);

    // FIX: Pass arguments individually, not as an object
    await sendEmail(
        email, 
        "Welcome to Perplexity!", 
        `
            <p>Hi ${username},</p>
            <p>Thank you for registering. Please verify your email by clicking below:</p>
            <a href="http://localhost:3000/api/auth/verify?token=${emailVerificationToken}">Verify Email</a>
        `,
        "Welcome to Perplexity! Please verify your email."
    );

    res.status(201).json({
        message: "User registered successfully",
        success: false,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
};

export async function login(req, res) {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })
    if (!user) {
        return res.status(401).json({
            message: 'Invaild email or Password',
            success: false,
            err: "user not found"
        })
    }

    const isPassword = await user.comparePassword(password);
    if (!isPassword) {
        return res.status(400).json({
            message: "Invaild email or password",
            success: false,
            err: "Incorrect password"
        })
    }
    if (!user.verified) {
        return res.status(400).json({
            message: "Please verify your email before logging in",
            success: false,
            err: "email not verified"
        })
    }
    const token = jwt.sign({
        id: user._id,
        username: user.username,

    }, process.env.JWT_TOKEN, { expiresIn: "7d" })

   res.cookie("token", token, {
    httpOnly: true, // Security ke liye zaroori hai
    secure: process.env.NODE_ENV === "production", // Sirf HTTPS pe chalega production mein
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 din
});
    res.status(200).json({
        message: "Login successful",
        success: true,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    })
}

export async function getMe(req, res) {
    const userId = req.user.id;

    const user = await userModel.findById(userId).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found",
            success: false,
            err: "User not found"
        })
    }

    res.status(200).json({
        message: "User details fetched successfully",
        success: true,
        user
    })
}


export async function verifyEmail(req, res) {
    const { token } = req.query;
    try {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN)
        const user = await userModel.findOne({ email: decoded.email })

        if (!user) {
            return res.status(401).json({
                message: "Invaild token",
                success: false,
                err: "user not found"
            })
        }
        user.verified = true;

        await user.save();
        const html =
            `
        <h1>Email Verified Successfully!</h1>
        <p>Your email has been verified. You can now log in to your account.</p>
        <a href="http://localhost:3000/login">Go to Login</a>
    `

        return res.send(html);
    } catch (err) {
        return res.status(400).json({
            message: "Invalid or expired token",
            success: false,
            err: err.message
        })
    }

}