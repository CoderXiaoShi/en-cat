import { useState, useRef, useEffect } from 'react';

export default function VideoPlayer({ video, onSeek }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitles, setSubtitles] = useState([]);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);

  useEffect(() => {
    if (video?.subtitle_url) {
      fetchSubtitles(video.subtitle_url);
    }
  }, [video]);

  async function fetchSubtitles(url) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const parsed = parseVTT(text);
      setSubtitles(parsed);
    } catch (error) {
      console.error('Failed to load subtitles:', error);
    }
  }

  function parseVTT(vttText) {
    const lines = vttText.split('\n');
    const cues = [];
    let currentCue = null;

    for (const line of lines) {
      const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
      if (timeMatch) {
        if (currentCue) cues.push(currentCue);
        currentCue = {
          start: timeToSeconds(timeMatch[1]),
          end: timeToSeconds(timeMatch[2]),
          text: ''
        };
      } else if (currentCue && line.trim() && !line.includes('WEBVTT')) {
        currentCue.text += (currentCue.text ? '\n' : '') + line.trim();
      }
    }
    if (currentCue) cues.push(currentCue);
    return cues;
  }

  function timeToSeconds(time) {
    const [hours, minutes, seconds] = time.split(':');
    return parseFloat(hours) * 3600 + parseFloat(minutes) * 60 + parseFloat(seconds);
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateSubtitles = () => {
      const currentTime = video.currentTime;
      const activeCue = subtitles.find(
        cue => currentTime >= cue.start && currentTime <= cue.end
      );
      setCurrentSubtitle(activeCue?.text || '');
    };

    video.addEventListener('timeupdate', updateSubtitles);
    return () => video.removeEventListener('timeupdate', updateSubtitles);
  }, [subtitles]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const handleVideoClick = () => {
    if (!isDragging) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragPosition(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !videoRef.current) return;
    const delta = e.clientX - dragPosition;
    const videoDuration = videoRef.current.duration || 1;
    const seekAmount = (delta / window.innerWidth) * videoDuration * 2;
    videoRef.current.currentTime = Math.max(0, Math.min(
      videoRef.current.currentTime + seekAmount,
      videoDuration
    ));
    setDragPosition(e.clientX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleSubtitles = () => {
    setShowSubtitles(!showSubtitles);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      ref={containerRef}
      className="video-container"
      onClick={handleVideoClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
    >
      <video
        ref={videoRef}
        className="video-player"
        src={video?.url}
        loop
        playsInline
        onClick={(e) => e.stopPropagation()}
      />
      
      {showSubtitles && currentSubtitle && (
        <div className="cc-active">{currentSubtitle}</div>
      )}
      
      <div className="toolbar">
        <button 
          className={`tool-btn ${showSubtitles ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleSubtitles(); }}
          title={showSubtitles ? '隐藏字幕' : '显示字幕'}
        >
          <svg className="cc-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"/>
          </svg>
        </button>
      </div>
      
      {isDragging && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.7)',
          padding: '8px 16px',
          borderRadius: '4px',
          color: 'white',
          fontSize: '14px'
        }}>
          {formatTime(videoRef.current?.currentTime || 0)}
        </div>
      )}
    </div>
  );
}
