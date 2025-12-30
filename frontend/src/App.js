import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Sparkles, FileText, ExternalLink } from 'lucide-react';
import './App.css';

function App() {
  const [articles, setArticles] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/articles');
      setArticles(res.data);
    } catch (err) {
      console.error("Backend connection failed", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // 5 sec mein auto-refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <header>
        <h1>BeyondChats <span style={{color: '#2563eb'}}>AI Content Manager</span></h1>
        <p>Automated Research & Article Enhancement Dashboard</p>
      </header>

      <div className="grid">
        {articles.map((art) => (
          <div key={art.id} className="card">
            <div className={`badge ${art.is_updated ? 'badge-updated' : 'badge-pending'}`}>
              {art.is_updated ? <><Sparkles size={14} style={{marginRight: 4}}/> AI Updated</> : <><FileText size={14} style={{marginRight: 4}}/> Original Text</>}
            </div>
            
            <h2>{art.title}</h2>
            <p>{art.content.substring(0, 250)}...</p>

            {art.source_links && art.source_links.length > 0 && (
              <div className="footer-links">
                <strong>Verified Sources:</strong>
                {art.source_links.map((link, index) => (
                  <a key={index} href={link} target="_blank" rel="noreferrer" className="source-link">
                    <ExternalLink size={12} style={{marginRight: 4, display: 'inline'}}/> 
                    Reference {index + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;