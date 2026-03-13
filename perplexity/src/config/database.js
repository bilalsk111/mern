import mongoose from "mongoose";

async  function connectToDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log('database connected');
    }catch(err){
        console.log('database not connected',err);  
    }
}

export default connectToDB