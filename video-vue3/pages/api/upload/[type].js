const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
  const audioDir = path.join(UPLOAD_DIR, 'audio');
  const videoDir = path.join(UPLOAD_DIR, 'video');
  const subtitleDir = path.join(UPLOAD_DIR, 'subtitle');
  
  if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });
  if (!fs.existsSync(subtitleDir)) fs.mkdirSync(subtitleDir, { recursive: true });
  
  return { audioDir, videoDir, subtitleDir };
}

function getAudioDuration(buffer) {
  try {
    const view = new DataView(buffer.buffer);
    if (view.getUint32(0, false) === 0x46464952 && view.getUint32(8, false) === 0x45564157) {
      const dataSize = view.getUint32(4, true);
      const duration = Math.round(dataSize / 44.1);
      return Math.min(duration, 60);
    }
    return 0;
  } catch (e) {
    return 0;
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: 'Only POST allowed' } });
  }

  ensureUploadDir();
  const { audioDir, videoDir, subtitleDir } = ensureUploadDir();
  
  const uploadHandler = (type, allowedTypes, maxSize, getFilename, getDir) => {
    return new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', chunk => chunks.push(chunk));
      req.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length > maxSize) {
          return reject({ code: 'FILE_TOO_LARGE', message: '文件大小超出限制' });
        }
        
        const filename = getFilename(buffer);
        const filepath = path.join(getDir(), filename);
        fs.writeFileSync(filepath, buffer);
        
        resolve({ url: `/uploads/${type}/${filename}` });
      });
      req.on('error', reject);
    });
  };

  const contentType = req.headers['content-type'] || '';
  
  try {
    if (contentType.includes('audio')) {
      uploadHandler('audio', ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/webm'], 10 * 1024 * 1024, 
        (buffer) => `${uuidv4()}.mp3`, () => audioDir)
        .then(result => {
          res.status(200).json({ success: true, data: result });
        })
        .catch(err => {
          res.status(400).json({ success: false, error: { code: err.code || 'UPLOAD_ERROR', message: err.message } });
        });
    } else if (contentType.includes('video')) {
      uploadHandler('video', ['video/mp4', 'video/webm'], 100 * 1024 * 1024,
        (buffer) => `${uuidv4()}.mp4`, () => videoDir)
        .then(result => {
          res.status(200).json({ success: true, data: result });
        })
        .catch(err => {
          res.status(400).json({ success: false, error: { code: err.code || 'UPLOAD_ERROR', message: err.message } });
        });
    } else if (contentType.includes('text') || contentType.includes(' VTT') || filename.endsWith('.vtt')) {
      uploadHandler('subtitle', ['text/vtt', 'text/plain'], 1024 * 1024,
        (buffer) => `${uuidv4()}.vtt`, () => subtitleDir)
        .then(result => {
          res.status(200).json({ success: true, data: result });
        })
        .catch(err => {
          res.status(400).json({ success: false, error: { code: err.code || 'UPLOAD_ERROR', message: err.message } });
        });
    } else {
      res.status(400).json({ success: false, error: { code: 'INVALID_FILE_TYPE', message: '不支持的文件类型' } });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
  }
}
