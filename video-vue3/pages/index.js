import { useState, useEffect } from 'react';
import Head from 'next/head';
import VideoPlayer from '../components/VideoPlayer';
import Notebook from '../components/Notebook';

export default function Home() {
  const [video, setVideo] = useState(null);
  const [notebook, setNotebook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [videosRes, notebooksRes] = await Promise.all([
          fetch('/api/videos'),
          fetch('/api/notebooks'),
        ]);
        
        const videosData = await videosRes.json();
        const notebooksData = await notebooksRes.json();
        
        if (videosData.success && videosData.data.length > 0) {
          setVideo(videosData.data[0]);
        }
        
        if (notebooksData.success && notebooksData.data.length > 0) {
          setNotebook(notebooksData.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  const handleVideoSeek = (time) => {
    console.log('Seek to:', time);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#1a1a1a',
        color: '#fff'
      }}>
        加载中...
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>AI英语学习 - Video Notebook</title>
        <meta name="description" content="AI英语学习软件 - 视频+笔记本" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="app-container">
        <section className="video-section">
          {video && (
            <VideoPlayer 
              video={video} 
              onSeek={handleVideoSeek}
            />
          )}
        </section>
        
        <section className="notebook-section">
          {notebook && (
            <Notebook 
              notebook={notebook}
              onVideoSeek={handleVideoSeek}
            />
          )}
        </section>
      </div>
    </>
  );
}
