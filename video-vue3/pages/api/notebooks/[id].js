const { queryOne, queryAll, run } = require('../../lib/db');

export default async function handler(req, res) {
  const { id } = req.query;
  await require('../../../lib/db').initDb();

  if (req.method === 'GET') {
    try {
      const notebook = queryOne(`
        SELECT n.*, v.title as video_title, v.url as video_url, v.subtitle_url as video_subtitle_url
        FROM notebooks n 
        LEFT JOIN videos v ON n.video_id = v.id 
        WHERE n.id = ?
      `, [id]);
      
      if (!notebook) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '笔记本不存在' } });
      }
      
      const notes = queryAll(`
        SELECT * FROM notes WHERE notebook_id = ? ORDER BY timestamp ASC, created_at ASC
      `, [id]);
      
      res.status(200).json({ 
        success: true, 
        data: {
          ...notebook,
          notes: notes
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else if (req.method === 'PUT') {
    try {
      const { title } = req.body;
      run(`
        UPDATE notebooks SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
      `, [title, id]);
      
      const notebook = queryOne(`
        SELECT n.*, v.title as video_title 
        FROM notebooks n 
        LEFT JOIN videos v ON n.video_id = v.id 
        WHERE n.id = ?
      `, [id]);
      
      res.status(200).json({ success: true, data: notebook });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else if (req.method === 'DELETE') {
    try {
      run('DELETE FROM notes WHERE notebook_id = ?', [id]);
      run('DELETE FROM notebooks WHERE id = ?', [id]);
      res.status(200).json({ success: true, message: '删除成功' });
    } catch (error) {
      res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: error.message } });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ success: false, error: { code: 'METHOD_NOT_ALLOWED', message: `Method ${req.method} Not Allowed` } });
  }
}
