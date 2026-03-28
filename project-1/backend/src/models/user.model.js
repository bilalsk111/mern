let mongoose = require('mongoose');

let userSchema  = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        trim:true,
        minlength: 3,
        lowercase: true
    },

    email:{
        type: String,
        required:true,
        unique:true,
        lowercase: true,
        trim:true
    },

    password:{
        type:String,
        required:true,
        minlength:8,
        select:false
    },

    name:{
        type:String,
        default:"Enter a name"
    },

    bio:{
        type: String,
        default:'Enter a bio'
    },

    profileImage:{
        type:String,
        default:'https://ik.imagekit.io/0dkbfujo9/avatar-default-user-profile-icon-simple-flat-vector-57234190.webp'
    }

},{timestamps:true})

let userModel = mongoose.model("User", userSchema);

module.exports = userModel
