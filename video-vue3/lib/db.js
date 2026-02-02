const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'app.db');
let db = null;
let SQL = null;

async function getDb() {
  if (!db) {
    if (!SQL) {
      SQL = await initSqlJs();
    }
    
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    if (fs.existsSync(dbPath)) {
      const fileBuffer = fs.readFileSync(dbPath);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
  }
  return db;
}

async function initDb() {
  const database = await getDb();
  
  database.run(`
    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL,
      subtitle_url VARCHAR(500),
      duration INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  database.run(`
    CREATE TABLE IF NOT EXISTS notebooks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL DEFAULT '我的笔记本',
      video_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (video_id) REFERENCES videos(id)
    )
  `);
  
  database.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notebook_id INTEGER NOT NULL,
      content TEXT,
      audio_url VARCHAR(500),
      audio_duration INTEGER DEFAULT 0,
      timestamp INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (notebook_id) REFERENCES notebooks(id)
    )
  `);
  
  const result = database.exec('SELECT COUNT(*) as count FROM videos');
  const videoCount = result[0]?.values[0]?.[0] || 0;
  
  if (videoCount === 0) {
    database.run(`
      INSERT INTO videos (title, url, subtitle_url, duration) VALUES (?, ?, ?, ?)
    `, ['示例英语教程', '/videos/sample.mp4', '/subtitles/sample.vtt', 300]);
    
    database.run(`
      INSERT INTO notebooks (title, video_id) VALUES (?, ?)
    `, ['我的学习笔记', 1]);
    
    database.run(`
      INSERT INTO notes (notebook_id, content, audio_url, audio_duration, timestamp) VALUES (?, ?, ?, ?, ?)
    `, [1, 'Today I learned some new vocabulary.', '/audio/note1.mp3', 15, 45]);
    
    database.run(`
      INSERT INTO notes (notebook_id, content, audio_url, audio_duration, timestamp) VALUES (?, ?, ?, ?, ?)
    `, [1, 'The video explained grammar clearly.', null, 0, 120]);
    
    saveDb();
  }
  
  return database;
}

function saveDb() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    fs.writeFileSync(dbPath, buffer);
  }
}

function closeDb() {
  if (db) {
    saveDb();
    db.close();
    db = null;
  }
}

function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    return row;
  }
  stmt.free();
  return null;
}

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function run(sql, params = []) {
  db.run(sql, params);
  saveDb();
  return {
    lastInsertRowid: db.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] || 0
  };
}

module.exports = {
  getDb,
  initDb,
  closeDb,
  saveDb,
  queryOne,
  queryAll,
  run,
};
