const { initDb, queryAll, run, queryOne } = require('../lib/db');

export default async function handler(req, res) {
  await initDb();

  if (req.method === 'GET') {
    try {
      const videos = queryAll('SELECT * FROM videos ORDER BY created_at DESC');
      res.status(200).json({ success: true, data: videos });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, url, subtitle_url, duration } = req.body;
      if (!title || !url) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: '标题和URL为必填项' } });
      }
      
      const result = run(`
        INSERT INTO videos (title, url, subtitle_url, duration) VALUES (?, ?, ?, ?)
      `, [title, url, subtitle_url || null, duration || 0]);
      
      const video = queryOne('SELECT * FROM videos WHERE id = ?', [result.lastInsertRowid]);
      res.status(201).json({ success: true, data: video });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} Not Allowed` } });
  }
}
