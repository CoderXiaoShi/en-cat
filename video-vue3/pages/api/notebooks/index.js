const { initDb, queryAll, run } = require('../lib/db');

export default async function handler(req, res) {
  await initDb();

  if (req.method === 'GET') {
    try {
      const notebooks = queryAll(`
        SELECT n.*, v.title as video_title 
        FROM notebooks n 
        LEFT JOIN videos v ON n.video_id = v.id 
        ORDER BY n.created_at DESC
      `);
      res.status(200).json({ success: true, data: notebooks });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else if (req.method === 'POST') {
    try {
      const { title, video_id } = req.body;
      const result = run(`
        INSERT INTO notebooks (title, video_id) VALUES (?, ?)
      `, [title || '我的笔记本', video_id || null]);
      
      const notebook = queryOne(`
        SELECT n.*, v.title as video_title 
        FROM notebooks n 
        LEFT JOIN videos v ON n.video_id = v.id 
        WHERE n.id = ?
      `, [result.lastInsertRowid]);
      
      res.status(201).json({ success: true, data: notebook });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} Not Allowed` } });
  }
}
