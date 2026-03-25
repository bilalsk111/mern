import mongoose from "mongoose";

const userMemorySchema = new mongoose.Schema({
  userId: String,
  facts: [String],
  tone: String,
  language: String
});

export default mongoose.model("UserMemory", userMemorySchema);