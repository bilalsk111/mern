let express = require('express')
let userRouter = express.Router()
let authMiddleware = require('../middlewares/auth.middleware')

let {
    followUser,
    acceptFollow,
    rejectFollow,
    unfollowUser,
    updateProfile,
    getProfile,
    getFollowers,
    getFollowing,
    checkUsernameAvailability,
    searchUsers
} = require('../controllers/user.controller')

let multer = require('multer');
let storage = multer.memoryStorage();
let upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } })

userRouter.post("/follow/:username", authMiddleware, followUser)
// userRouter.post("/accept/:username", authMiddleware, acceptFollow)
// userRouter.post("/reject/:username", authMiddleware, rejectFollow)
userRouter.get("/:username/followers", authMiddleware, getFollowers)
userRouter.get("/:username/following", authMiddleware, getFollowing)
userRouter.delete("/unfollow/:username", authMiddleware, unfollowUser)

userRouter.get("/profile/:username", authMiddleware, getProfile);

userRouter.put(
    "/profile",
    authMiddleware,
    upload.single("profileImage"),  
    updateProfile
);
userRouter.get('/checkUser',checkUsernameAvailability)
userRouter.get("/search", searchUsers);

module.exports = userRouter
