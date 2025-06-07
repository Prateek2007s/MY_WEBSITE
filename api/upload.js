
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
    const multer = require('multer');
    
    const upload = multer();
    const uploadMiddleware = upload.single('file');
    
    await new Promise((resolve, reject) => {
      uploadMiddleware(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const s3Client = new S3Client({
      region: "auto",
      endpoint: "https://661c0a29322d276aa333e7722f811e30.r2.cloudflarestorage.com",
      credentials: {
        accessKeyId: "86aced6ef4797b7760614940295dfbc7",
        secretAccessKey: "51a8726814bc743276fcf84f6d8c133757ba4a0b59637e889c826fcb58c6a7c3",
      },
      forcePathStyle: true,
    });

    const safeFilename = `${Date.now()}_${file.originalname.replace(/\s+/g, "_")}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: "antichat",
        Key: safeFilename,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    const publicUrl = `https://pub-a8402a1b495f44eebcdc48c2ca575ed2.r2.dev/${safeFilename}`;
    return res.status(200).json({ url: publicUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload file" });
  }
}
