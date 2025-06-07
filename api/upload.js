import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import nextConnect from "next-connect";
import multer from "multer";

const REGION = "auto"; // Cloudflare R2 uses "auto"
const BUCKET_NAME = "antichat";
const CLOUDFLARE_ENDPOINT = "https://661c0a29322d276aa333e7722f811e30.r2.cloudflarestorage.com";

const ACCESS_KEY_ID = "86aced6ef4797b7760614940295dfbc7";
const SECRET_ACCESS_KEY = "51a8726814bc743276fcf84f6d8c133757ba4a0b59637e889c826fcb58c6a7c3";

const s3Client = new S3Client({
  region: REGION,
  endpoint: CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // Required for Cloudflare R2 compatibility
});

// Disable Next.js default body parser for multipart form data
export const config = {
  api: { bodyParser: false },
};

// Setup multer for parsing multipart/form-data (file uploads)
const upload = multer();

const handler = nextConnect();

// Use multer middleware to handle single file upload with field name "file"
handler.use(upload.single("file"));

handler.post(async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Sanitize filename and prepend timestamp for uniqueness
    const safeFilename = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;

    // Upload the file buffer to Cloudflare R2 bucket
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: safeFilename,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL is not needed for Cloudflare R2 (optional)
      })
    );

    // Construct the public URL to the uploaded file
    const publicUrl = `${CLOUDFLARE_ENDPOINT}/${BUCKET_NAME}/${encodeURIComponent(safeFilename)}`;

    // Send the URL back to the client
    return res.status(200).json({ url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload file" });
  }
});

export default handler;
