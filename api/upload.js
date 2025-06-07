import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();
  form.maxFileSize = 10 * 1024 * 1024; // 10MB max

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(400).json({ error: 'Error parsing the file' });
    }

    const file = files.file; // assuming <input name="file" />
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // TODO: Save file to storage (Cloudflare R2 or local)
    // For now, just respond success and file info

    res.status(200).json({
      success: true,
      filename: file.originalFilename,
      size: file.size,
      mimetype: file.mimetype,
    });
  });
}
