import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-main">
      <div className="section-container" style={{ padding: '0 20px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
          
          <div>
            <div className="navbar-logo" style={{ color: '#fff', marginBottom: '20px' }}>
              <MapPin size={24} style={{ color: '#22c55e' }} />
              DEMBENI
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Hôtel de Ville de Dembéni<br />
              97660 Dembéni, Mayotte<br /><br />
              <Phone size={14} /> 02 69 61 11 00
            </p>
          </div>

          <div>
            <h4 style={{ fontWeight: 800, marginBottom: '20px' }}>Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="/" style={{ color: '#64748b', fontSize: '0.9rem' }}>Accueil</Link></li>
              <li><Link to="/demarches" style={{ color: '#64748b', fontSize: '0.9rem' }}>Démarches</Link></li>
              <li><Link to="/projet" style={{ color: '#64748b', fontSize: '0.9rem' }}>Projet</Link></li>
              <li><Link to="/contact" style={{ color: '#64748b', fontSize: '0.9rem' }}>Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontWeight: 800, marginBottom: '20px' }}>Légal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li><Link to="#" style={{ color: '#64748b', fontSize: '0.9rem' }}>Mentions légales</Link></li>
              <li><Link to="#" style={{ color: '#64748b', fontSize: '0.9rem' }}>Confidentialité</Link></li>
              <li><Link to="#" style={{ color: '#64748b', fontSize: '0.9rem' }}>Cookies</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontWeight: 800, marginBottom: '20px' }}>Suivez-nous</h4>
            <div style={{ display: 'flex', gap: '15px' }}>
               <Facebook size={20} style={{ color: '#64748b' }} />
               <Twitter size={20} style={{ color: '#64748b' }} />
               <Instagram size={20} style={{ color: '#64748b' }} />
            </div>
          </div>

        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '40px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#475569', fontSize: '0.8rem' }}>
        © 2026 Mairie de Dembéni — Tous droits réservés.
      </div>
    </footer>
  );
};

export default Footer;
