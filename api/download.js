
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
    
    const { url: fileUrl, filename = 'download' } = req.query;

    if (!fileUrl) {
      return res.status(400).json({ error: 'Missing file URL' });
    }

    const urlParts = fileUrl.split('/');
    const objectKey = urlParts[urlParts.length - 1];

    const s3Client = new S3Client({
      region: "auto",
      endpoint: "https://661c0a29322d276aa333e7722f811e30.r2.cloudflarestorage.com",
      credentials: {
        accessKeyId: "86aced6ef4797b7760614940295dfbc7",
        secretAccessKey: "51a8726814bc743276fcf84f6d8c133757ba4a0b59637e889c826fcb58c6a7c3",
      },
      forcePathStyle: true,
    });

    const command = new GetObjectCommand({
      Bucket: "antichat",
      Key: objectKey,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      return res.status(404).json({ error: 'File not found' });
    }

    let fileBuffer;
    
    if (response.Body.transformToByteArray) {
      const uint8Array = await response.Body.transformToByteArray();
      fileBuffer = Buffer.from(uint8Array);
    } else {
      const chunks = [];
      for await (const chunk of response.Body) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      fileBuffer = Buffer.concat(chunks);
    }

    const originalFileName = filename.includes('_') ? filename.split('_').slice(1).join('_') : filename;
    
    res.setHeader('Content-Disposition', `attachment; filename="${originalFileName}"`);
    res.setHeader('Content-Type', response.ContentType || 'application/octet-stream');
    res.setHeader('Content-Length', fileBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Accept-Ranges', 'bytes');
    
    return res.status(200).send(fileBuffer);

  } catch (error) {
    console.error('Download proxy error:', error);
    return res.status(500).json({ error: 'Download failed' });
  }
}
