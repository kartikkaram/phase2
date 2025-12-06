import mongoose from "mongoose";

import dotenv from "dotenv"

dotenv.config({
  path:"src/.env"
})

const connectDB = async () => {
  console.log("Mongo URL: ", process.env.MONGODB_URL);
  try {
    const connection_instance = await mongoose.connect(
      `${process.env.MONGODB_URL}`,
    );
    console.log(
      `MongoDB connected ! ${connection_instance.connection.host}`,
    );
  } catch (error) {
    console.log("mongoDB connection error", error);
    process.exit(1);
  }
};

export default connectDB