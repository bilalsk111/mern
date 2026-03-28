let ImageKit = require('@imagekit/nodejs/index.js')
let { toFile } = require('@imagekit/nodejs/index.js')
const Follow = require("../models/follow.model");
const userModel = require("../models/user.model");
const postModel = require('../models/post.model');



const imagekit = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY
})

async function followUser(req, res) {
  try {
    const followerId = req.user.id;
    const { username } = req.params;

    const targetUser = await userModel.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (targetUser._id.toString() === followerId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const existing = await Follow.findOne({
      follower: followerId,
      followee: targetUser._id,
    });

    if (existing) {
      return res.status(409).json({
        message: "Already following this user",
        isFollowing: true
      });
    }

    await Follow.create({
      follower: followerId,
      followee: targetUser._id,
    });

    const followersCount = await Follow.countDocuments({
      followee: targetUser._id
    });

    return res.status(201).json({
      message: "Followed successfully",
      isFollowing: true,
      followersCount
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}


async function unfollowUser(req, res) {
  try {
    const followerId = req.user.id;
    const { username } = req.params;

    const targetUser = await userModel.findOne({ username });
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const deleted = await Follow.findOneAndDelete({
      follower: followerId,
      followee: targetUser._id,
    });

    if (!deleted) {
      return res.status(404).json({
        message: "Not following this user",
        isFollowing: false
      });
    }

    const followersCount = await Follow.countDocuments({
      followee: targetUser._id
    });

    return res.status(200).json({
      message: "Unfollowed successfully",
      isFollowing: false,
      followersCount
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getFollowers(req, res) {
  try {
    const { username } = req.params;

    const user = await userModel.findOne({ username });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const followers = await Follow.find({
      followee: user._id,
    })
      .populate("follower", "username profileImage")
      .lean();

    res.json({
      totalFollowers: followers.length,
      followers: followers.map(f => f.follower)
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
async function getFollowing(req, res) {
  try {
    const { username } = req.params;

    const user = await userModel.findOne({ username });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const following = await Follow.find({
      follower: user._id,
    })
      .populate("followee", "username profileImage")
      .lean();

    res.json({
      totalFollowing: following.length,
      following: following.map(f => f.followee)
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}

async function getProfile(req, res) {
  try {
    const { username } = req.params;

    const user = await userModel.findOne({ username });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const posts = await postModel.find({ user: user._id });

    const followersCount = await Follow.countDocuments({
      followee: user._id,
    });

    const followingCount = await Follow.countDocuments({
      follower: user._id,
    });

    let isFollowing = false;

    if (req.user && req.user.id) {
      const existing = await Follow.findOne({
        follower: req.user.id,
        followee: user._id,
      });

      isFollowing = !!existing;
    }

    res.json({
      user,
      posts,
      followersCount,
      followingCount,
      isFollowing,
    });

  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
}

async function updateProfile(req, res) {

  let userId = req.user.id
  let { name, bio, username } = req.body

  let updateData = { name, bio }
  if (username) {
    const existingUser = await userModel.findOne({ username })
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: "Username already taken" });
    }
    updateData.username = username
  }

  if (req.file) {
    const uploadfile = await imagekit.files.upload({
      file: await toFile(req.file.buffer, req.file.originalname),
      fileName: `profileimage-${Date.now()}.jpg`,
      folder: "insta-clone",
    });

    updateData.profileImage = uploadfile.url;
  }


  let user = await userModel.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  })

  res.json({
    message: "Profile updated successfully",
    user
  })
}

async function checkUsernameAvailability(req, res) {
  try {
    let { username } = req.query;

    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        available: false,
        message: "Username must be at least 3 characters",
      });
    }

    username = username.trim().toLowerCase();

    const existingUser = await userModel.findOne({ username });

    if (existingUser) {
      return res.json({
        available: false,
        message: "Username already taken",
        suggestions: [
          username + "123",
          username + "_official",
          username + Date.now().toString().slice(-3),
        ],
      });
    }

    return res.json({
      available: true,
      message: "Username is available",
    });

  } catch (error) {
    console.error("Username check error:", error);
    return res.status(500).json({
      available: false,
      message: "Server error",
    });
  }
}

// async function acceptFollow(req, res) {
//     try {
//         const receiverId = req.user.id;
//         const { username } = req.params;

//         const sender = await User.findOne({ username });
//         if (!sender)
//             return res.status(404).json({ message: "User not found" });

//         const updated = await Follow.findOneAndUpdate(
//             {
//                 follower: sender._id,
//                 followee: receiverId,
//                 status: "pending"
//             },
//             { status: "accepted" },
//             { returnDocument: "after" }
//         );

//         if (!updated)
//             return res.status(404).json({ message: "Pending request not found" });

//         return res.status(200).json({ message: "Follow accepted" });

//     } catch {
//         return res.status(500).json({ message: "Internal server error" });
//     }
// }

// async function rejectFollow(req, res) {
//     try {
//         const receiverId = req.user.id;
//         const { username } = req.params;

//         const sender = await User.findOne({ username });
//         if (!sender)
//             return res.status(404).json({ message: "User not found" });

//         const deleted = await Follow.findOneAndDelete({
//             follower: sender._id,
//             followee: receiverId,
//             status: "pending"
//         });

//         if (!deleted)
//             return res.status(404).json({ message: "Pending request not found" });

//         return res.status(200).json({ message: "Follow rejected" });

//     } catch {
//         return res.status(500).json({ message: "Internal server error" });
//     }
// }
async function searchUsers(req,res) {
    try {
    const q = req.query.q?.trim();

    if (!q || q.length < 2) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const users = await userModel.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { name: { $regex: q, $options: "i" } },
      ],
    })
      .select("_id username name profileImage")
      .limit(10);

    return res.status(200).json({
      success: true,
      data: users,
    });

  } catch (error) {
    console.error("Search Users Error:", error);

    return res.status(500).json({
      success: false,
      data: [],
      message: "Server error",
    });
  }

}

module.exports = {
  followUser,
  unfollowUser,
  updateProfile,
  getProfile,
  getFollowers,
  getFollowing,
  checkUsernameAvailability,
 searchUsers
};
