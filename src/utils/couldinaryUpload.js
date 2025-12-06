import { v2 as cloudinary } from "cloudinary";
import fs from "fs"
import dotenv from "dotenv"
dotenv.config()

cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret:process.env.CLOUDINARY_API_SECRET,
  secure: true
});



export const uploadOnCloudinary=async (filePath)=>{
   try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "image",
      folder:"Play_power",
    });
    fs.unlinkSync(filePath);

    return result
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw err;
  }
}