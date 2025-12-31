import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, FileText, RefreshCw, Eye, Globe } from 'lucide-react';
import './App.css';

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState({}); // false = AI View, true = Original View

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/articles');
      setArticles(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Backend connection failed", error);
      setLoading(false);
    }
  };

  const toggleView = (id) => {
    setViewMode(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  if (loading) return (
    <div className="loader">
      <RefreshCw className="spin" size={48} />
      <p>Loading Dashboard...</p>
    </div>
  );

  return (
    <div className="container">
      <header>
        <div className="logo-section">
          <h1>BeyondChats <span>AI Manager</span></h1>
          <p>Automated Research & Content Enhancement [Phase 3 Ready]</p>
        </div>
      </header>

      <div className="grid">
        {articles.map((article) => {
          const hasBeenUpdated = article.is_updated;
          const showOriginal = viewMode[article.id]; // Tracks toggle state

          return (
            <div key={article.id} className={`card ${hasBeenUpdated ? 'border-ai' : ''}`}>
              
              <div className="card-header">
                {/* 1. Conditional Badge: AI Enhanced vs Original Data */}
                {hasBeenUpdated ? (
                  <>
                    <span className="badge ai-badge"><Sparkles size={14} /> AI Enhanced</span>
                    {/* 2. Conditional Toggle: Only show if article is updated */}
                    <button className="toggle-btn" onClick={() => toggleView(article.id)}>
                      {showOriginal ? <><Sparkles size={14}/> Show AI Version</> : <><Eye size={14}/> Show Original</>}
                    </button>
                  </>
                ) : (
                  <span className="badge original-badge"><FileText size={14} /> Original Data</span>
                )}
              </div>

              <h3 className="title">{article.title}</h3>

              <div className="content-area">
                {/* 3. Logic: If NOT updated OR toggle is on 'Original', show Original Content */}
                {(!hasBeenUpdated || showOriginal) ? (
                  <div className="text-original">
                    <span className="label">ORIGINAL VERSION:</span>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{article.original_content || article.content}</p>
                  </div>
                ) : (
                  <div className="text-ai">
                    <span className="label">AI UPDATED VERSION:</span>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{article.content}</p>
                  </div>
                )}
              </div>

              {/* 4. Citations: Only show if updated and links exist */}
              {hasBeenUpdated && article.source_links && article.source_links.length > 0 && (
                <div className="footer">
                  <h4><Globe size={14} /> Verified References:</h4>
                  <div className="links">
                    {article.source_links.map((link, index) => (
                      <a key={index} href={link} target="_blank" rel="noreferrer">
                        Source {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;