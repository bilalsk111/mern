let postModel = require('../models/post.model')
let ImageKit = require('@imagekit/nodejs/index.js')
let { toFile } = require('@imagekit/nodejs/index.js')
const likeModel = require('../models/like.model')
const saveModel = require("../models/save.model");
const Follow = require('../models/follow.model')
const Comment = require('../models/comment.model');
const userModel = require('../models/user.model');


const imagekit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY
})

// CREATE POST
async function createPost(req,res){
    let userId = req.user.id

    if(!req.file){
        return res.status(401).json({
            message:"media required"
        })
    }

    let isVideo = req.file.mimetype.startsWith('video')
    let isimage = req.file.mimetype.startsWith('image')
    if(!isVideo && !isimage){
        return res.status(404).json({
            message:"only image/video allowed"
        })
    }
    let uploadfile = await imagekit.files.upload({
        file: await toFile(req.file.buffer,req.file.originalname),
        fileName: `post-${Date.now()}`,
        folder: 'insta-clone'
    })
    let newPost = await postModel.create({
        caption:req.body.caption,
        mediaUrl:uploadfile.url,
        mediaType: isVideo ? "video" : "image",
        user:userId
    })
    res.status(201).json({
        message:"post uploaded successfully",
        newPost
    })
 }

async function deletePost(req, res) {
  const userId = req.user.id;
  const postId = req.params.id;

  const post = await postModel.findById(postId);

  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }

 if (post.user.toString() !== userId) {
  return res.status(403).json({ message: "Not allowed" });
}

  await postModel.findByIdAndDelete(postId);

  // remove all saves related to this post
  await saveModel.deleteMany({ post: postId });

  res.status(200).json({
    message: "Post deleted",
    postId
  });
}

async function toggleSavePost(req, res) {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const existing = await saveModel.findOne({
      user: userId,
      post: postId,
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({ saved: false, postId });
    }

    await saveModel.create({ user: userId, post: postId });

    res.json({ saved: true, postId });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

async function getSavedPosts(req, res) {
   const userId = req.user.id;

    const savedDocs = await saveModel
      .find({ user: userId })
      .populate({
        path: "post",
        populate: {
          path: "user",
          select: "username profileImage",
        },
      })
      .sort({ createdAt: -1 });

    const validSaves = savedDocs.filter((s) => s.post !== null);

    const posts = await Promise.all(
      validSaves.map(async (s) => {
        const totalLikes = await likeModel.countDocuments({
          post: s.post._id,
        });

        return {
          ...s.post.toObject(),
          totalLikes,
          isSaved: true,
          isLiked: false,
        };
      })
    );

    res.json({ posts });
}

async function GetFeed(req, res) {
  try {
    const userId = req.user.id;

    const posts = await postModel
      .find()
      .populate("user", "username profileImage")
      .sort({ createdAt: -1 });

    const postIds = posts.map((p) => p._id);
    const userIds = [...new Set(posts.map((p) => p.user._id.toString()))];

    const likes = await likeModel.find({
      post: { $in: postIds },
      user: userId,
    });

    const saves = await saveModel.find({
      post: { $in: postIds },
      user: userId,
    });
    const following = await Follow.find({
      follower: userId,
      followee: { $in: userIds }
    });

    const likedSet = new Set(likes.map((l) => l.post.toString()));
    const savedSet = new Set(saves.map((s) => s.post.toString()));
    const followingSet = new Set(following.map((f) => f.followee.toString()));

    const finalPosts = await Promise.all(
      posts.map(async (post) => {
        const totalLikes = await likeModel.countDocuments({
          post: post._id,
        });

        return {
          ...post.toObject(),
          totalLikes,
          isLiked: likedSet.has(post._id.toString()),
          isSaved: savedSet.has(post._id.toString()),
          user: {
            ...post.user.toObject(),
            isFollowing: followingSet.has(post.user._id.toString())
          }
        };
      })
    );

    res.json({ posts: finalPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}


// GET SINGLE POST (public)
async function deletePost(req, res) {
  try {
    const userId = req.user.id;
    const postId = req.params.id;

    const post = await postModel.findById(postId);

    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== userId)
      return res.status(403).json({ message: "Not allowed" });

    await postModel.findByIdAndDelete(postId);
    await likeModel.deleteMany({ post: postId });
    await saveModel.deleteMany({ post: postId });

    res.json({ message: "Post deleted", postId });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

/**
 * Toggle Like
 * Route: POST /api/posts/like/:id
 */
async function toggleLike(req, res) {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    const post = await postModel.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const existing = await likeModel.findOne({ post: postId, user: userId });

    let liked;

    if (existing) {
      await existing.deleteOne();
      liked = false;
    } else {
      await likeModel.create({ post: postId, user: userId });
      liked = true;
    }

    const totalLikes = await likeModel.countDocuments({ post: postId });

    res.json({ liked, totalLikes, postId });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
async function getPostLikes(req, res) {
    const { postId } = req.params;

    const likes = await likeModel
        .find({ post: postId })
        .populate("user", "username profileImage");

    res.json({
        totalLikes: likes.length,
        likes
    });
}
async function getSavedPosts(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.user.id;

    const savedDocs = await saveModel
      .find({ user: userId })
      .populate({
        path: "post",
        populate: {
          path: "user",
          select: "username profileImage",
        },
      })
      .sort({ createdAt: -1 });

    if (!savedDocs || savedDocs.length === 0) {
      return res.json({ posts: [] });
    }

    // Remove broken references (very important)
    const validSaves = savedDocs.filter((s) => s.post);

    const posts = await Promise.all(
      validSaves.map(async (s) => {
        const totalLikes = await likeModel.countDocuments({
          post: s.post._id,
        });

        return {
          ...s.post.toObject(),
          totalLikes,
          isLiked: false,
          isSaved: true,
        };
      })
    );

    res.json({ posts });

  } catch (error) {
    console.error("GET SAVED ERROR:", error);
    res.status(500).json({ message: error.message });
  }
}

async function detailsPosts(req,res){
    let postId = req.params.id
    let post = await postModel
                    .findById(postId)
                    .populate('user','username email')
    if(!post){
        return res.status(401).json({
            message:"post not found"
        })
    }
        res.status(200).json({ post })
}
async function createComment(req, res) {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    if (!text?.trim())
      return res.status(400).json({ message: "Comment cannot be empty" });

    const post = await postModel.findById(postId);
    if (!post)
      return res.status(404).json({ message: "Post not found" });

    const user = await userModel.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const comment = await Comment.create({
      post: postId,
      userId: user._id,
      username: user.username,
      profileImage: user.profileImage,
      text: text.trim(),
    });

    res.status(201).json({ message: "Comment added", comment });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
async function getComments(req, res) {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .lean();

    return res.json({ comments });
  } catch {
    return res.status(500).json({ message: "Internal server error" });
  }
}

async function getReels(req,res){
  try{
    const reels = await postModel.find({
      mediaType:"video"
    }).populate("user","username profileImage")
     .sort({ createdAt: -1 });
    res.status(201).json({reels})
  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
}


module.exports = {
    createPost,
    GetFeed,
    detailsPosts,
    toggleLike,
    getPostLikes,
    deletePost,
    toggleSavePost,
    getSavedPosts,
      getComments,
    createComment,
    getReels
}
