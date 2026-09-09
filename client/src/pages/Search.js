import React, { useState } from 'react';
import { searchManga, addToLibrary, getProxiedImageUrl } from '../services/api';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await searchManga(query);
      setResults(res.data.results || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (manga) => {
    try {
      await addToLibrary({
        mangabaka_id: manga.id,
        title: manga.title,
        alt_titles: manga.altTitles || manga.alt_titles,
        description: manga.description,
        cover_url: manga.coverUrl || manga.cover_url,
        status: manga.status,
        year: manga.year,
        authors: manga.authors,
        artists: manga.artists,
        genres: manga.genres,
        chapters_count: manga.chaptersCount || manga.chapters_count
      });
      setAddedIds(new Set([...addedIds, manga.id]));
    } catch (err) {
      console.error('Failed to add:', err);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'ongoing': return 'status-ongoing';
      case 'completed': return 'status-completed';
      default: return 'status-unknown';
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Add Manga</h2>
        <p>Search Mangabaka to find and add manga to your library.</p>
      </div>
      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for manga..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {results.length > 0 && (
        <div className="card-grid">
          {results.map(manga => (
            <div key={manga.id} className="manga-card">
              <img
                src={getProxiedImageUrl(manga.coverUrl || manga.cover_url) || 'https://picsum.photos/seed/nocover/300/450'}
                alt={manga.title}
                className="cover"
                onError={(e) => { e.target.src = 'https://picsum.photos/seed/nocover/300/450'; }}
              />
              <div className="info">
                <h3>{manga.title}</h3>
                <div className="meta">
                  {manga.chaptersCount || manga.chapters_count || '?'} chapters
                </div>
                <span className={`status ${getStatusClass(manga.status)}`}>
                  {manga.status || 'Unknown'}
                </span>
                <button
                  className="btn-add"
                  onClick={() => handleAdd(manga)}
                  disabled={addedIds.has(manga.id)}
                >
                  {addedIds.has(manga.id) ? 'Added' : 'Add to Library'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && query && (
        <div className="empty-state">
          <p>No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}

export default Search;
