import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export default defineEventHandler(async (event) => {
  const formData = await readMultipartFormData(event);
  if (!formData || !formData[0]) {
    throw createError({
      statusCode: 400,
      message: '没有上传文件'
    });
  }

  const videoFile = formData[0];
  if (!videoFile.type?.startsWith('video/')) {
    throw createError({
      statusCode: 400,
      message: '请上传视频文件'
    });
  }

  const tempDir = join(process.cwd(), 'temp');
  const fileName = `${uuidv4()}${getExtension(videoFile.filename || '')}`;
  const filePath = join(tempDir, fileName);

  await writeFile(filePath, videoFile.data);

  try {
    const subtitles = generateMockSubtitles();
    return { subtitles };
  } finally {
    try {
      const { unlink } = await import('fs/promises');
      await unlink(filePath);
    } catch (e) {
      console.error('删除临时文件失败:', e);
    }
  }
});

function getExtension(filename: string) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const extensions: Record<string, string> = {
    'mp4': '.mp4',
    'mov': '.mov',
    'avi': '.avi',
    'mkv': '.mkv',
    'webm': '.webm'
  };
  return extensions[ext || ''] || '.mp4';
}

function generateMockSubtitles() {
  const sampleSubtitles = [
    { text: "Hello, how are you today?", startTime: 0, endTime: 2 },
    { text: "I'm doing great, thank you!", startTime: 2.5, endTime: 4.5 },
    { text: "What are you learning today?", startTime: 5, endTime: 7 },
    { text: "I'm learning English with this video app.", startTime: 7.5, endTime: 10.5 },
    { text: "That's wonderful! Keep up the good work.", startTime: 11, endTime: 13.5 },
    { text: "Thank you for your encouragement.", startTime: 14, endTime: 16 },
    { text: "You're welcome. Practice makes perfect!", startTime: 16.5, endTime: 19 },
    { text: "I'll remember that. Bye for now!", startTime: 19.5, endTime: 21.5 },
    { text: "Goodbye! Have a great day.", startTime: 22, endTime: 24 }
  ];
  return sampleSubtitles;
}
