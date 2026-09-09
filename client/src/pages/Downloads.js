import React, { useEffect, useState } from 'react';
import { getDownloads } from '../services/api';

function Downloads() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      const res = await getDownloads();
      setDownloads(res.data.downloads || []);
    } catch (err) {
      console.error('Failed to load downloads:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'downloading': return 'status-downloading';
      case 'completed': return 'status-completed';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return <div className="empty-state"><p>Loading downloads...</p></div>;
  }

  if (downloads.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">⬇️</div>
        <h3>No downloads</h3>
        <p>Downloads will appear here when you queue chapters.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Downloads</h2>
        <p>{downloads.length} item(s) in queue</p>
      </div>
      <div>
        {downloads.map(dl => (
          <div key={dl.id} className="download-item">
            <img
              src={dl.cover_url || 'https://via.placeholder.com/50x75/252542/666?text=?'}
              alt={dl.manga_title}
            />
            <div className="details">
              <h4>{dl.manga_title}</h4>
              <p>
                {dl.chapter_title
                  ? `Chapter ${dl.chapter_number}: ${dl.chapter_title}`
                  : `Chapter ${dl.chapter_number || 'N/A'}`}
              </p>
              {dl.progress > 0 && (
                <p>Progress: {dl.progress}%</p>
              )}
            </div>
            <span className={`status-badge ${getStatusClass(dl.status)}`}>
              {dl.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Downloads;
