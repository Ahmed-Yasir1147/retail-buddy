import mongoose from "mongoose";

const mongoDB = "mongodb://localhost:27017/retailbuddy";

export async function main() {
  await mongoose.connect(mongoDB);
}

