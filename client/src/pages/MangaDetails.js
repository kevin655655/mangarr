import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMangaDetails, getProxiedImageUrl } from '../services/api';

function MangaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [manga, setManga] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [copiedText, setCopiedText] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const descRef = useRef(null);

  useEffect(() => {
    loadMangaDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadMangaDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMangaDetails(id);
      setManga(res.data.manga);
    } catch (err) {
      console.error('Failed to load manga details:', err);
      setError('Failed to load manga details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'ongoing': return 'status-ongoing';
      case 'completed': return 'status-completed';
      case 'hiatus': return 'status-hiatus';
      case 'cancelled':
      case 'dropped': return 'status-dropped';
      default: return 'status-unknown';
    }
  };

  const getContentRatingClass = (rating) => {
    switch (rating?.toLowerCase()) {
      case 'safe': return 'rating-safe';
      case 'suggestive': return 'rating-suggestive';
      case 'erotica': return 'rating-erotica';
      case 'pornographic': return 'rating-pornographic';
      default: return 'rating-unknown';
    }
  };

  const getDemographicLabel = (demo) => {
    const labels = {
      'shounen': 'Shounen',
      'shoujo': 'Shoujo',
      'seinen': 'Seinen',
      'josei': 'Josei'
    };
    return labels[demo?.toLowerCase()] || demo || 'Unknown';
  };

  const getExternalLinkIcon = (type) => {
    switch (type) {
      case 'anilist': return '🌸';
      case 'mal': return '📋';
      case 'official': return '🌐';
      case 'raw': return '📖';
      case 'englishLicense': return '🇺🇸';
      default: return '🔗';
    }
  };

  const getExternalLinkLabel = (type) => {
    switch (type) {
      case 'anilist': return 'AniList';
      case 'mal': return 'MyAnimeList';
      case 'official': return 'Official Website';
      case 'raw': return 'Raw Source';
      case 'englishLicense': return 'English License';
      default: return type;
    }
  };

  const getRelationLabel = (relation) => {
    const labels = {
      'prequel': 'Prequel',
      'sequel': 'Sequel',
      'spin-off': 'Spin-off',
      'side-story': 'Side Story',
      'alternate-story': 'Alternate Story',
      'adaptation': 'Adaptation',
      'parent': 'Parent Story',
      'same-franchise': 'Same Franchise'
    };
    return labels[relation?.toLowerCase()] || relation || 'Related';
  };

  const isDescriptionLong = () => {
    if (!manga?.description) return false;
    return manga.description.length > 300;
  };

  const renderDescription = () => {
    if (!manga?.description) return <p className="no-data">No description available.</p>;
    
    const shouldTruncate = isDescriptionLong() && !descExpanded;
    const displayText = shouldTruncate 
      ? manga.description.slice(0, 300) + '...'
      : manga.description;

    return (
      <div className="description-section">
        <div 
          className="description-text"
          ref={descRef}
          dangerouslySetInnerHTML={{ 
            __html: displayText
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/\n/g, '<br/>')
          }}
        />
        {isDescriptionLong() && (
          <button 
            className="btn-expand-desc"
            onClick={() => setDescExpanded(!descExpanded)}
          >
            {descExpanded ? 'Show Less ▲' : 'Show More ▼'}
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="manga-details-page">
        <div className="details-skeleton">
          <div className="skeleton-cover"></div>
          <div className="skeleton-info">
            <div className="skeleton-title"></div>
            <div className="skeleton-meta"></div>
            <div className="skeleton-meta"></div>
            <div className="skeleton-desc"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="manga-details-page">
        <div className="error-state">
          <div className="icon">⚠️</div>
          <h3>Error</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={loadMangaDetails}>Retry</button>
        </div>
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="manga-details-page">
        <div className="empty-state">
          <div className="icon">📚</div>
          <h3>Manga not found</h3>
          <button className="btn-primary" onClick={() => navigate('/search')}>
            Search for Manga
          </button>
        </div>
      </div>
    );
  }

  const links = manga.enrichedLinks || manga.externalLinks || {};
  const related = manga.relatedContent || {
    relatedManga: manga.relatedManga || [],
    recommendations: manga.recommendations || [],
    sameAuthorWorks: manga.sameAuthorWorks || []
  };

  return (
    <div className="manga-details-page">
      {/* Header with cover and basic info */}
      <div className="details-header">
        <div className="cover-section">
          <img
            src={getProxiedImageUrl(manga.coverUrl || manga.cover_url) || 'https://picsum.photos/seed/nocover/300/450'}
            alt={manga.title}
            className="details-cover"
            onError={(e) => { e.target.src = 'https://picsum.photos/seed/nocover/300/450'; }}
          />
          {manga.rating && (
            <div className="rating-badge">
              ⭐ {manga.rating}
            </div>
          )}
        </div>

        <div className="info-section">
          <h1 className="manga-title">{manga.title}</h1>
          
          {manga.altTitles?.length > 0 && (
            <div className="alt-titles">
              {manga.altTitles.slice(0, 3).map((alt, i) => (
                <span key={i} className="alt-title">
                  {alt}
                  <button 
                    className="btn-copy"
                    onClick={() => handleCopy(alt, `alt-${i}`)}
                    title="Copy title"
                  >
                    {copiedText === `alt-${i}` ? '✓' : '📋'}
                  </button>
                </span>
              ))}
              {manga.altTitles.length > 3 && (
                <span className="alt-title-more">+{manga.altTitles.length - 3} more</span>
              )}
            </div>
          )}

          <div className="status-row">
            <span className={`status-badge ${getStatusClass(manga.status)}`}>
              {manga.status || 'Unknown'}
            </span>
            {manga.contentRating && manga.contentRating !== 'unknown' && (
              <span className={`content-rating ${getContentRatingClass(manga.contentRating)}`}>
                {manga.contentRating}
              </span>
            )}
            {manga.demographic && (
              <span className="demographic-badge">
                {getDemographicLabel(manga.demographic)}
              </span>
            )}
            {manga.year && (
              <span className="year-badge">{manga.year}</span>
            )}
          </div>

          <div className="stats-row">
            {manga.chaptersCount > 0 && (
              <div className="stat-item">
                <span className="stat-value">{manga.chaptersCount}</span>
                <span className="stat-label">Chapters</span>
              </div>
            )}
            {manga.volumesCount > 0 && (
              <div className="stat-item">
                <span className="stat-value">{manga.volumesCount}</span>
                <span className="stat-label">Volumes</span>
              </div>
            )}
            {manga.followsCount > 0 && (
              <div className="stat-item">
                <span className="stat-value">{formatNumber(manga.followsCount)}</span>
                <span className="stat-label">Follows</span>
              </div>
            )}
            {manga.viewsCount > 0 && (
              <div className="stat-item">
                <span className="stat-value">{formatNumber(manga.viewsCount)}</span>
                <span className="stat-label">Views</span>
              </div>
            )}
          </div>

          {manga.lastUpdated && (
            <div className="last-updated">
              Last updated: {formatDate(manga.lastUpdated)}
            </div>
          )}

          {/* External Links */}
          {Object.keys(links).length > 0 && (
            <div className="external-links">
              {Object.entries(links).map(([type, url]) => (
                <a
                  key={type}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="external-link"
                >
                  <span className="link-icon">{getExternalLinkIcon(type)}</span>
                  <span className="link-label">{getExternalLinkLabel(type)}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="details-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'chapters' ? 'active' : ''}`}
          onClick={() => setActiveTab('chapters')}
        >
          Chapters ({manga.chapters?.length || 0})
        </button>
        {(related.relatedManga?.length > 0 || related.recommendations?.length > 0 || related.sameAuthorWorks?.length > 0) && (
          <button 
            className={`tab-btn ${activeTab === 'related' ? 'active' : ''}`}
            onClick={() => setActiveTab('related')}
          >
            Related
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Description */}
            <section className="detail-section">
              <h3>Description</h3>
              {renderDescription()}
            </section>

            {/* Metadata Grid */}
            <section className="detail-section">
              <h3>Information</h3>
              <div className="metadata-grid">
                {manga.authors?.length > 0 && (
                  <div className="meta-item">
                    <span className="meta-label">Author(s)</span>
                    <span className="meta-value">{manga.authors.join(', ')}</span>
                  </div>
                )}
                {manga.artists?.length > 0 && (
                  <div className="meta-item">
                    <span className="meta-label">Artist(s)</span>
                    <span className="meta-value">{manga.artists.join(', ')}</span>
                  </div>
                )}
                {manga.publisher && (
                  <div className="meta-item">
                    <span className="meta-label">Publisher</span>
                    <span className="meta-value">{manga.publisher}</span>
                  </div>
                )}
                {manga.magazine && (
                  <div className="meta-item">
                    <span className="meta-label">Magazine</span>
                    <span className="meta-value">{manga.magazine}</span>
                  </div>
                )}
                {manga.originalLanguage && (
                  <div className="meta-item">
                    <span className="meta-label">Original Language</span>
                    <span className="meta-value">{manga.originalLanguage.toUpperCase()}</span>
                  </div>
                )}
                {manga.year && (
                  <div className="meta-item">
                    <span className="meta-label">Year</span>
                    <span className="meta-value">{manga.year}</span>
                  </div>
                )}
                {manga.status && (
                  <div className="meta-item">
                    <span className="meta-label">Status</span>
                    <span className="meta-value capitalize">{manga.status}</span>
                  </div>
                )}
                {manga.contentRating && manga.contentRating !== 'unknown' && (
                  <div className="meta-item">
                    <span className="meta-label">Content Rating</span>
                    <span className="meta-value capitalize">{manga.contentRating}</span>
                  </div>
                )}
                {manga.demographic && (
                  <div className="meta-item">
                    <span className="meta-label">Demographic</span>
                    <span className="meta-value">{getDemographicLabel(manga.demographic)}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Tags/Genres */}
            {(manga.tags?.length > 0 || manga.genres?.length > 0) && (
              <section className="detail-section">
                <h3>Tags & Genres</h3>
                <div className="tag-chips">
                  {(manga.tags || manga.genres || []).map((tag, i) => {
                    const tagName = typeof tag === 'string' ? tag : tag.name;
                    const tagColor = typeof tag === 'string' ? null : tag.color;
                    return (
                      <span 
                        key={i} 
                        className="tag-chip"
                        style={tagColor ? { 
                          backgroundColor: tagColor + '20',
                          borderColor: tagColor,
                          color: tagColor 
                        } : {}}
                      >
                        {tagName}
                      </span>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'chapters' && (
          <div className="chapters-tab">
            {manga.chapters?.length > 0 ? (
              <div className="chapters-list">
                {manga.chapters.map((chapter, i) => (
                  <div key={i} className="chapter-item">
                    <span className="chapter-number">Ch. {chapter.number}</span>
                    <span className="chapter-title">{chapter.title}</span>
                    {chapter.volume && (
                      <span className="chapter-volume">Vol. {chapter.volume}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No chapters available.</p>
            )}
          </div>
        )}

        {activeTab === 'related' && (
          <div className="related-tab">
            {related.relatedManga?.length > 0 && (
              <section className="detail-section">
                <h3>Related Manga</h3>
                <div className="related-grid">
                  {related.relatedManga.map((item, i) => (
                    <div key={i} className="related-card">
                      <span className="related-title">{item.title}</span>
                      <span className="related-relation">{getRelationLabel(item.relation)}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {related.recommendations?.length > 0 && (
              <section className="detail-section">
                <h3>Recommendations</h3>
                <div className="related-grid">
                  {related.recommendations.map((item, i) => (
                    <div key={i} className="related-card">
                      <span className="related-title">{item.title}</span>
                      {item.reason && <span className="related-reason">{item.reason}</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {related.sameAuthorWorks?.length > 0 && (
              <section className="detail-section">
                <h3>More by Same Author</h3>
                <div className="related-grid">
                  {related.sameAuthorWorks.map((item, i) => (
                    <div key={i} className="related-card">
                      <span className="related-title">{item.title}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MangaDetails;
