const { initDb, queryAll, run, queryOne } = require('../lib/db');

export default async function handler(req, res) {
  await initDb();

  if (req.method === 'GET') {
    try {
      const { notebook_id } = req.query;
      if (!notebook_id) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'notebook_id 为必填项' } });
      }
      
      const notes = queryAll(`
        SELECT * FROM notes WHERE notebook_id = ? ORDER BY timestamp ASC, created_at ASC
      `, [notebook_id]);
      
      res.status(200).json({ success: true, data: notes });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else if (req.method === 'POST') {
    try {
      const { notebook_id, content, audio_url, audio_duration, timestamp } = req.body;
      
      if (!notebook_id) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'notebook_id 为必填项' } });
      }
      
      const result = run(`
        INSERT INTO notes (notebook_id, content, audio_url, audio_duration, timestamp) VALUES (?, ?, ?, ?, ?)
      `, [notebook_id, content || '', audio_url || null, audio_duration || 0, timestamp || 0]);
      
      const note = queryOne('SELECT * FROM notes WHERE id = ?', [result.lastInsertRowid]);
      res.status(201).json({ success: true, data: note });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} Not Allowed` } });
  }
}
