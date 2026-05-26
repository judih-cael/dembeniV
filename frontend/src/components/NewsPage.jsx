import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, ArrowRight, Info, X } from 'lucide-react';

const NewsPage = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedNews, setSelectedNews] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:4000/api/publications?status=published')
      .then(res => {
        // Fetch all published publications, then prioritize news/actualites/annonces
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          const filteredNews = res.data.data.filter(pub => pub.type !== 'evenement');
          setNews(filteredNews);
        } else {
          setNews([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération des actualités CMS:", err);
        setLoading(false);
      });
  }, []);

  const filtered = news.filter(n => 
    (n.title || n.titre || '').toLowerCase().includes(search.toLowerCase()) ||
    (n.category || n.categorie || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-page">
      {/* Hero */}
      <section className="h-page__hero">
        <div className="h-container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="h-title h-title--white">Actualités de la Ville</h1>
            <p className="h-subtitle h-subtitle--muted">Suivez toute l'actualité, les projets et les événements de Dembéni.</p>
          </motion.div>
        </div>
      </section>

      {/* Search & Content */}
      <section className="h-page__content">
        <div className="h-container">
          
          <div className="h-admin__search-wrap" style={{ maxWidth: '600px', margin: '0 auto 4rem' }}>
            <Search className="h-admin__search-icon" size={20} />
            <input 
              type="text" 
              className="h-admin__search-input"
              placeholder="Rechercher un article ou une catégorie..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>Chargement des actualités...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--s-400)' }}>
              Aucun article ne correspond à votre recherche.
            </div>
          ) : (
            <div className="h-page__grid">
              {filtered.map((item, i) => (
                <motion.div
                  key={item._id}
                  className="h-dash__card"
                  style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedNews(item)}
                >
                  <div style={{ height: '200px', position: 'relative' }}>
                    <img src={item.image || 'https://via.placeholder.com/400x200?text=Dembeni'} alt={item.title || item.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <span className="h-cat-badge h-cat-badge--float" style={{ top: '1rem', left: '1rem' }}>{item.category || item.categorie || 'Général'}</span>
                  </div>
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--s-400)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> {new Date(item.createdAt || item.date || Date.now()).toLocaleDateString('fr-FR')}
                    </div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--s-900)' }}>{item.title || item.titre}</h3>
                    <p className="h-text" style={{ fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>{(item.content || item.contenu || '').substring(0, 120)}...</p>
                    <button className="h-btn-sm h-btn-sm--ghost" style={{ alignSelf: 'flex-start', padding: 0, color: 'var(--p-600)' }}>
                      Lire la suite <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal Detail */}
      <AnimatePresence>
        {selectedNews && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="h-auth__card" 
              style={{ maxWidth: '800px', width: '100%', background: 'white', padding: 0, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
            >
              <div style={{ position: 'relative', height: '300px', flexShrink: 0 }}>
                <img src={selectedNews.image || 'https://via.placeholder.com/400x200?text=Dembeni'} alt="hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button 
                  onClick={() => setSelectedNews(null)} 
                  style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'white', borderRadius: '50%', padding: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}
                >
                  <X size={20} />
                </button>
                <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem' }}>
                  <span className="h-badge h-badge--light">{selectedNews.category || selectedNews.categorie || 'Général'}</span>
                </div>
              </div>
              <div style={{ padding: '3rem', overflowY: 'auto', textAlign: 'left' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--s-400)', marginBottom: '1rem' }}>
                  Publié le {new Date(selectedNews.createdAt || selectedNews.date || Date.now()).toLocaleDateString('fr-FR')}
                </div>
                <h2 className="h-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>{selectedNews.title || selectedNews.titre}</h2>
                <div className="h-text" style={{ fontSize: '1.05rem', whiteSpace: 'pre-line' }}>
                  {selectedNews.content || selectedNews.contenu}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NewsPage;
