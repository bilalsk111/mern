const mongoose = require('mongoose')

const favSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
    },
    song:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"songs",
        required:true
    },
},{timestamps:true})

favSchema.index({user:1,song:1},{unique:true})

const favModel = mongoose.model('fav',favSchema)

module.exports = favModel