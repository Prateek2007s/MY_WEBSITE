import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import nextConnect from "next-connect";
import multer from "multer";

const REGION = "auto";
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
  forcePathStyle: true,
});

export const config = {
  api: { bodyParser: false },
};

const upload = multer();
const handler = nextConnect();
handler.use(upload.single("file"));

handler.post(async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const filename = `${Date.now()}_${file.originalname}`;
    await s3Client.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    const publicUrl = `${CLOUDFLARE_ENDPOINT}/${BUCKET_NAME}/${encodeURIComponent(filename)}`;
    return res.status(200).json({ url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload file" });
  }
});

export default handler;
