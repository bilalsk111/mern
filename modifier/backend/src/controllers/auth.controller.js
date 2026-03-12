const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const generateToken = require("../utils/token");
const { redisClient } = require("../config/redis");


// 🍀 Register
async function register(req, res) {
  try {
    const { email, username, password } = req.body;

    // Validate input
    if (!email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check existing user
    const existingUser = await userModel.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await userModel.create({
      email,
      username,
      password: hashedPassword,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateToken(user);

    // Set cookies (secure)
    res.cookie("token", accessToken, { httpOnly: true, secure: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

    return res.status(201).json({
      message: "User registered",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });

  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}


// 🔐 Login
async function login(req, res) {
  try {
    const { email, username, password } = req.body;

    const user = await userModel
      .findOne({ $or: [{ email }, { username }] })
      .select("+password");

    // Validate user + password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateToken(user);

    res.cookie("token", accessToken, { httpOnly: true, secure: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });

    return res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
}


// 🚪 Logout + Redis Blacklist
async function logout(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "No token" });

    const decoded = req.user;

    // Remaining expiry time
    const expiry = decoded.exp - Math.floor(Date.now() / 1000);

    // Store in Redis blacklist
    if (expiry > 0) {
      await redisClient.set(decoded.jti, "blacklisted", { EX: expiry });
    }

    res.clearCookie("token", { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    return res.json({ message: "Logged out" });

  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
}


// 👤 Get Current User
async function getMe(req, res) {
  try {
    const user = await userModel
      .findById(req.user.id)
      .select("-password");

    return res.status(200).json({
      message: "User fetched",
      user,
    });

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { register, login, logout, getMe };