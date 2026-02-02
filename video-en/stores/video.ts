export interface Subtitle {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
  translation?: string;
}

export interface Video {
  id: string;
  name: string;
  filePath: string;
  thumbnail?: string;
  duration: number;
  subtitles: Subtitle[];
  createdAt: Date;
}

export interface Note {
  id: string;
  videoId: string;
  subtitleId?: string;
  content: string;
  isVoice: boolean;
  voiceUrl?: string;
  timestamp: Date;
}

export const useVideoStore = defineStore('video', {
  state: () => ({
    videos: [] as Video[],
    currentVideoId: null as string | null,
    notes: [] as Note[],
    isSidebarOpen: true
  }),

  getters: {
    currentVideo: (state) => state.videos.find(v => v.id === state.currentVideoId),
    currentNotes: (state) => state.notes.filter(n => n.videoId === state.currentVideoId)
  },

  actions: {
    addVideo(video: Video) {
      this.videos.push(video);
      if (!this.currentVideoId) {
        this.currentVideoId = video.id;
      }
    },

    removeVideo(id: string) {
      const index = this.videos.findIndex(v => v.id === id);
      if (index > -1) {
        this.videos.splice(index, 1);
        this.notes = this.notes.filter(n => n.videoId !== id);
        if (this.currentVideoId === id) {
          this.currentVideoId = this.videos[0]?.id || null;
        }
      }
    },

    selectVideo(id: string) {
      this.currentVideoId = id;
    },

    addSubtitles(videoId: string, subtitles: Subtitle[]) {
      const video = this.videos.find(v => v.id === videoId);
      if (video) {
        video.subtitles = subtitles;
      }
    },

    addNote(note: Note) {
      this.notes.push(note);
    },

    toggleSidebar() {
      this.isSidebarOpen = !this.isSidebarOpen;
    }
  },

  persist: true
})
