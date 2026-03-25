import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";




export async function authUser(req, res, next) {

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized",
            success: false,
            err: "No token provided"
        })
    }
    try {

       const decoded = jwt.verify(token, process.env.JWT_TOKEN);
       const isBlacklisted = await redisClient.get(decoded.jti);
       if(isBlacklisted){
        return res.status(401).json({
            message:"Token expired (logged out)"
        })
       }

        req.user = decoded;

        next();

    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized",
            success: false,
            err: "Invalid token"
        })
    }

}
