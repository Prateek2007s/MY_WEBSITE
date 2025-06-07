// upload.js - Node.js example for uploading file to Cloudflare R2 using AWS S3 SDK

import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';

const R2_ACCESS_KEY_ID = '86aced6ef4797b7760614940295dfbc7';       // Your Cloudflare R2 Access Key ID
const R2_SECRET_ACCESS_KEY = '51a8726814bc743276fcf84f6d8c133757ba4a0b59637e889c826fcb58c6a7c3'; // Your Cloudflare R2 Secret Access Key
const R2_ENDPOINT = 'https://661c0a29322d276aa333e7722f811e30.r2.cloudflarestorage.com';
const R2_BUCKET = 'antichat';

const s3 = new AWS.S3({
  endpoint: R2_ENDPOINT,
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
  region: 'auto',
  signatureVersion: 'v4',
});

export async function uploadFileToR2(filePath, fileName) {
  const fileStream = fs.createReadStream(filePath);

  const params = {
    Bucket: R2_BUCKET,
    Key: fileName,
    Body: fileStream,
    ACL: 'public-read', // To allow public access (adjust permissions as needed)
  };

  try {
    await s3.upload(params).promise();
    const publicUrl = `${R2_ENDPOINT}/${R2_BUCKET}/${encodeURIComponent(fileName)}`;
    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Example usage:
// uploadFileToR2('./path/to/file.jpg', 'uploads/file.jpg')
//   .then(url => console.log('File URL:', url))
//   .catch(console.error);
