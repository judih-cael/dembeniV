import React from 'react';
import { Info, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SubPage = ({ title, subtitle, items = [] }) => {
  return (
    <div className="sub-page">
      {/* Hero */}
      <section className="hero-section" style={{ height: '400px' }}>
        <div className="hero-bg" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title" style={{ fontSize: '3rem' }}>{title}</h1>
          <p className="hero-desc">{subtitle}</p>
        </div>
      </section>

      {/* Content */}
      <section className="section-container">
        {items.length > 0 ? (
          <div className="cards-grid">
            {items.map((item, i) => (
              <div key={i} className="feature-card">
                <div className="card-icon">{item.icon}</div>
                <h3 className="card-title">{item.title}</h3>
                <p className="card-desc">{item.description}</p>
                <div className="card-arrow"><ArrowRight size={16} /></div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#64748b' }}>
            <Info size={48} style={{ margin: '0 auto 20px', opacity: 0.2 }} />
            <p>Le contenu de cette section est en cours de mise à jour.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default SubPage;
