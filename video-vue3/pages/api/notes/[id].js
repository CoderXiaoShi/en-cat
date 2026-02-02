const { queryOne, run } = require('../../lib/db');

export default async function handler(req, res) {
  const { id } = req.query;
  await require('../../../lib/db').initDb();

  if (req.method === 'GET') {
    try {
      const note = queryOne('SELECT * FROM notes WHERE id = ?', [id]);
      if (!note) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '笔记不存在' } });
      }
      res.status(200).json({ success: true, data: note });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else if (req.method === 'PUT') {
    try {
      const { content, audio_url, audio_duration, timestamp } = req.body;
      run(`
        UPDATE notes SET content = ?, audio_url = ?, audio_duration = ?, timestamp = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `, [content, audio_url, audio_duration, timestamp, id]);
      
      const note = queryOne('SELECT * FROM notes WHERE id = ?', [id]);
      res.status(200).json({ success: true, data: note });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else if (req.method === 'DELETE') {
    try {
      run('DELETE FROM notes WHERE id = ?', [id]);
      res.status(200).json({ success: true, message: '删除成功' });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} Not Allowed` } });
  }
}
