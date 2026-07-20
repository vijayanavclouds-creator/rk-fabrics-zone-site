"use server"

import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function getCloudinarySignature() {
  if (!process.env.CLOUDINARY_API_SECRET || !process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    throw new Error("Missing Cloudinary credentials in .env")
  }
  
  const timestamp = Math.round((new Date).getTime()/1000);
  
  // Create a signature that authorizes the upload to the specific folder with specific optimizations
  const params = {
    timestamp: timestamp,
    folder: 'rk-fabrics/products',
    transformation: 'w_1500,c_limit,q_auto:good,f_auto'
  }
  
  const signature = cloudinary.utils.api_sign_request(
    params, 
    process.env.CLOUDINARY_API_SECRET
  );

  return { 
    timestamp, 
    signature, 
    cloudName: process.env.CLOUDINARY_CLOUD_NAME, 
    apiKey: process.env.CLOUDINARY_API_KEY 
  }
}
