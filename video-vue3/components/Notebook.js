import { useState, useRef, useEffect } from 'react';

export default function Notebook({ notebook, onVideoSeek }) {
  const [notes, setNotes] = useState(notebook?.notes || []);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [playingNoteId, setPlayingNoteId] = useState(null);
  const audioRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingTimerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (notebook?.notes) {
      setNotes(notebook.notes);
    }
  }, [notebook]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= 60) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('无法访问麦克风，请确保已授予权限');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(recordingTimerRef.current);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!inputText.trim() && !audioUrl) return;
    
    try {
      const formData = new FormData();
      formData.append('notebook_id', notebook.id);
      formData.append('content', inputText);
      
      if (audioUrl) {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        formData.append('audio', blob, 'recording.webm');
      }
      
      const uploadRes = await fetch('/api/upload/audio', {
        method: 'POST',
        body: formData,
      });
      
      let audioResult = null;
      if (audioUrl) {
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          audioResult = uploadData.data;
        }
      }
      
      const noteRes = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebook_id: notebook.id,
          content: inputText,
          audio_url: audioResult?.url || null,
          audio_duration: audioResult?.duration || recordingDuration,
        }),
      });
      
      const noteData = await noteRes.json();
      
      if (noteData.success) {
        setNotes([...notes, noteData.data]);
        setInputText('');
        setAudioUrl(null);
        setRecordingDuration(0);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleNoteAudio = (note) => {
    if (!note.audio_url) return;
    
    if (playingNoteId === note.id) {
      audioRef.current?.pause();
      setPlayingNoteId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = note.audio_url;
        audioRef.current.play();
        setPlayingNoteId(note.id);
      }
    }
  };

  const handleAudioEnded = () => {
    setPlayingNoteId(null);
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const res = await fetch(`/api/notes/${noteId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setNotes(notes.filter(n => n.id !== noteId));
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
    }
  };

  return (
    <>
      <audio ref={audioRef} onEnded={handleAudioEnded} />
      
      <div className="notebook-header">
        <h1 className="notebook-title">{notebook?.title || '我的笔记本'}</h1>
        <span style={{ fontSize: '14px', color: '#999' }}>
          {notes.length} 条笔记
        </span>
      </div>
      
      <div className="notebook-content">
        {notes.length === 0 ? (
          <div className="placeholder-text">
            还没有笔记，开始记录你的学习内容吧
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="note-item">
              {note.timestamp > 0 && (
                <span 
                  className="note-timestamp"
                  onClick={() => onVideoSeek && onVideoSeek(note.timestamp)}
                >
                  {formatDuration(note.timestamp)}
                </span>
              )}
              
              {note.content && (
                <div className="note-text">{note.content}</div>
              )}
              
              {note.audio_url && (
                <div 
                  className="note-audio"
                  onClick={() => toggleNoteAudio(note)}
                >
                  {playingNoteId === note.id ? (
                    <svg className="pause-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg className="play-icon" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                  <span className="audio-duration">{formatDuration(note.audio_duration)}</span>
                </div>
              )}
              
              <button
                onClick={() => handleDeleteNote(note.id)}
                style={{
                  marginTop: '8px',
                  padding: '4px 8px',
                  fontSize: '12px',
                  background: 'none',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                删除
              </button>
            </div>
          ))
        )}
      </div>
      
      <div className="input-area">
        {audioUrl && (
          <div style={{ 
            marginBottom: '12px', 
            padding: '8px 12px', 
            background: '#f0f7ff', 
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg className="play-icon" viewBox="0 0 24 24" fill="#007AFF" style={{ width: '16px', height: '16px' }}>
                <path d="M8 5v14l11-7z"/>
              </svg>
              <span style={{ fontSize: '13px', color: '#333' }}>录音 {formatDuration(recordingDuration)}</span>
            </div>
            <button 
              onClick={() => setAudioUrl(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
            >
              ✕
            </button>
          </div>
        )}
        
        <div className="input-row">
          <button
            className={`record-btn ${isRecording ? 'recording' : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            title={isRecording ? '停止录音' : '开始录音'}
          >
            {isRecording ? (
              <svg className="stop-icon" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}>
                <rect x="6" y="6" width="12" height="12"/>
              </svg>
            ) : (
              <svg className="record-icon" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}>
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            )}
          </button>
          
          <textarea
            ref={inputRef}
            className="text-input"
            placeholder={isRecording ? '录音中...' : '输入你的学习笔记...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRecording}
            rows={1}
            style={{ resize: 'none', minHeight: '44px' }}
          />
          
          <button 
            className="send-btn"
            onClick={handleSend}
            disabled={!inputText.trim() && !audioUrl}
            title="发送"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}>
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
