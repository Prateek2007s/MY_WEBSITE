import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Multer setup - in memory storage (no disk)
const upload = multer({ storage: multer.memoryStorage() });

// Cloudflare R2 client config
const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://661c0a29322d276aa333e7722f811e30.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '86aced6ef4797b7760614940295dfbc7',
    secretAccessKey: '51a8726814bc743276fcf84f6d8c133757ba4a0b59637e889c826fcb58c6a7c3',
  },
  forcePathStyle: false,
});

// Disable default body parser to allow multer handle multipart
export const config = {
  api: { bodyParser: false }
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Use multer middleware to parse the form-data
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: 'File upload failed during parsing' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file found in the request' });
    }

    try {
      const file = req.file;

      // Use original filename, you can customize it here
      const key = file.originalname;

      const params = {
        Bucket: 'antichat', // your bucket name
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      // Upload to R2
      await s3Client.send(new PutObjectCommand(params));

      // Construct public URL to return
      const fileUrl = `https://661c0a29322d276aa333e7722f811e30.r2.cloudflarestorage.com/antichat/${encodeURIComponent(key)}`;

      return res.status(200).json({ fileUrl });
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Upload failed' });
    }
  });
}
