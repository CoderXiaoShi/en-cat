const { queryOne, run } = require('../../lib/db');

export default async function handler(req, res) {
  const { id } = req.query;
  await require('../../../lib/db').initDb();

  if (req.method === 'GET') {
    try {
      const video = queryOne('SELECT * FROM videos WHERE id = ?', [id]);
      if (!video) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '视频不存在' } });
      }
      res.status(200).json({ success: true, data: video });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title, url, subtitle_url, duration } = req.body;
      run(`
        UPDATE videos SET title = ?, url = ?, subtitle_url = ?, duration = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [title, url, subtitle_url, duration, id]);
      
      const video = queryOne('SELECT * FROM videos WHERE id = ?', [id]);
      res.status(200).json({ success: true, data: video });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else if (req.method === 'DELETE') {
    try {
      run('DELETE FROM videos WHERE id = ?', [id]);
      res.status(200).json({ success: true, message: '删除成功' });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} Not Allowed` } });
  }
}
