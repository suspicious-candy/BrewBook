import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * Establishes a Mongoose connection to the MongoDB instance specified by the
 * MONGO_URI environment variable. On failure, logs the error and terminates the
 * process with exit code 1 to prevent the server starting in a broken state.
 */
export const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
