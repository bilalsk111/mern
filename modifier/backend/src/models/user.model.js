const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    minlength: 3
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  }
}, { timestamps: true })

const userModel = mongoose.model('user',userSchema)

module.exports = userModel