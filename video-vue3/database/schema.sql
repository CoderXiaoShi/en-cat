-- AI学英语应用数据库设计
-- 使用 SQLite 数据库

-- 创建数据库（如果不存在）
-- 数据库文件: data/app.db

-- 视频表：存储教学视频信息
CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,           -- 视频标题
    url VARCHAR(500) NOT NULL,             -- 视频文件路径
    subtitle_url VARCHAR(500),             -- 字幕文件路径 (VTT格式)
    duration INTEGER DEFAULT 0,            -- 视频时长(秒)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 笔记本表：存储用户的学习笔记本
CREATE TABLE IF NOT EXISTS notebooks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL DEFAULT '我的笔记本',
    video_id INTEGER,                      -- 关联的视频ID
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (video_id) REFERENCES videos(id)
);

-- 笔记表：存储具体的笔记内容（包括文本和语音）
CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notebook_id INTEGER NOT NULL,          -- 所属笔记本
    content TEXT,                          -- 文本内容
    audio_url VARCHAR(500),                -- 语音文件路径
    audio_duration INTEGER DEFAULT 0,      -- 语音时长(秒)
    timestamp INTEGER DEFAULT 0,           -- 视频时间戳(秒)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notebook_id) REFERENCES notebooks(id)
);

-- 创建索引优化查询性能
CREATE INDEX IF NOT EXISTS idx_notebooks_video_id ON notebooks(video_id);
CREATE INDEX IF NOT EXISTS idx_notes_notebook_id ON notes(notebook_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);

-- 插入示例数据
INSERT INTO videos (title, url, subtitle_url, duration) VALUES
('示例英语教程', '/videos/sample.mp4', '/subtitles/sample.vtt', 300);

INSERT INTO notebooks (title, video_id) VALUES
('我的学习笔记', 1);

INSERT INTO notes (notebook_id, content, audio_url, audio_duration, timestamp) VALUES
(1, 'Today I learned some new vocabulary.', '/audio/note1.mp3', 15, 45),
(1, 'The video explained grammar clearly.', NULL, 0, 120);
