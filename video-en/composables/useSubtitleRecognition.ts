import { ref } from 'vue';

export interface TranscriptionResult {
  text: string;
  startTime: number;
  endTime: number;
}

export function useSubtitleRecognition() {
  const isProcessing = ref(false);
  const error = ref<string | null>(null);

  const recognizeSubtitles = async (videoFile: File): Promise<TranscriptionResult[]> => {
    isProcessing.value = true;
    error.value = null;

    try {
      const formData = new FormData();
      formData.append('video', videoFile);

      const response = await fetch('/api/recognize-subtitles', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('字幕识别失败');
      }

      const data = await response.json();
      return data.subtitles;
    } catch (e: any) {
      error.value = e.message;
      return [];
    } finally {
      isProcessing.value = false;
    }
  };

  const generateSubtitles = (results: TranscriptionResult[], duration: number) => {
    return results.map((result, index) => ({
      id: `subtitle-${index}`,
      startTime: result.startTime,
      endTime: result.endTime,
      text: result.text,
      translation: ''
    }));
  };

  return {
    isProcessing,
    error,
    recognizeSubtitles,
    generateSubtitles
  };
}
