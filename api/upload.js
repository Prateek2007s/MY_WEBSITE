import multer from 'multer';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from 'crypto';

// Multer setup (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

const s3Client = new S3Client({
  region: 'auto',
  endpoint: 'https://661c0a29322d276aa333e7722f811e30.r2.cloudflarestorage.com', // Your R2 endpoint
  credentials: {
    accessKeyId: '86aced6ef4797b7760614940295dfbc7', // Your Access Key ID
    secretAccessKey: '51a8726814bc743276fcf84f6d8c133757ba4a0b59637e889c826fcb58c6a7c3', // Your Secret Access Key
  },
  forcePathStyle: false,
});

// Disable default bodyParser to use multer
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Use multer middleware to parse file upload
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ error: 'File upload failed' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    try {
      const file = req.file;

      // Generate a random filename with original extension
      const ext = file.originalname.split('.').pop();
      const filename = crypto.randomBytes(16).toString('hex') + '.' + ext;

      // Prepare S3 upload params
      const params = {
        Bucket: 'antichat', // Your R2 bucket name
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read', // Make file publicly accessible
      };

      // Upload file to R2
      await s3Client.send(new PutObjectCommand(params));

      // Construct public URL
      const fileUrl = `https://661c0a29322d276aa333e7722f811e30.r2.cloudflarestorage.com/antichat/${filename}`;

      return res.status(200).json({ fileUrl });
    } catch (uploadError) {
      console.error('Upload error:', uploadError);
      return res.status(500).json({ error: 'Upload failed' });
    }
  });
}
