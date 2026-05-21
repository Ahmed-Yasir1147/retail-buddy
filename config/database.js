import mongoose from "mongoose";

const mongoDB = "mongodb://127.0.0.1/retail_buddy";

async function main() {
  await mongoose.connect(mongoDB);
}

try {
    main();
} catch(error) {
    console.log(error);
}