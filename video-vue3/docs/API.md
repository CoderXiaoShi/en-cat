# API 接口设计文档

## 基础信息

- **Base URL**: `/api`
- **Content-Type**: `application/json`
- **响应格式**: JSON

## 视频相关接口

### 1. 获取视频列表

**接口**: `GET /api/videos`

**请求参数**: 无

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "示例英语教程",
      "url": "/videos/sample.mp4",
      "subtitle_url": "/subtitles/sample.vtt",
      "duration": 300,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 2. 获取单个视频详情

**接口**: `GET /api/videos/:id`

**请求参数**:

- `id`: 视频ID

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "示例英语教程",
    "url": "/videos/sample.mp4",
    "subtitle_url": "/subtitles/sample.vtt",
    "duration": 300,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3. 创建视频

**接口**: `POST /api/videos`

**请求体**:

```json
{
  "title": "新视频标题",
  "url": "/videos/new.mp4",
  "subtitle_url": "/subtitles/new.vtt",
  "duration": 180
}
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": 2,
    "title": "新视频标题",
    "url": "/videos/new.mp4",
    "subtitle_url": "/subtitles/new.vtt",
    "duration": 180,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

## 笔记本相关接口

### 4. 获取笔记本列表

**接口**: `GET /api/notebooks`

**请求参数**: 无

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "我的学习笔记",
      "video_id": 1,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 5. 获取笔记本详情（含笔记列表）

**接口**: `GET /api/notebooks/:id`

**请求参数**:

- `id`: 笔记本ID

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "我的学习笔记",
    "video_id": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "notes": [
      {
        "id": 1,
        "content": "今天学习的句子",
        "audio_url": "/audio/note1.mp3",
        "audio_duration": 15,
        "timestamp": 45,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 6. 创建笔记本

**接口**: `POST /api/notebooks`

**请求体**:

```json
{
  "title": "新笔记本",
  "video_id": 1
}
```

**响应示例**:

```json
{
  "success": true,
 data": {
    "id": 2,
    "title": "新笔记本",
    "video_id": 1,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 7. 更新笔记本

**接口**: `PUT /api/notebooks/:id`

**请求体**:

```json
{
  "title": "更新后的笔记本名称"
}
```

### 8. 删除笔记本

**接口**: `DELETE /api/notebooks/:id`

## 笔记相关接口

### 9. 获取笔记列表

**接口**: `GET /api/notes?notebook_id=:id`

**请求参数**:

- `notebook_id`: 笔记本ID（必需）

**响应示例**:

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "notebook_id": 1,
      "content": "今天学习的句子",
      "audio_url": "/audio/note1.mp3",
      "audio_duration": 15,
      "timestamp": 45,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 10. 创建笔记

**接口**: `POST /api/notes`

**请求体**:

```json
{
  "notebook_id": 1,
  "content": "今天学习的句子",
  "audio_url": "/audio/note1.mp3",
  "audio_duration": 15,
  "timestamp": 45
}
```

**响应示例**:

```json
{
  "success": true,
  "data": {
    "id": 1,
    "notebook_id": 1,
    "content": "今天学习的句子",
    "audio_url": "/audio/note1.mp3",
    "audio_duration": 15,
    "timestamp": 45,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 11. 更新笔记

**接口**: `PUT /api/notes/:id`

**请求体**:

```json
{
  "content": "更新后的内容"
}
```

### 12. 删除笔记

**接口**: `DELETE /api/notes/:id`

## 文件上传接口

### 13. 上传语音文件

**接口**: `POST /api/upload/audio`

**Content-Type**: `multipart/form-data`

**请求参数**:

- `audio`: 语音文件（支持 mp3, wav, m4a, webm 格式，最大 10MB）

**响应示例**:

```json
{
  "success": true,
  "data": {
    "url": "/uploads/audio/abc123.mp3",
    "duration": 15
  }
}
```

### 14. 上传视频文件

**接口**: `POST /api/upload/video`

**Content-Type**: `multipart/form-data`

**请求参数**:

- `video`: 视频文件（支持 mp4, webm 格式，最大 100MB）

**响应示例**:

```json
{
  "success": true,
  "data": {
    "url": "/uploads/video/def456.mp4"
  }
}
```

### 15. 上传字幕文件

**接口**: `POST /api/upload/subtitle`

**Content-Type**: `multipart/form-data`

**请求参数**:

- `subtitle`: 字幕文件（支持 vtt 格式，最大 1MB）

**响应示例**:

```json
{
  "success": true,
  "data": {
    "url": "/uploads/subtitle/ghi789.vtt"
  }
}
```

## 错误响应格式

所有接口的错误响应格式统一为：

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述信息"
  }
}
```

### 常见错误码

| 错误码            | 说明             |
| ----------------- | ---------------- |
| VALIDATION_ERROR  | 参数验证失败     |
| NOT_FOUND         | 资源不存在       |
| INTERNAL_ERROR    | 服务器内部错误   |
| FILE_TOO_LARGE    | 文件大小超出限制 |
| INVALID_FILE_TYPE | 不支持的文件类型 |

## 状态码说明

| 状态码 | 说明           |
| ------ | -------------- |
| 200    | 请求成功       |
| 201    | 资源创建成功   |
| 400    | 请求参数错误   |
| 404    | 资源不存在     |
| 500    | 服务器内部错误 |
