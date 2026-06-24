import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogOut, FileText, Download, CheckCircle, File, User as UserIcon, 
  Bell, Settings, Plus, Send, RefreshCw, MapPin, Phone, Mail, Clock, 
  ShieldCheck, AlertTriangle, Search, Filter, ArrowUpRight, HelpCircle, 
  FileCheck, Shield, ChevronRight, X, Calendar, MessageSquare, AlertCircle, Eye, EyeOff,
  BarChart, Activity
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UserDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Lists Data
  const [demandes, setDemandes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Modal / Interaction States
  const [modalOpen, setModalOpen] = useState(null); // 'new_demande' | 'contact_mairie' | 'take_rdv' | 'report_issue' | 'doc_preview'
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [newDemande, setNewDemande] = useState({ title: '', description: '', type: 'Acte de naissance' });
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [rdvForm, setRdvForm] = useState({ service: 'État Civil', date: '', time: '' });
  const [issueForm, setIssueForm] = useState({ category: 'Voirie', description: '', location: '' });

  // Custom Toast state
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts([...toasts, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Check login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Sync search parameters
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Simulate tab skeleton loading for SaaS-like premium feel
  useEffect(() => {
    setSkeletonLoading(true);
    const timer = setTimeout(() => setSkeletonLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeTab]);

  // Fetch Demands & Notifications
  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      
      const resDemandes = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/demandes`, { headers });
      setDemandes(resDemandes.data.data);

      const resNotifs = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/demandes/notifications`, { headers });
      setNotifications(resNotifs.data.data);
    } catch (err) {
      console.error('Erreur lors du chargement des données', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCreateDemande = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      await axios.post(`${import.meta.env.VITE_API_URL || ''}/api/demandes`, newDemande, { headers });
      addToast('Votre demande administrative a bien été transmise.', 'success');
      setNewDemande({ title: '', description: '', type: 'Acte de naissance' });
      setModalOpen(null);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Erreur lors de la soumission.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      await axios.put(`${import.meta.env.VITE_API_URL || ''}/api/demandes/notifications/read`, {}, { headers });
      // Refresh list locally
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Erreur', err);
    }
  };

  // Mock document items database
  const documentList = [
    { id: '1', title: 'Acte de Naissance', desc: 'Copie intégrale certifiée conforme', code: 'ACT-9032', format: 'PDF', size: '1.4 MB', date: '14/05/2026', status: 'validé', category: 'Civil' },
    { id: '2', title: 'Justificatif de Domicile', desc: 'Attestation de résidence Dembéni', code: 'DOM-1102', format: 'PDF', size: '920 KB', date: '19/05/2026', status: 'validé', category: 'Logement' },
    { id: '3', title: 'Carte Nationale d\'Identité (CNI)', desc: 'Preuve d\'identité numérisée', code: 'CNI-4428', format: 'PDF', size: '2.1 MB', date: '02/05/2026', status: 'validé', category: 'Identité' },
    { id: '4', title: 'Certificat de Non-Imposition', desc: 'Justificatif communal fiscal', code: 'FIS-9921', format: 'PDF', size: '1.1 MB', date: '22/04/2026', status: 'en attente', category: 'Fiscal' }
  ];

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Filtered requests list
  const filteredDemandes = demandes.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          d.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="citizen-portal-shell">
      
      {/* Dynamic Toast Notifications */}
      <div className="toast-portal-container">
        {toasts.map(toast => (
          <motion.div 
            key={toast.id}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`toast-capsule ${toast.type}`}
          >
            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        ))}
      </div>

      {/* MOBILE HEADER BAR */}
      <header className="mobile-portal-navbar">
        <button 
          className="mobile-sidebar-toggle"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          <div className={`bar ${mobileSidebarOpen ? 'open' : ''}`} />
          <div className={`bar ${mobileSidebarOpen ? 'open' : ''}`} />
          <div className={`bar ${mobileSidebarOpen ? 'open' : ''}`} />
        </button>
        <span className="mobile-portal-brand">DEMBÉNI CITOYEN</span>
        <button 
          onClick={() => { setActiveTab('notifications'); handleMarkAsRead(); }}
          className="mobile-portal-bell"
        >
          <Bell size={20} />
          {unreadNotifications > 0 && <span className="mobile-bell-dot" />}
        </button>
      </header>

      {/* FIXED SIDEBAR */}
      <aside className={`citizen-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand-wrapper">
          <img src="/logo_dembeni.svg" alt="Blason de Dembéni" className="sidebar-logo-img-vector" />
          <div>
            <span className="brand-main-title">DEMB<span className="accent-red">É</span>NI</span>
            <span className="brand-sub-title">ESPACE CITOYEN</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: 'dashboard', name: 'Tableau de bord', icon: <BarChart size={18} /> },
            { id: 'demarches', name: 'Mes démarches', icon: <FileText size={18} /> },
            { id: 'documents', name: 'Mes documents', icon: <FileCheck size={18} /> },
            { id: 'sante', name: 'Santé publique', icon: <Activity size={18} /> },
            { id: 'solidarite', name: 'CCAS & Solidarité', icon: <Shield size={18} /> },
            { id: 'notifications', name: 'Notifications', icon: <Bell size={18} />, badge: unreadNotifications },
            { id: 'settings', name: 'Paramètres', icon: <Settings size={18} /> }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { 
                setActiveTab(item.id); 
                setMobileSidebarOpen(false);
                setSearchParams({ tab: item.id });
              }}
              className={`sidebar-nav-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span className="item-name">{item.name}</span>
              {item.badge > 0 && (
                <span className="sidebar-badge">{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer-wrapper">
          <div className="sidebar-footer-user">
            {user?.profileImage ? (
              <img src={user.profileImage} alt={user.firstname} className="footer-user-avatar" />
            ) : (
              <div className="footer-user-avatar-placeholder">
                {user?.firstname?.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="footer-user-info">
              <span className="user-name">{user?.firstname} {user?.lastname}</span>
              <span className="user-status">Citoyen vérifié</span>
            </div>
          </div>
          
          <button onClick={handleLogout} className="btn-sidebar-logout">
            <LogOut size={16} /> Deconnexion
          </button>
        </div>
      </aside>

      {/* MAIN MAIN CONTENT CONTAINER */}
      <main className="citizen-main-area">
        
        {/* TAB HERO BANNER */}
        <section className="portal-hero-banner">
          <div className="hero-badge-wrap">
            <span className="hero-status-pill">
              <ShieldCheck size={14} /> Espace d'identité certifié
            </span>
            <span className="hero-last-login">Dernière connexion: Aujourd'hui</span>
          </div>
          <h1 className="hero-user-welcome">Bonjour, {user?.firstname} {user?.lastname}</h1>
          <p className="hero-user-intro">
            Bienvenue sur votre espace d'administration communal moderne. Effectuez vos formalités et accédez à vos pièces administratives sécurisées en quelques instants.
          </p>
        </section>

        {/* 600ms SaaS Loading Skeleton Simulation */}
        <AnimatePresence mode="wait">
          {skeletonLoading ? (
            <motion.div 
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="dashboard-skeleton-wrapper"
            >
              <div className="skeleton-grid-double">
                <div className="skeleton-item-box large" />
                <div className="skeleton-item-box small" />
              </div>
              <div className="skeleton-item-box medium" style={{ marginTop: '24px' }} />
            </motion.div>
          ) : (
            <motion.div
              key="tab-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              
              {/* TAB A: TABLEAU DE BORD (MAIN DASHBOARD) */}
              {/* TAB A: TABLEAU DE BORD (MAIN DASHBOARD) */}
              {activeTab === 'dashboard' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  
                  {/* ACTIONS RAPIDES SECTION */}
                  <div>
                    <h3 className="section-block-title" style={{ color: '#0d4a3e', fontSize: '1.1rem', fontWeight: 850, marginBottom: '14px' }}>Actions rapides</h3>
                    <div className="quick-actions-v2-grid">
                      {[
                        { title: 'Nouvelle demande', desc: 'Soumettre une formalité en ligne', icon: <Plus size={20} />, action: () => setModalOpen('new_demande') },
                        { title: 'Télécharger un document', desc: 'Accéder à vos pièces certifiées', icon: <Download size={20} />, action: () => setActiveTab('documents') },
                        { title: 'Prendre rendez-vous', desc: 'Planifier un créneau en guichet', icon: <Calendar size={20} />, action: () => setModalOpen('take_rdv') },
                        { title: 'Contacter la mairie', desc: 'Échanger avec les agents municipaux', icon: <MessageSquare size={20} />, action: () => setModalOpen('contact_mairie') }
                      ].map((act, idx) => (
                        <div key={idx} className="quick-action-card-v2" onClick={act.action}>
                          <div className="quick-action-icon-v2">{act.icon}</div>
                          <div className="quick-action-info-v2">
                            <h4>{act.title}</h4>
                            <p>{act.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* STATISTICS GRID */}
                  <div className="stats-cards-grid">
                    {[
                      { title: 'Démarches en cours', value: demandes.filter(d => d.status === 'pending').length, desc: 'En traitement à la mairie', color: 'orange', icon: <Clock size={20} /> },
                      { title: 'Démarches validées', value: demandes.filter(d => d.status === 'approved').length, desc: 'Dossiers complétés', color: 'green', icon: <CheckCircle size={20} /> },
                      { title: 'Documents enregistrés', value: documentList.length, desc: 'Pièces d\'identité & justificatifs', color: 'blue', icon: <FileCheck size={20} /> },
                      { title: 'Dernière Notification', value: unreadNotifications, desc: 'Alertes non lues', color: 'red', icon: <Bell size={20} /> },
                      { title: 'Demandes Rejetées', value: demandes.filter(d => d.status === 'rejected').length, desc: 'Dossiers non conformes', color: 'darkred', icon: <AlertTriangle size={20} /> },
                      { title: 'Temps de traitement moyen', value: '48h', desc: 'Délai d\'analyse moyen', color: 'purple', icon: <RefreshCw size={20} /> }
                    ].map((stat, idx) => (
                      <div key={idx} className="dashboard-stat-card">
                        <div className={`stat-icon-wrap ${stat.color}`}>
                          {stat.icon}
                        </div>
                        <div className="stat-data-wrap">
                          <span className="stat-number">{stat.value}</span>
                          <span className="stat-card-title">{stat.title}</span>
                          <span className="stat-card-desc">{stat.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* TWO-COLUMN GRID: DEMARCHES, DOCS & ANNOUNCEMENTS VS SIDE PANEL */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
                    
                    {/* LEFT COLUMN: DEMARCHES, DOCS, ANNOUNCEMENTS */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      
                      {/* MES DEMARCHES RECENTES (PROGRESS BARS) */}
                      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                        <h3 className="section-block-title" style={{ color: '#0d4a3e', fontSize: '1.05rem', fontWeight: 850, margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                          Mes démarches récentes
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          {[
                            { name: 'Acte de naissance', pct: 75 },
                            { name: 'Carte nationale d\'identité', pct: 100 },
                            { name: 'Certificat de résidence', pct: 40 }
                          ].map((d, i) => (
                            <div key={i} className="demarche-progress-item">
                              <div className="demarche-progress-info">
                                <span className="demarche-progress-name">{d.name}</span>
                                <span className="demarche-progress-pct">{d.pct}%</span>
                              </div>
                              <div className="demarche-progress-track">
                                <div className="demarche-progress-bar" style={{ width: `${d.pct}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* DOCUMENTS RECENTS */}
                      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                        <h3 className="section-block-title" style={{ color: '#0d4a3e', fontSize: '1.05rem', fontWeight: 850, margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                          Documents récents
                        </h3>
                        <div className="recent-docs-table-wrapper">
                          <table className="recent-docs-table">
                            <thead>
                              <tr>
                                <th>Nom du document</th>
                                <th>Date</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {documentList.slice(0, 3).map(doc => (
                                <tr key={doc.id}>
                                  <td style={{ fontWeight: 700 }}>{doc.title}</td>
                                  <td>{doc.date}</td>
                                  <td>
                                    <button 
                                      onClick={() => { setSelectedDoc(doc); setModalOpen('doc_preview'); }} 
                                      className="btn-doc-download-sm"
                                    >
                                      <Eye size={12} /> Aperçu
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* ANNONCES SANTE & CCAS */}
                      <div className="announcements-v2-grid" style={{ marginTop: '0' }}>
                        
                        {/* SANTE PUBLIQUE */}
                        <div className="announcement-card-v2">
                          <h4>🩺 Santé publique</h4>
                          <div className="announcement-list-v2">
                            {[
                              { title: 'Campagne de vaccination mobile', desc: 'Le bibliobus médical sera présent à Tsararano ce vendredi.', date: '28 Juin 2026' },
                              { title: 'Prévention contre le paludisme', desc: 'Distribution gratuite de moustiquaires imprégnées en mairie.', date: '22 Juin 2026' }
                            ].map((item, idx) => (
                              <div key={idx} className="announcement-item-v2">
                                <span className="announcement-item-title">{item.title}</span>
                                <span className="announcement-item-desc">{item.desc}</span>
                                <span className="announcement-item-date">{item.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* CCAS & SOLIDARITE */}
                        <div className="announcement-card-v2">
                          <h4>🤝 CCAS &amp; Solidarité</h4>
                          <div className="announcement-list-v2">
                            {[
                              { title: 'Aide rentrée scolaire 2026', desc: 'Dépôt des dossiers de subvention exceptionnelle ouvert.', date: 'Aujourd\'hui' },
                              { title: 'Ateliers séniors & loisirs', desc: 'Inscriptions aux activités sportives douces du trimestre.', date: '18 Juin 2026' }
                            ].map((item, idx) => (
                              <div key={idx} className="announcement-item-v2">
                                <span className="announcement-item-title">{item.title}</span>
                                <span className="announcement-item-desc">{item.desc}</span>
                                <span className="announcement-item-date">{item.date}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>

                    {/* RIGHT COLUMN: NOTIFICATIONS + PROFILE INFO */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      
                      {/* NOTIFICATIONS RECENTES */}
                      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 16px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                          <h3 className="section-block-title" style={{ color: '#0d4a3e', fontSize: '1.05rem', fontWeight: 850, margin: 0 }}>
                            Notifications récentes
                          </h3>
                          <button 
                            onClick={() => { setActiveTab('notifications'); handleMarkAsRead(); }} 
                            style={{ background: 'none', border: 'none', color: '#0EA572', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer' }}
                          >
                            Voir toutes les notifications
                          </button>
                        </div>
                        <div className="notif-shorlist-v2">
                          {notifications.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.8rem' }}>
                              Aucune notification récente
                            </div>
                          ) : (
                            notifications.slice(0, 3).map(notif => (
                              <div key={notif._id} className={`notif-item-v2 ${notif.read ? '' : 'unread'}`}>
                                <p>{notif.message}</p>
                                <span>{new Date(notif.createdAt).toLocaleDateString('fr-FR')}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* PROFILE DETAILS (EXISTING) */}
                      <div className="citizen-profile-details-card" style={{ margin: 0 }}>
                        <div className="card-header-bar-premium">
                          <UserIcon size={20} className="header-icon-active" />
                          <h3>Informations d'état civil certifiées</h3>
                        </div>
                        <div className="profile-details-layout-grid" style={{ gridTemplateColumns: '1fr', gap: '12px' }}>
                          <div className="profile-detail-cell">
                            <span className="detail-label">Nom complet</span>
                            <span className="detail-val">{user?.firstname} {user?.lastname}</span>
                          </div>
                          <div className="profile-detail-cell">
                            <span className="detail-label">Numéro Fiscal Certifié</span>
                            <span className="detail-val">9023-8821-M</span>
                          </div>
                          <div className="profile-detail-cell">
                            <span className="detail-label">Téléphone</span>
                            <span className="detail-val">{user?.phone || 'Non renseigné'}</span>
                          </div>
                          <div className="profile-detail-cell">
                            <span className="detail-label">Quartier</span>
                            <span className="detail-val">📍 {user?.quartier}</span>
                          </div>
                          <div className="profile-detail-cell">
                            <span className="detail-label">Identité numérique</span>
                            <span className="detail-val status-badge-valid">Active (Niveau 3)</span>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}


              {/* TAB B: MES DEMARCHES */}
              {activeTab === 'demarches' && (
                <div className="demarches-portal-wrapper">
                  <div className="tab-section-header">
                    <div>
                      <h2 className="tab-section-title">Suivi de vos demandes en ligne</h2>
                      <p className="tab-section-desc">Consultez l'évolution, le statut et les réponses de la mairie concernant vos dossiers.</p>
                    </div>
                    <button 
                      onClick={() => setModalOpen('new_demande')}
                      className="btn-primary-gradient"
                    >
                      <Plus size={16} /> Nouvelle démarche
                    </button>
                  </div>

                  {/* SEARCH AND FILTERS */}
                  <div className="demarches-filters-wrap">
                    <div className="search-bar-styled">
                      <Search size={16} className="search-icon" />
                      <input 
                        type="text" 
                        placeholder="Rechercher une démarche (objet, contenu, type)..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="filters-tab-buttons">
                      {[
                        { id: 'all', label: 'Toutes' },
                        { id: 'pending', label: 'En attente' },
                        { id: 'approved', label: 'Approuvées' },
                        { id: 'rejected', label: 'Rejetées' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setFilterStatus(tab.id)}
                          className={`filter-btn-tab ${filterStatus === tab.id ? 'active' : ''}`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {filteredDemandes.length === 0 ? (
                    <div className="empty-state-card">
                      <FileText size={48} className="empty-icon" />
                      <h4>Aucune démarche ne correspond à vos filtres</h4>
                      <p>Essayez de reformuler votre recherche ou soumettez un nouveau dossier administratif.</p>
                    </div>
                  ) : (
                    <div className="demarches-vertical-list">
                      {filteredDemandes.map(d => (
                        <div key={d._id} className="demande-tile-card-prem">
                          <div className="tile-main-details">
                            <div className="tile-category-row">
                              <span className="tile-type-badge">{d.type}</span>
                              <span className={`tile-status-badge ${d.status}`}>
                                {d.status === 'approved' ? 'Approuvée' : d.status === 'rejected' ? 'Refusée' : 'En instruction'}
                              </span>
                            </div>
                            <h4 className="tile-title-main">{d.title}</h4>
                            <p className="tile-desc-main">{d.description}</p>
                            
                            {d.responses && d.responses.length > 0 && (
                              <div className="tile-official-response-box">
                                {d.responses.map((res, index) => (
                                  <div key={index}>
                                    <div className="official-author">💬 Réponse officielle • {res.author}</div>
                                    <p className="official-message">{res.message}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="tile-date-sidebar">
                            <span className="tile-date-label">Date de dépôt</span>
                            <span className="tile-date-value">📅 {new Date(d.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB C: MES DOCUMENTS */}
              {activeTab === 'documents' && (
                <div className="documents-manager-wrapper">
                  <div className="tab-section-header">
                    <div>
                      <h2 className="tab-section-title">Porte-documents numérique</h2>
                      <p className="tab-section-desc">Retrouvez et téléchargez instantanément vos pièces officielles validées par la mairie de Dembéni.</p>
                    </div>
                  </div>

                  <div className="documents-cards-grid">
                    {documentList.map(doc => (
                      <div key={doc.id} className="document-card-styled">
                        <div className="doc-card-header">
                          <div className="doc-format-badge">{doc.format}</div>
                          <span className={`doc-status-badge ${doc.status}`}>{doc.status}</span>
                        </div>
                        
                        <div className="doc-card-body">
                          <FileText size={36} className="doc-icon-active" />
                          <h4 className="doc-title-active">{doc.title}</h4>
                          <p className="doc-desc-active">{doc.desc}</p>
                        </div>

                        <div className="doc-card-metadata">
                          <span>Date : {doc.date}</span>
                          <span>Taille : {doc.size}</span>
                        </div>

                        <div className="doc-card-actions">
                          <button 
                            onClick={() => { setSelectedDoc(doc); setModalOpen('doc_preview'); }}
                            className="btn-doc-preview"
                          >
                            <Eye size={16} /> Aperçu
                          </button>
                          <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); addToast(`Téléchargement de "${doc.title}.pdf" initié.`, 'success'); }}
                            className="btn-doc-download"
                          >
                            <Download size={16} /> PDF
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB D: SANTE & SOLIDARITE CCAS */}
              {(activeTab === 'sante' || activeTab === 'solidarite') && (
                <div className="iframe-simulation-wrapper">
                  <div className="tab-section-header">
                    <div>
                      <h2 className="tab-section-title">
                        {activeTab === 'sante' ? 'Santé publique à Dembéni' : 'Solidarité & Action Sociale (CCAS)'}
                      </h2>
                      <p className="tab-section-desc">
                        {activeTab === 'sante' 
                          ? 'Retrouvez les campagnes de prévention, centres médicaux et rendez-vous de santé de votre territoire.'
                          : 'Découvrez les aides, logements sociaux et services de soutien aux familles proposés par le CCAS.'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="iframe-placeholder-card">
                    <ShieldCheck size={48} className="iframe-icon" />
                    <h4>Vous êtes redirigé vers l'espace communal dédié</h4>
                    <p>Pour consulter ou soumettre un dossier de santé / social en guichet numérique, vous pouvez utiliser nos actions rapides :</p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                      <button onClick={() => setModalOpen('new_demande')} className="btn-primary-gradient">
                        Déposer un dossier CCAS
                      </button>
                      <button onClick={() => setModalOpen('take_rdv')} className="btn-secondary-border">
                        Prendre RDV avec un médecin / travailleur social
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB E: NOTIFICATIONS VIEW */}
              {activeTab === 'notifications' && (
                <div className="notifications-full-page-wrap">
                  <div className="tab-section-header">
                    <div>
                      <h2 className="tab-section-title">Vos messages & notifications administratives</h2>
                      <p className="tab-section-desc">Restez informé de l'état d'instruction de vos dossiers et des urgences municipales.</p>
                    </div>
                    {unreadNotifications > 0 && (
                      <button onClick={handleMarkAsRead} className="btn-secondary-border">
                        Tout marquer comme lu
                      </button>
                    )}
                  </div>

                  <div className="notifications-vertical-stack">
                    {notifications.length === 0 ? (
                      <div className="empty-state-card">
                        <Bell size={48} className="empty-icon" />
                        <h4>Aucun message dans votre boîte de réception</h4>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n._id} className={`notification-full-row ${n.read ? 'read' : 'unread'}`}>
                          <div className="notif-marker-dot" />
                          <div className="notif-row-content">
                            <p className="notif-row-message">{n.message}</p>
                            <span className="notif-row-time">🕒 Reçu le {new Date(n.createdAt).toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB F: PARAMETRES & SETTINGS */}
              {activeTab === 'settings' && (
                <div className="settings-panel-layout" style={{ maxWidth: '650px' }}>
                  <div className="tab-section-header">
                    <div>
                      <h2 className="tab-section-title">Paramètres de profil & de sécurité</h2>
                      <p className="tab-section-desc">Ajustez vos identifiants de connexion et gérez votre identité certifiée.</p>
                    </div>
                  </div>

                  <div className="settings-form-box">
                    <div className="settings-alert-card">
                      <AlertCircle size={20} className="alert-card-icon" />
                      <div>
                        <h5>Protection d'état civil certifiée</h5>
                        <p>
                          Pour changer votre nom officiel, votre prénom, ou votre quartier de rattachement fiscal, vous devez soumettre un acte d'état civil justificatif original en prenant rendez-vous avec le guichet de la mairie.
                        </p>
                      </div>
                    </div>

                    <div className="settings-inputs-grid">
                      <div className="input-field-setting">
                        <label>Prénom citoyen</label>
                        <input type="text" className="h-auth__input" value={user?.firstname} disabled />
                      </div>
                      <div className="input-field-setting">
                        <label>Nom citoyen</label>
                        <input type="text" className="h-auth__input" value={user?.lastname} disabled />
                      </div>
                      <div className="input-field-setting">
                        <label>Adresse e-mail enregistrée</label>
                        <input type="email" className="h-auth__input" value={user?.email} disabled />
                      </div>
                      <div className="input-field-setting">
                        <label>Quartier fiscal</label>
                        <input type="text" className="h-auth__input" value={user?.quartier} disabled />
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* ========================================================
          MODALS ENGINE
          ======================================================== */}
      <AnimatePresence>
        
        {/* 1. NEW DEMANDE MODAL */}
        {modalOpen === 'new_demande' && (
          <div className="sante-modal-overlay" onClick={() => setModalOpen(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="sante-modal-card" 
              style={{ maxWidth: '500px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sante-modal-hero" style={{ height: '140px' }}>
                <div className="sante-modal-hero-overlay-grad" />
                <div className="sante-modal-hero-content">
                  <span className="sante-modal-category">Démarche Numérique</span>
                  <h2>Créer un dossier de demande</h2>
                </div>
              </div>

              <form onSubmit={handleCreateDemande}>
                <div className="modal-body-scroll">
                  <div className="auth-input-group">
                    <label className="auth-input-label">Type de démarche officielle</label>
                    <select 
                      className="auth-styled-input" 
                      value={newDemande.type}
                      onChange={e => setNewDemande({ ...newDemande, type: e.target.value })}
                      style={{ appearance: 'auto', paddingLeft: '14px' }}
                    >
                      <option value="Acte de naissance">Acte de naissance</option>
                      <option value="Acte de mariage">Acte de mariage</option>
                      <option value="Demande de logement social">Demande de logement social (CCAS)</option>
                      <option value="Déclaration d'urbanisme">Déclaration d'urbanisme</option>
                      <option value="Aide sociale d'urgence">Aide sociale d'urgence (CCAS)</option>
                    </select>
                  </div>

                  <div className="auth-input-group" style={{ marginTop: '16px' }}>
                    <label className="auth-input-label">Objet de la demande</label>
                    <input 
                      type="text" 
                      className="auth-styled-input" 
                      placeholder="Ex: Demande d'acte de naissance plurilingue"
                      value={newDemande.title}
                      onChange={e => setNewDemande({ ...newDemande, title: e.target.value })}
                      required
                      style={{ paddingLeft: '14px' }}
                    />
                  </div>

                  <div className="auth-input-group" style={{ marginTop: '16px' }}>
                    <label className="auth-input-label">Description / Instructions</label>
                    <textarea 
                      className="auth-styled-input" 
                      rows="4" 
                      placeholder="Précisez les détails (noms des parents, date de l'événement, etc.)..."
                      value={newDemande.description}
                      onChange={e => setNewDemande({ ...newDemande, description: e.target.value })}
                      required
                      style={{ padding: '12px', resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div className="sante-modal-footer">
                  <button type="button" className="btn-modal-close-action" onClick={() => setModalOpen(null)}>Annuler</button>
                  <button type="submit" className="btn-modal-call-action" style={{ border: 'none' }}>Soumettre la demande</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* 2. APPOINTMENT SCHEDULER MODAL (TAKE RDV) */}
        {modalOpen === 'take_rdv' && (
          <div className="sante-modal-overlay" onClick={() => setModalOpen(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="sante-modal-card" 
              style={{ maxWidth: '500px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sante-modal-hero" style={{ height: '140px' }}>
                <div className="sante-modal-hero-overlay-grad" />
                <div className="sante-modal-hero-content">
                  <span className="sante-modal-category">Planification Guichet</span>
                  <h2>Prendre rendez-vous en Mairie</h2>
                </div>
              </div>

              <form onSubmit={e => { e.preventDefault(); addToast('Votre rendez-vous a bien été réservé. Un mémo SMS vous a été envoyé.', 'success'); setModalOpen(null); }}>
                <div className="modal-body-scroll">
                  <div className="auth-input-group">
                    <label className="auth-input-label">Service concerné</label>
                    <select 
                      className="auth-styled-input"
                      value={rdvForm.service}
                      onChange={e => setRdvForm({ ...rdvForm, service: e.target.value })}
                      style={{ appearance: 'auto', paddingLeft: '14px' }}
                    >
                      <option value="État Civil">Guichet État Civil (CNI / Passeport)</option>
                      <option value="CCAS / Social">Accompagnement Social (CCAS)</option>
                      <option value="Urbanisme">Service Urbanisme</option>
                      <option value="Maire / Adjoints">Rendez-vous avec un Élu</option>
                    </select>
                  </div>

                  <div className="input-grid-double" style={{ marginTop: '16px' }}>
                    <div className="auth-input-group">
                      <label className="auth-input-label">Date souhaitée</label>
                      <input 
                        type="date" 
                        className="auth-styled-input" 
                        required 
                        value={rdvForm.date}
                        onChange={e => setRdvForm({ ...rdvForm, date: e.target.value })}
                        style={{ paddingLeft: '14px' }} 
                      />
                    </div>
                    <div className="auth-input-group">
                      <label className="auth-input-label">Créneau horaire</label>
                      <select 
                        className="auth-styled-input" 
                        required
                        value={rdvForm.time}
                        onChange={e => setRdvForm({ ...rdvForm, time: e.target.value })}
                        style={{ appearance: 'auto', paddingLeft: '14px' }}
                      >
                        <option value="">Sélectionner...</option>
                        <option value="08:30">08:30 - 09:00</option>
                        <option value="09:30">09:30 - 10:00</option>
                        <option value="10:30">10:30 - 11:00</option>
                        <option value="13:30">13:30 - 14:00</option>
                        <option value="14:30">14:30 - 15:00</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="sante-modal-footer">
                  <button type="button" className="btn-modal-close-action" onClick={() => setModalOpen(null)}>Annuler</button>
                  <button type="submit" className="btn-modal-call-action" style={{ border: 'none' }}>Confirmer le RDV</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* 3. CONTACT MAIRIE MODAL */}
        {modalOpen === 'contact_mairie' && (
          <div className="sante-modal-overlay" onClick={() => setModalOpen(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="sante-modal-card" 
              style={{ maxWidth: '500px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sante-modal-hero" style={{ height: '140px' }}>
                <div className="sante-modal-hero-overlay-grad" />
                <div className="sante-modal-hero-content">
                  <span className="sante-modal-category">Messagerie Usager</span>
                  <h2>Contacter la Mairie</h2>
                </div>
              </div>

              <form onSubmit={e => { e.preventDefault(); addToast('Votre message a bien été envoyé. Un agent vous répondra sous 24h.', 'success'); setModalOpen(null); }}>
                <div className="modal-body-scroll">
                  <div className="auth-input-group">
                    <label className="auth-input-label">Sujet du message</label>
                    <input 
                      type="text" 
                      className="auth-styled-input" 
                      placeholder="Ex: Demande de renseignement sur les crèches"
                      required
                      value={contactForm.subject}
                      onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                      style={{ paddingLeft: '14px' }} 
                    />
                  </div>

                  <div className="auth-input-group" style={{ marginTop: '16px' }}>
                    <label className="auth-input-label">Votre message</label>
                    <textarea 
                      className="auth-styled-input" 
                      rows="5" 
                      placeholder="Saisissez votre demande d'information de manière détaillée..."
                      required
                      value={contactForm.message}
                      onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                      style={{ padding: '12px', resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div className="sante-modal-footer">
                  <button type="button" className="btn-modal-close-action" onClick={() => setModalOpen(null)}>Annuler</button>
                  <button type="submit" className="btn-modal-call-action" style={{ border: 'none' }}>Envoyer le message</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* 4. REPORT ISSUE MODAL (SIGNALER UN PROBLEME) */}
        {modalOpen === 'report_issue' && (
          <div className="sante-modal-overlay" onClick={() => setModalOpen(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="sante-modal-card" 
              style={{ maxWidth: '500px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sante-modal-hero" style={{ height: '140px' }}>
                <div className="sante-modal-hero-overlay-grad" />
                <div className="sante-modal-hero-content">
                  <span className="sante-modal-category">Signalement Communal</span>
                  <h2>Signaler une anomalie</h2>
                </div>
              </div>

              <form onSubmit={e => { e.preventDefault(); addToast('Votre signalement a bien été enregistré. Les services techniques sont prévenus.', 'success'); setModalOpen(null); }}>
                <div className="modal-body-scroll">
                  <div className="auth-input-group">
                    <label className="auth-input-label">Catégorie du problème</label>
                    <select 
                      className="auth-styled-input"
                      value={issueForm.category}
                      onChange={e => setIssueForm({ ...issueForm, category: e.target.value })}
                      style={{ appearance: 'auto', paddingLeft: '14px' }}
                    >
                      <option value="Voirie">Voirie (Trou dans la chaussée, pavés défectueux)</option>
                      <option value="Éclairage">Éclairage public en panne</option>
                      <option value="Déchets">Dépôt d'ordures sauvage / encombrants</option>
                      <option value="Espaces verts">Arbre ou branche menaçante</option>
                    </select>
                  </div>

                  <div className="auth-input-group" style={{ marginTop: '16px' }}>
                    <label className="auth-input-label">Localisation précise</label>
                    <input 
                      type="text" 
                      className="auth-styled-input" 
                      placeholder="Ex: Rue du dispensaire, face au numéro 14"
                      required
                      value={issueForm.location}
                      onChange={e => setIssueForm({ ...issueForm, location: e.target.value })}
                      style={{ paddingLeft: '14px' }} 
                    />
                  </div>

                  <div className="auth-input-group" style={{ marginTop: '16px' }}>
                    <label className="auth-input-label">Description de l'anomalie</label>
                    <textarea 
                      className="auth-styled-input" 
                      rows="4" 
                      placeholder="Détaillez le problème constaté afin de faciliter l'intervention des agents..."
                      required
                      value={issueForm.description}
                      onChange={e => setIssueForm({ ...issueForm, description: e.target.value })}
                      style={{ padding: '12px', resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div className="sante-modal-footer">
                  <button type="button" className="btn-modal-close-action" onClick={() => setModalOpen(null)}>Annuler</button>
                  <button type="submit" className="btn-modal-call-action" style={{ border: 'none' }}>Soumettre le signalement</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* 5. DOCUMENT PREVIEW MODAL */}
        {modalOpen === 'doc_preview' && selectedDoc && (
          <div className="sante-modal-overlay" onClick={() => setModalOpen(null)}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="sante-modal-card" 
              style={{ maxWidth: '600px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sante-modal-hero" style={{ height: '100px' }}>
                <div className="sante-modal-hero-overlay-grad" style={{ background: '#0f3c28' }} />
                <div className="sante-modal-hero-content" style={{ padding: '0 0 12px 24px' }}>
                  <span className="sante-modal-category">Visualisation PDF</span>
                  <h2>Aperçu : {selectedDoc.title}</h2>
                </div>
              </div>

              <div style={{ padding: '30px', background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                
                {/* Simulated high-fidelity document layout */}
                <div className="simulated-pdf-sheet">
                  <div className="pdf-header-row">
                    <span className="pdf-brand-insignia">RÉPUBLIQUE FRANÇAISE</span>
                    <span className="pdf-mairie-insignia">Département de Mayotte • Commune de Dembéni</span>
                  </div>
                  
                  <div className="pdf-doc-title-box">
                    <h3>{selectedDoc.title.toUpperCase()}</h3>
                    <span>Identifiant unique : {selectedDoc.code}</span>
                  </div>

                  <div className="pdf-doc-body-fields">
                    <div className="pdf-data-row">
                      <span className="pdf-label">NOM DE L'USAGER :</span>
                      <span className="pdf-value">{user?.lastname?.toUpperCase()} {user?.firstname}</span>
                    </div>
                    <div className="pdf-data-row">
                      <span className="pdf-label">DATE DE CERTIFICATION :</span>
                      <span className="pdf-value">{selectedDoc.date}</span>
                    </div>
                    <div className="pdf-data-row">
                      <span className="pdf-label">QUARTIER DE RATTACHEMENT :</span>
                      <span className="pdf-value">{user?.quartier}</span>
                    </div>
                    <div className="pdf-data-row">
                      <span className="pdf-label">RÉSIDENCE PRINCIPALE :</span>
                      <span className="pdf-value">{user?.address}</span>
                    </div>
                  </div>

                  <div className="pdf-footer-stamp">
                    <div className="stamp-circle">MAIRIE DE DEMBÉNI • CERTIFIÉ CONFORME</div>
                    <span className="pdf-footer-note">Ce document électronique est certifié conforme par la signature cryptographique du Secrétaire Général de la Commune.</span>
                  </div>
                </div>

              </div>

              <div className="sante-modal-footer" style={{ background: 'white' }}>
                <button type="button" className="btn-modal-close-action" onClick={() => setModalOpen(null)}>Fermer</button>
                <button 
                  type="button" 
                  onClick={() => { addToast('Téléchargement du document initié.', 'success'); setModalOpen(null); }}
                  className="btn-modal-call-action" 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={16} /> Télécharger la pièce (.pdf)
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
      
    </div>
  );
};

export default UserDashboard;
