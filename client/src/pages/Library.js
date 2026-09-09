import React, { useEffect, useState } from 'react';
import { getLibrary, removeFromLibrary, getProxiedImageUrl } from '../services/api';

function Library() {
  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    try {
      const res = await getLibrary();
      setLibrary(res.data.library || []);
    } catch (err) {
      console.error('Failed to load library:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this manga from your library?')) return;
    try {
      await removeFromLibrary(id);
      setLibrary(library.filter(m => m.id !== id));
    } catch (err) {
      console.error('Failed to remove:', err);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'ongoing': return 'status-ongoing';
      case 'completed': return 'status-completed';
      default: return 'status-unknown';
    }
  };

  if (loading) {
    return <div className="empty-state"><p>Loading library...</p></div>;
  }

  if (library.length === 0) {
    return (
      <div className="empty-state">
        <div className="icon">📚</div>
        <h3>Your library is empty</h3>
        <p>Search for manga to add them to your library.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>Library</h2>
        <p>{library.length} manga in your collection</p>
      </div>
      <div className="card-grid">
        {library.map(manga => (
          <div key={manga.id} className="manga-card">
            <img
              src={getProxiedImageUrl(manga.cover_url) || 'https://picsum.photos/seed/nocover/300/450'}
              alt={manga.title}
              className="cover"
              onError={(e) => { e.target.src = 'https://picsum.photos/seed/nocover/300/450'; }}
            />
            <div className="info">
              <h3>{manga.title}</h3>
              <div className="meta">
                {manga.chapters_count} chapters
              </div>
              <span className={`status ${getStatusClass(manga.status)}`}>
                {manga.status || 'Unknown'}
              </span>
              <button className="btn-remove" onClick={() => handleRemove(manga.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Library;
