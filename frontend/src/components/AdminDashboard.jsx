import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCheck, UserX, Search, RefreshCw, Users, FileText, Plus, Trash2, Edit, X, 
  MapPin, Phone, Mail, Clock, ShieldCheck, AlertTriangle, ArrowRight, BarChart, Send, 
  Calendar, Activity, Info, BarChart2, CheckCircle, Shield, FileCheck, Bell, Settings, 
  LogOut, ChevronRight, CheckCircle2, Moon, Sun, Map, AlertOctagon, Eye, ExternalLink, HelpCircle, Compass
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Navigation States
  const [activeTab, setActiveTab] = useState('stats');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [skeletonLoading, setSkeletonLoading] = useState(false);

  // General State Lists
  const [stats, setStats] = useState(null);
  const [citizens, setCitizens] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [publications, setPublications] = useState([]);
  const [services, setServices] = useState([]);
  
  // Mock Signalements for Interactive Mapping
  const [signalements, setSignalements] = useState([
    {
      _id: 'sig_1',
      titre: "Dépôt de déchets sauvages",
      description: "Des encombrants et gravats ont été déposés illicitement sur le bas-côté de la route nationale.",
      quartier: "Tsararano",
      statut: "En attente",
      lat: -12.842,
      lon: 45.182,
      reporter: "Anli Abdou",
      date: "2026-05-18"
    },
    {
      _id: 'sig_2',
      titre: "Éclairage public défaillant",
      description: "Trois lampadaires successifs sont éteints, créant une zone d'obscurité totale dangereuse.",
      quartier: "Iloni",
      statut: "En cours",
      lat: -12.855,
      lon: 45.195,
      reporter: "Rachida Madi",
      date: "2026-05-19"
    },
    {
      _id: 'sig_3',
      titre: "Nid-de-poule dangereux sur chaussée",
      description: "Une importante cavité s'est formée suite aux fortes pluies, menaçant la sécurité des deux-roues.",
      quartier: "Ongojou",
      statut: "Résolu",
      lat: -12.835,
      lon: 45.172,
      reporter: "Assani Fahami",
      date: "2026-05-15"
    }
  ]);
  
  const [selectedSignalement, setSelectedSignalement] = useState(null);

  // UI Loaders & Alerts
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Edit / Add Modal States
  const [currentModal, setCurrentModal] = useState(null); // 'add_publication', 'edit_publication', 'add_service', 'edit_service', 'respond_demande'
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Form Input States
  const [publicationForm, setPublicationForm] = useState({
    title: '',
    content: '',
    type: 'actualite',
    category: 'Général',
    image: '',
    status: 'published',
    isFeatured: false,
    isPinned: false,
    tags: '',
    eventDate: '',
    eventLocation: ''
  });
  const [serviceForm, setServiceForm] = useState({ title: '', desc: '', fullDesc: '', category: 'Soins', img: '', location: '', hours: '', phone: '', email: '', benefits: '' });
  const [respondForm, setRespondForm] = useState({ message: '', status: 'approved' });
  const [isPreviewMode, setIsPreviewMode] = useState(false); // Live preview mode inside modal
  
  // CMS Filter States
  const [cmsTypeFilter, setCmsTypeFilter] = useState('all');
  const [cmsCategoryFilter, setCmsCategoryFilter] = useState('all');
  const [cmsStatusFilter, setCmsStatusFilter] = useState('all');

  // Guard routing
  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else if (user.role !== 'admin') {
      navigate('/compte');
    }
  }, [user, navigate]);

  // Toast Trigger Helper
  const triggerToast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch Dashboard statistics and all lists
  const fetchAllData = async (silent = false) => {
    if (!user) return;
    if (!silent) setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      
      // Fetch Stats
      const resStats = await axios.get('http://localhost:4000/api/admin/stats', { headers });
      setStats(resStats.data.data);

      // Fetch Citizens
      const resUsers = await axios.get('http://localhost:4000/api/admin/users', { headers });
      setCitizens(resUsers.data.data);

      // Fetch Demands
      const resDemands = await axios.get('http://localhost:4000/api/admin/demandes', { headers });
      setDemandes(resDemands.data.data);

      // Fetch Publications (CMS Global Dynamique)
      const resPubs = await axios.get('http://localhost:4000/api/publications', { headers });
      setPublications(resPubs.data.data);

      // Fetch Services
      const resServices = await axios.get('http://localhost:4000/api/services');
      setServices(resServices.data.data);

      if (!silent) {
        triggerToast("CMS communal synchronisé", "success");
      }
    } catch (err) {
      console.error('Erreur de chargement des données d\'administration', err);
      triggerToast("Erreur lors de la synchronisation", "error");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  // Tab switching skeleton simulation
  const handleTabChange = (tabId) => {
    setSkeletonLoading(true);
    setActiveTab(tabId);
    setSearchQuery('');
    setMobileSidebarOpen(false);
    setTimeout(() => {
      setSkeletonLoading(false);
    }, 450);
  };

  // CITIZEN VALIDATIONS
  const handleValidateCitizen = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      await axios.put(`http://localhost:4000/api/admin/users/${id}/validate`, {}, { headers });
      triggerToast("Identité citoyenne validée avec succès");
      fetchAllData(true);
    } catch (err) {
      console.error(err);
      triggerToast("Erreur lors de la validation", "error");
    }
  };

  const handleRejectCitizen = async (id) => {
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      await axios.put(`http://localhost:4000/api/admin/users/${id}/reject`, {}, { headers });
      triggerToast("Demande citoyenne rejetée", "error");
      fetchAllData(true);
    } catch (err) {
      console.error(err);
      triggerToast("Erreur lors du rejet", "error");
    }
  };

  const handleDeleteCitizen = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer définitivement cet utilisateur ?')) return;
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      await axios.delete(`http://localhost:4000/api/admin/users/${id}`, { headers });
      triggerToast("Compte citoyen supprimé");
      fetchAllData(true);
    } catch (err) {
      console.error(err);
      triggerToast("Erreur de suppression", "error");
    }
  };

  // PUBLICATIONS CMS CRUD
  const handleCreatePublication = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const formattedTags = publicationForm.tags ? publicationForm.tags.split(',').map(t => t.trim()).filter(t => t) : [];
      const payload = {
        ...publicationForm,
        tags: formattedTags
      };
      await axios.post('http://localhost:4000/api/publications', payload, { headers });
      setCurrentModal(null);
      setPublicationForm({
        title: '',
        content: '',
        type: 'actualite',
        category: 'Général',
        image: '',
        status: 'published',
        isFeatured: false,
        isPinned: false,
        tags: '',
        eventDate: '',
        eventLocation: ''
      });
      triggerToast("Publication enregistrée avec succès");
      fetchAllData(true);
    } catch (err) {
      console.error(err);
      triggerToast("Erreur de création de la publication", "error");
    }
  };

  const handleUpdatePublication = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const formattedTags = typeof publicationForm.tags === 'string' ? publicationForm.tags.split(',').map(t => t.trim()).filter(t => t) : publicationForm.tags;
      const payload = {
        ...publicationForm,
        tags: formattedTags
      };
      await axios.put(`http://localhost:4000/api/publications/${selectedItem._id}`, payload, { headers });
      setCurrentModal(null);
      setSelectedItem(null);
      setPublicationForm({
        title: '',
        content: '',
        type: 'actualite',
        category: 'Général',
        image: '',
        status: 'published',
        isFeatured: false,
        isPinned: false,
        tags: '',
        eventDate: '',
        eventLocation: ''
      });
      triggerToast("Publication mise à jour");
      fetchAllData(true);
    } catch (err) {
      console.error(err);
      triggerToast("Erreur lors de la modification de la publication", "error");
    }
  };

  const handleDeletePublication = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer définitivement cette publication ?')) return;
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      await axios.delete(`http://localhost:4000/api/publications/${id}`, { headers });
      triggerToast("Publication supprimée définitivement");
      fetchAllData(true);
    } catch (err) {
      console.error(err);
      triggerToast("Erreur de suppression de la publication", "error");
    }
  };

  const handleTogglePublishStatus = async (item) => {
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      const newStatus = item.status === 'published' ? 'draft' : 'published';
      await axios.put(`http://localhost:4000/api/publications/${item._id}`, { status: newStatus }, { headers });
      triggerToast(`Statut changé à : ${newStatus === 'published' ? 'Publié' : 'Brouillon'}`);
      fetchAllData(true);
    } catch (err) {
      console.error(err);
      triggerToast("Impossible de changer le statut", "error");
    }
  };

  // SERVICES CRUD
  const handleCreateService = async (e) => {
    e.preventDefault();
    const formatted = { 
      ...serviceForm, 
      benefits: serviceForm.benefits ? serviceForm.benefits.split(',').map(b => b.trim()).filter(b => b) : [] 
    };
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      await axios.post('http://localhost:4000/api/services', formatted, { headers });
      setCurrentModal(null);
      setServiceForm({ title: '', desc: '', fullDesc: '', category: 'Soins', img: '', location: '', hours: '', phone: '', email: '', benefits: '' });
      triggerToast("Nouveau service public créé");
      fetchAllData(true);
    } catch (err) {
      console.error(err);
      triggerToast("Erreur de création de service", "error");
    }
  };

  const handleUpdateService = async (e) => {
    e.preventDefault();
    const formatted = { 
      ...serviceForm, 
      benefits: serviceForm.benefits ? serviceForm.benefits.split(',').map(b => b.trim()).filter(b => b) : [] 
    };
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      await axios.put(`http://localhost:4000/api/services/${selectedItem._id}`, formatted, { headers });
      setCurrentModal(null);
      setSelectedItem(null);
      setServiceForm({ title: '', desc: '', fullDesc: '', category: 'Soins', img: '', location: '', hours: '', phone: '', email: '', benefits: '' });
      triggerToast("Fiche service mise à jour avec succès");
      fetchAllData(true);
    } catch (err) {
      console.error(err);
      triggerToast("Erreur de modification de service", "error");
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Voulez-vous supprimer ce service ?')) return;
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      await axios.delete(`http://localhost:4000/api/services/${id}`, { headers });
      triggerToast("Service public archivé");
      fetchAllData(true);
    } catch (err) {
      console.error(err);
      triggerToast("Erreur d'archivage", "error");
    }
  };

  // DEMAND RESPONSES
  const handleRespondDemande = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${user.token}` };
      await axios.post(`http://localhost:4000/api/admin/demandes/${selectedItem._id}/respond`, respondForm, { headers });
      setCurrentModal(null);
      setSelectedItem(null);
      setRespondForm({ message: '', status: 'approved' });
      triggerToast("Dossier traité. Notification et e-mail transmis.");
      fetchAllData(true);
    } catch (err) {
      console.error(err);
      triggerToast("Erreur lors du traitement", "error");
    }
  };

  // RESOLVE CITIZEN SIGNALEMENTS
  const handleResolveSignalement = (id) => {
    setSignalements(prev => prev.map(s => {
      if (s._id === id) {
        triggerToast(`Signalement "${s.titre}" marqué comme Résolu`);
        return { ...s, statut: "Résolu" };
      }
      return s;
    }));
  };

  // List Search Filters
  const filteredCitizens = citizens.filter(c => {
    const fullName = `${c.firstname} ${c.lastname}`.toLowerCase();
    const email = c.email.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
  });

  const filteredDemandes = demandes.filter(d => {
    const title = d.title.toLowerCase();
    const desc = d.description.toLowerCase();
    const citizen = `${d.citizenId?.firstname} ${d.citizenId?.lastname}`.toLowerCase();
    return title.includes(searchQuery.toLowerCase()) || desc.includes(searchQuery.toLowerCase()) || citizen.includes(searchQuery.toLowerCase());
  });

  const filteredPublications = publications.filter(pub => {
    if (!pub) return false;
    
    // Search query matching
    const matchesSearch = searchQuery
      ? (pub.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         pub.content?.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
      
    // Filter matching
    const matchesType = cmsTypeFilter === 'all' ? true : pub.type === cmsTypeFilter;
    const matchesCategory = cmsCategoryFilter === 'all' ? true : pub.category === cmsCategoryFilter;
    const matchesStatus = cmsStatusFilter === 'all' ? true : pub.status === cmsStatusFilter;
    
    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  // Calculate default map marker zoom if a signalement is highlighted
  const mapCenterLat = selectedSignalement ? selectedSignalement.lat : -12.844;
  const mapCenterLon = selectedSignalement ? selectedSignalement.lon : 45.180;
  const mapZoom = selectedSignalement ? 18 : 14;

  const pendingApprovalsCount = citizens.filter(c => c.status === 'pending').length;

  return (
    <div className={`admin-portal-shell ${isDarkMode ? 'dark' : ''}`}>
      
      {/* TOAST SYSTEM */}
      <div className="toast-portal-container">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`toast-capsule ${t.type}`}
            >
              {t.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* MOBILE NAVBAR DRAWER TOGGLER */}
      <div className="mobile-portal-navbar" style={{ background: isDarkMode ? '#121824' : 'white', borderColor: isDarkMode ? '#1e293b' : '#e2e8f0' }}>
        <button 
          className="mobile-sidebar-toggle"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        >
          <div className={`bar ${mobileSidebarOpen ? 'open' : ''}`} style={{ background: isDarkMode ? 'white' : '#0f172a' }} />
          <div className={`bar ${mobileSidebarOpen ? 'open' : ''}`} style={{ background: isDarkMode ? 'white' : '#0f172a' }} />
          <div className={`bar ${mobileSidebarOpen ? 'open' : ''}`} style={{ background: isDarkMode ? 'white' : '#0f172a' }} />
        </button>
        <span className="mobile-portal-brand" style={{ color: isDarkMode ? 'white' : '#0f3c28' }}>DEMBÉNI ADMIN</span>
        <button className="mobile-portal-bell" onClick={() => handleTabChange('citoyens')}>
          <Bell size={20} style={{ color: isDarkMode ? '#cbd5e1' : '#475569' }} />
          {pendingApprovalsCount > 0 && <div className="mobile-bell-dot" />}
        </button>
      </div>

      {/* FIXED ADMINISTRATIVE SIDEBAR */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div>
          <div className="admin-sidebar-brand">
            <div className="admin-brand-logo-letter">D</div>
            <div>
              <span className="admin-brand-main-title">Dembéni Mairie</span>
              <span className="admin-brand-sub-title">ADMINISTRATION</span>
            </div>
          </div>

          <nav className="admin-sidebar-nav">
            {[
              { id: 'stats', name: 'Tableau de bord', icon: <BarChart2 size={18} /> },
              { id: 'citoyens', name: 'Gestion Citoyens', icon: <Users size={18} />, badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : null },
              { id: 'demandes', name: 'Gestion Démarches', icon: <FileText size={18} /> },
              { id: 'signalements', name: 'Signalements', icon: <AlertOctagon size={18} /> },
              { id: 'publications', name: 'Gestion Publications', icon: <Compass size={18} /> },
              { id: 'services', name: 'Services publics', icon: <Activity size={18} /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`admin-sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.icon}
                <span className="item-name">{tab.name}</span>
                {tab.badge && <span className="admin-sidebar-badge">{tab.badge}</span>}
              </button>
            ))}
          </nav>
        </div>

        <div className="admin-sidebar-footer">
          <div className="admin-footer-user">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="Admin" className="admin-footer-user-avatar" />
            ) : (
              <div className="brand-logo-letter" style={{ width: '40px', height: '40px', background: '#10b981' }}>A</div>
            )}
            <div className="admin-footer-user-info">
              <span className="user-name">{user ? `${user.firstname} ${user.lastname.charAt(0)}.` : 'Secrétariat'}</span>
              <span className="user-role">Secrétaire Général</span>
            </div>
          </div>
          <button className="btn-admin-logout" onClick={logout}>
            <LogOut size={16} /> <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* TOPBAR */}
      <header className="admin-topbar">
        <div className="topbar-search-bar">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder={
              activeTab === 'citoyens' ? "Rechercher un citoyen (nom, mail)..." :
              activeTab === 'demandes' ? "Rechercher un dossier, demandeur..." :
              "Recherche globale..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="topbar-actions-panel">
          <button 
            className="btn-icon-circular" 
            onClick={() => setIsDarkMode(!isDarkMode)}
            title="Basculer le thème"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button 
            className="btn-icon-circular" 
            onClick={() => fetchAllData()} 
            title="Rafraîchir les données"
          >
            <RefreshCw size={18} className={loading ? 'h-spin' : ''} />
          </button>

          <div className="topbar-user-badge">
            <span className="topbar-user-name">Hôtel de Ville • Mayotte</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="admin-main-area">
        
        {/* SKELETON LOADER ANIMATION */}
        {skeletonLoading ? (
          <div className="dashboard-skeleton-wrapper">
            <div className="skeleton-item-box large" style={{ height: '80px', borderRadius: '16px' }} />
            <div className="skeleton-grid-double">
              <div className="skeleton-item-box large" />
              <div className="skeleton-item-box small" />
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* TAB 1: TABLEAU DE BORD (STATS) */}
            {activeTab === 'stats' && stats && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key="stats"
              >
                {/* User Header Welcome */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                      RÉPUBLIQUE FRANÇAISE • PRÉFECTURE DE MAYOTTE
                    </span>
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, color: isDarkMode ? 'white' : '#0f3c28', margin: '8px 0 4px 0' }}>
                      Administration Communale
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>
                      Portail de gestion administrative et citoyenne de Dembéni.
                    </p>
                  </div>
                </div>

                {/* Primary Stats Grid */}
                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrap green">
                      <Users size={20} />
                    </div>
                    <div className="admin-stat-details">
                      <span className="admin-stat-number">{stats.users.total}</span>
                      <span className="admin-stat-label">Citoyens Inscrits</span>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrap orange">
                      <FileText size={20} />
                    </div>
                    <div className="admin-stat-details">
                      <span className="admin-stat-number">{stats.demands.total}</span>
                      <span className="admin-stat-label">Démarches total</span>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrap red">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="admin-stat-details">
                      <span className="admin-stat-number">{pendingApprovalsCount}</span>
                      <span className="admin-stat-label">Inscriptions à valider</span>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon-wrap blue">
                      <Activity size={20} />
                    </div>
                    <div className="admin-stat-details">
                      <span className="admin-stat-number">{publications.length}</span>
                      <span className="admin-stat-label">Publications actives</span>
                    </div>
                  </div>
                </div>

                {/* Grid Double layout */}
                <div className="tab-layout-grid">
                  
                  {/* Recent Activity Log */}
                  <div className="admin-table-container" style={{ gridColumn: 'span 2' }}>
                    <div className="admin-table-header-row">
                      <h3 className="admin-table-title" style={{ color: isDarkMode ? 'white' : '#0f172a' }}>
                        Dossiers récents en attente de signature
                      </h3>
                      <button 
                        className="btn-primary-gradient" 
                        onClick={() => handleTabChange('demandes')}
                        style={{ padding: '8px 16px', fontSize: '0.8rem', background: '#10b981', boxShadow: 'none' }}
                      >
                        Voir toutes les démarches <ArrowRight size={14} />
                      </button>
                    </div>

                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Dossier</th>
                          <th>Citoyen demandeur</th>
                          <th>Statut</th>
                          <th>Déposé le</th>
                        </tr>
                      </thead>
                      <tbody>
                        {demandes.filter(d => d.status === 'pending').slice(0, 4).length === 0 ? (
                          <tr>
                            <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                              Aucun dossier en attente de traitement.
                            </td>
                          </tr>
                        ) : (
                          demandes.filter(d => d.status === 'pending').slice(0, 4).map(d => (
                            <tr key={d._id}>
                              <td style={{ fontWeight: '800', color: isDarkMode ? 'white' : '#0f172a' }}>{d.title}</td>
                              <td>👤 {d.citizenId?.firstname} {d.citizenId?.lastname}</td>
                              <td>
                                <span style={{
                                  padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase',
                                  background: '#fef3c7', color: '#b45309'
                                }}>En attente</span>
                              </td>
                              <td>📅 {new Date(d.createdAt).toLocaleDateString('fr-FR')}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Quick Action Panels */}
                  <div className="quick-actions-panel-wrapper" style={{ gridColumn: 'span 2', background: isDarkMode ? '#121824' : 'white', borderColor: isDarkMode ? '#1e293b' : '#e2e8f0' }}>
                    <h3 className="section-block-title" style={{ color: isDarkMode ? 'white' : '#0f3c28' }}>Actions Secrétariat Général</h3>
                    <div className="quick-actions-grid-wrap">
                      <button className="quick-action-capsule green-btn" onClick={() => { setPublicationForm({ title: '', content: '', type: 'actualite', category: 'Général', image: '', status: 'published', isFeatured: false, isPinned: false, tags: '', eventDate: '', eventLocation: '' }); setCurrentModal('add_publication'); }}>
                        <div className="capsule-icon"><Plus size={18} /></div>
                        <div className="capsule-text">
                          <span className="capsule-title">Publier du contenu CMS</span>
                          <span className="capsule-desc">Ajouter des infos de voirie, santé...</span>
                        </div>
                      </button>
                      <button className="quick-action-capsule blue-btn" onClick={() => { setPublicationForm({ title: '', content: '', type: 'evenement', category: 'Culture', image: '', status: 'published', isFeatured: false, isPinned: false, tags: '', eventDate: '', eventLocation: '' }); setCurrentModal('add_publication'); }}>
                        <div className="capsule-icon"><Calendar size={18} /></div>
                        <div className="capsule-text">
                          <span className="capsule-title">Programmer un événement</span>
                          <span className="capsule-desc">Ajouter un atelier ou campagne...</span>
                        </div>
                      </button>
                      <button className="quick-action-capsule purple-btn" onClick={() => handleTabChange('citoyens')}>
                        <div className="capsule-icon"><UserCheck size={18} /></div>
                        <div className="capsule-text">
                          <span className="capsule-title">Valider les identités</span>
                          <span className="capsule-desc">Traiter les comptes en attente</span>
                        </div>
                      </button>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 2: CITOYENS */}
            {activeTab === 'citoyens' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key="citoyens"
              >
                <div className="admin-table-container">
                  <div className="admin-table-header-row">
                    <h3 className="admin-table-title" style={{ color: isDarkMode ? 'white' : '#0f172a' }}>Registre National des Citoyens (Dembéni)</h3>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '4px 10px', borderRadius: '12px' }}>
                      {filteredCitizens.length} Citoyens enregistrés
                    </span>
                  </div>

                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Nom du Citoyen</th>
                        <th>Coordonnées</th>
                        <th>Adresse / Quartier</th>
                        <th>Statut de compte</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCitizens.length === 0 ? (
                        <tr>
                          <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>
                            Aucun citoyen ne correspond à votre recherche.
                          </td>
                        </tr>
                      ) : (
                        filteredCitizens.map(c => (
                          <tr key={c._id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#eafaf1', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                                  {c.firstname.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <span className="admin-table-user-name" style={{ color: isDarkMode ? 'white' : '#0f172a' }}>{c.firstname} {c.lastname}</span>
                                  <span className="admin-table-user-sub">Enregistré le {new Date(c.createdAt).toLocaleDateString('fr-FR')}</span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ fontSize: '0.82rem', fontWeight: '700' }}>📧 {c.email}</div>
                              {c.phone && <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>📞 {c.phone}</div>}
                            </td>
                            <td>
                              <div style={{ fontSize: '0.82rem', fontWeight: '700' }}>📍 {c.quartier || 'Non renseigné'}</div>
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{c.address}</div>
                            </td>
                            <td>
                              <span style={{ 
                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase',
                                background: c.status === 'approved' ? '#dcfce7' : c.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                                color: c.status === 'approved' ? '#10b981' : c.status === 'rejected' ? '#ef4444' : '#d97706'
                              }}>{c.status === 'approved' ? 'Validé' : c.status === 'rejected' ? 'Rejeté' : 'En attente'}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                {c.status === 'pending' && (
                                  <>
                                    <button 
                                      onClick={() => handleValidateCitizen(c._id)}
                                      className="btn-icon-circular" 
                                      style={{ width: '32px', height: '32px', background: '#dcfce7', color: '#10b981' }}
                                      title="Valider l'inscription"
                                    >
                                      <UserCheck size={14} />
                                    </button>
                                    <button 
                                      onClick={() => handleRejectCitizen(c._id)}
                                      className="btn-icon-circular" 
                                      style={{ width: '32px', height: '32px', background: '#fee2e2', color: '#ef4444' }}
                                      title="Rejeter l'inscription"
                                    >
                                      <UserX size={14} />
                                    </button>
                                  </>
                                )}
                                <button 
                                  onClick={() => handleDeleteCitizen(c._id)}
                                  className="btn-icon-circular" 
                                  style={{ width: '32px', height: '32px' }}
                                  title="Supprimer définitivement"
                                >
                                  <Trash2 size={14} style={{ color: '#ef4444' }} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* TAB 3: DEMARCHES */}
            {activeTab === 'demandes' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key="demandes"
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filteredDemandes.length === 0 ? (
                    <div style={{ background: 'white', borderRadius: '24px', padding: '60px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                      <FileText size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                      <h4 style={{ margin: '0', fontSize: '1.1rem', color: '#64748b', fontWeight: '800' }}>Aucun dossier ne correspond à votre recherche.</h4>
                    </div>
                  ) : (
                    filteredDemandes.map(d => (
                      <div key={d._id} style={{ background: isDarkMode ? '#121824' : 'white', borderRadius: '20px', padding: '24px', border: '1px solid', borderColor: isDarkMode ? '#1e293b' : '#e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', textAlign: 'left' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: '800', background: isDarkMode ? '#1a2333' : '#f1f5f9', color: isDarkMode ? '#cbd5e1' : '#475569', padding: '4px 8px', borderRadius: '6px' }}>
                              {d.type}
                            </span>
                            <span style={{
                              fontSize: '0.72rem', 
                              fontWeight: '800', 
                              background: d.status === 'approved' ? '#dcfce7' : d.status === 'rejected' ? '#fee2e2' : '#fef3c7', 
                              color: d.status === 'approved' ? '#10b981' : d.status === 'rejected' ? '#ef4444' : '#d97706', 
                              padding: '4px 8px', 
                              borderRadius: '6px',
                              textTransform: 'uppercase'
                            }}>
                              {d.status === 'approved' ? 'Approuvée' : d.status === 'rejected' ? 'Rejetée' : 'En attente'}
                            </span>
                          </div>
                          
                          <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: isDarkMode ? 'white' : '#0f3c28', margin: '12px 0 6px 0' }}>{d.title}</h3>
                          <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.88rem', lineHeight: '1.5' }}>{d.description}</p>
                          
                          <div style={{ background: isDarkMode ? '#1a2333' : '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid', borderColor: isDarkMode ? '#2e3b4e' : '#e2e8f0', display: 'inline-flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Citoyen demandeur</span>
                            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: isDarkMode ? '#cbd5e1' : '#1e293b' }}>
                              👤 {d.citizenId?.firstname} {d.citizenId?.lastname} | 📧 {d.citizenId?.email}
                            </span>
                          </div>

                          {d.responses && d.responses.length > 0 && (
                            <div style={{ marginTop: '16px', background: isDarkMode ? 'rgba(16,185,129,0.05)' : '#f0fdf4', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #10b981', borderborderColor: isDarkMode ? '#1e293b' : '#bbf7d0' }}>
                              {d.responses.map((res, idx) => (
                                <div key={idx}>
                                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#10b981' }}>{res.author}</div>
                                  <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: isDarkMode ? '#cbd5e1' : '#475569', fontWeight: '600' }}>{res.message}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '700' }}>
                            📅 {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                          <button 
                            onClick={() => { setSelectedItem(d); setCurrentModal('respond_demande'); }}
                            className="btn-primary-gradient"
                            style={{ padding: '8px 16px', fontSize: '0.82rem', background: '#10b981', boxShadow: 'none' }}
                          >
                            <Send size={14} /> Traiter / Répondre
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB 4: SIGNALEMENTS TERRITORIAUX */}
            {activeTab === 'signalements' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key="signalements"
              >
                <div className="tab-layout-grid">
                  
                  {/* List of reported anomalies */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {signalements.map(s => (
                      <div 
                        key={s._id} 
                        className={`admin-action-card ${selectedSignalement?._id === s._id ? 'active' : ''}`}
                        onClick={() => setSelectedSignalement(s)}
                        style={{ 
                          borderColor: selectedSignalement?._id === s._id ? '#10b981' : isDarkMode ? '#1e293b' : '#e2e8f0',
                          background: isDarkMode ? '#121824' : 'white',
                          flexDirection: 'column',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: '800', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase',
                            background: s.statut === 'Résolu' ? '#dcfce7' : s.statut === 'En cours' ? '#eff6ff' : '#fffbeb',
                            color: s.statut === 'Résolu' ? '#10b981' : s.statut === 'En cours' ? '#3b82f6' : '#d97706'
                          }}>{s.statut}</span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '750' }}>📅 {s.date}</span>
                        </div>

                        <h4 style={{ fontSize: '1.1rem', fontWeight: '850', color: isDarkMode ? 'white' : '#0f172a', margin: '10px 0 4px 0' }}>
                          {s.titre}
                        </h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 12px 0', lineHeight: '1.45' }}>
                          {s.description}
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '4px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: '700' }}>
                            📍 Quartier : <strong>{s.quartier}</strong>
                          </span>
                          {s.statut !== 'Résolu' && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleResolveSignalement(s._id); }}
                              style={{ padding: '6px 12px', background: '#eafaf1', border: 'none', color: '#10b981', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer' }}
                            >
                              Marquer Résolu
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Interactive tracking map */}
                  <div className="interactive-map-frame-card" style={{ background: isDarkMode ? '#121824' : 'white', borderColor: isDarkMode ? '#1e293b' : '#e2e8f0' }}>
                    <div className="map-frame-header-premium" style={{ borderColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
                      <Map size={18} className="map-icon" />
                      <div>
                        <span className="map-title-main" style={{ color: isDarkMode ? 'white' : '#0f3c28' }}>Cartographie des Signalements Citoyens</span>
                        <span className="map-subtitle-sub">Dembéni, Département de Mayotte</span>
                      </div>
                    </div>

                    <div className="osm-iframe-wrapper">
                      <iframe 
                        title="Carte administrative de signalements"
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight="0" 
                        marginWidth="0" 
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenterLon-0.015}%2C${mapCenterLat-0.015}%2C${mapCenterLon+0.015}%2C${mapCenterLat+0.015}&amp;layer=mapnik&amp;marker=${mapCenterLat}%2C${mapCenterLon}`}
                        style={{ border: 'none' }}
                      />
                    </div>

                    <div className="map-frame-footer-actions" style={{ background: isDarkMode ? '#161e2e' : '#f8fafc', borderColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}>
                      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        📍 Centré sur : <strong>{selectedSignalement ? selectedSignalement.quartier : "Dembéni (Général)"}</strong>
                      </span>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 5: CMS PUBLICATIONS */}
            {activeTab === 'publications' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key="publications"
              >
                {/* CMS Header & Counters */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: '900', color: isDarkMode ? 'white' : '#0f3c28', margin: 0 }}>Centre de Gestion de Publications (CMS)</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>Toutes vos publications dynamiques apparaissent automatiquement sur les pages concernées du portail public.</p>
                  </div>
                  <button 
                    onClick={() => { setPublicationForm({ title: '', content: '', type: 'actualite', category: 'Général', image: '', status: 'published', isFeatured: false, isPinned: false, tags: '', eventDate: '', eventLocation: '' }); setCurrentModal('add_publication'); }}
                    className="btn-primary-gradient"
                    style={{ background: '#10b981', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)', padding: '10px 20px', fontWeight: 700 }}
                  >
                    <Plus size={16} /> Nouvelle Publication
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div style={{ background: isDarkMode ? '#121824' : 'white', padding: '20px', borderRadius: '16px', border: '1px solid', borderColor: isDarkMode ? '#1e293b' : '#e2e8f0', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>Type de contenu</label>
                    <select value={cmsTypeFilter} onChange={e => setCmsTypeFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: isDarkMode ? '#1a2333' : 'white', color: isDarkMode ? 'white' : '#1e293b', fontWeight: 700 }}>
                      <option value="all">Tous les types</option>
                      <option value="actualite">Actualité</option>
                      <option value="evenement">Événement</option>
                      <option value="projet">Projet communal</option>
                      <option value="annonce">Annonce</option>
                      <option value="information">Information publique</option>
                    </select>
                  </div>

                  <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>Catégorie</label>
                    <select value={cmsCategoryFilter} onChange={e => setCmsCategoryFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: isDarkMode ? '#1a2333' : 'white', color: isDarkMode ? 'white' : '#1e293b', fontWeight: 700 }}>
                      <option value="all">Toutes les catégories</option>
                      <option value="Général">Général</option>
                      <option value="Santé & Solidarité">Santé & Solidarité</option>
                      <option value="Environnement">Environnement</option>
                      <option value="Jeunesse">Jeunesse</option>
                      <option value="Culture">Culture</option>
                      <option value="Sécurité">Sécurité</option>
                      <option value="Services publics">Services publics</option>
                      <option value="Vie citoyenne">Vie citoyenne</option>
                      <option value="Urbanisme">Urbanisme</option>
                      <option value="Éducation">Éducation</option>
                      <option value="Développement local">Développement local</option>
                    </select>
                  </div>

                  <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
                    <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b' }}>Statut de visibilité</label>
                    <select value={cmsStatusFilter} onChange={e => setCmsStatusFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: isDarkMode ? '#1a2333' : 'white', color: isDarkMode ? 'white' : '#1e293b', fontWeight: 700 }}>
                      <option value="all">Tous les statuts</option>
                      <option value="published">Publiés</option>
                      <option value="draft">Brouillons</option>
                    </select>
                  </div>
                </div>

                {/* Publications Grid */}
                {filteredPublications.length === 0 ? (
                  <div style={{ background: isDarkMode ? '#121824' : 'white', borderRadius: '24px', padding: '60px', textAlign: 'center', border: '1px solid', borderColor: isDarkMode ? '#1e293b' : '#e2e8f0' }}>
                    <FileText size={48} style={{ color: '#cbd5e1', marginBottom: '16px' }} />
                    <h4 style={{ margin: '0', fontSize: '1.1rem', color: '#64748b', fontWeight: '800' }}>Aucune publication ne correspond à vos filtres de recherche.</h4>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                    {filteredPublications.map(pub => (
                      <div key={pub._id} style={{ background: isDarkMode ? '#121824' : 'white', borderRadius: '20px', border: '1px solid', borderColor: isDarkMode ? '#1e293b' : '#e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', textAlign: 'left', transition: 'all 0.3s ease' }}>
                        <div style={{ position: 'relative', height: '180px' }}>
                          <img src={pub.image || 'https://images.unsplash.com/photo-1541888062862-23f2ec4da240?auto=format&fit=crop&w=800&q=80'} alt={pub.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: '800', background: pub.status === 'published' ? '#dcfce7' : '#fee2e2', color: pub.status === 'published' ? '#10b981' : '#ef4444', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                              {pub.status === 'published' ? 'En ligne' : 'Brouillon'}
                            </span>
                            {pub.isPinned && (
                              <span style={{ fontSize: '0.65rem', fontWeight: '800', background: '#eff6ff', color: '#3b82f6', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>📌 Épinglé</span>
                            )}
                          </div>
                        </div>
                        <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                              {pub.type || 'CMS'}
                            </span>
                            <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: '4px' }}>
                              {pub.category || 'Général'}
                            </span>
                          </div>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: '850', color: isDarkMode ? 'white' : '#0f3c28', margin: '12px 0 6px 0' }}>{pub.title}</h4>
                          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', flex: 1 }}>{pub.content?.substring(0, 110)}...</p>
                          
                          {/* If type is evenement */}
                          {pub.type === 'evenement' && (
                            <div style={{ fontSize: '0.78rem', fontWeight: '750', background: isDarkMode ? '#1a2333' : '#f8fafc', padding: '10px', borderRadius: '8px', margin: '12px 0', border: '1px solid', borderColor: isDarkMode ? '#2e3b4e' : '#e2e8f0', color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                              <div>📅 Date : <strong>{pub.eventDate ? new Date(pub.eventDate).toLocaleDateString('fr-FR') : 'Non définie'}</strong></div>
                              <div style={{ marginTop: '2px' }}>📍 Lieu : <strong>{pub.eventLocation || 'Non renseigné'}</strong></div>
                            </div>
                          )}

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', borderTop: '1px solid', borderTopColor: isDarkMode ? '#1e293b' : '#f1f5f9', paddingTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
                            <button 
                              onClick={() => handleTogglePublishStatus(pub)}
                              style={{ padding: '6px 10px', background: pub.status === 'published' ? '#fee2e2' : '#dcfce7', border: 'none', borderRadius: '8px', color: pub.status === 'published' ? '#ef4444' : '#10b981', fontWeight: '800', fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              {pub.status === 'published' ? 'Dépublier' : 'Publier'}
                            </button>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                onClick={() => { setSelectedItem(pub); setPublicationForm({ title: pub.title, content: pub.content, type: pub.type, category: pub.category, image: pub.image, status: pub.status, isFeatured: pub.isFeatured || false, isPinned: pub.isPinned || false, tags: pub.tags ? pub.tags.join(', ') : '', eventDate: pub.eventDate ? pub.eventDate.substring(0, 10) : '', eventLocation: pub.eventLocation || '' }); setCurrentModal('edit_publication'); }}
                                style={{ padding: '6px 12px', border: '1px solid', borderColor: isDarkMode ? '#2e3b4e' : '#cbd5e1', background: 'transparent', borderRadius: '8px', color: isDarkMode ? '#cbd5e1' : '#475569', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Edit size={14} /> Éditer
                              </button>
                              <button 
                                onClick={() => handleDeletePublication(pub._id)}
                                style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Trash2 size={14} /> Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 6: SERVICES */}
            {activeTab === 'services' && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                key="services"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '850', color: isDarkMode ? 'white' : '#0f3c28', margin: 0 }}>Services sanitaires & sociaux</h3>
                  <button 
                    onClick={() => { setServiceForm({ title: '', desc: '', fullDesc: '', category: 'Soins', img: '', location: '', hours: '', phone: '', email: '', benefits: '' }); setCurrentModal('add_service'); }}
                    className="btn-primary-gradient"
                    style={{ background: '#10b981', boxShadow: 'none' }}
                  >
                    <Plus size={16} /> Créer un service
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                  {services.map(s => (
                    <div key={s._id} style={{ background: isDarkMode ? '#121824' : 'white', borderRadius: '20px', border: '1px solid', borderColor: isDarkMode ? '#1e293b' : '#e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                      <img src={s.img} alt={s.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#10b981', textTransform: 'uppercase' }}>{s.category}</span>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: isDarkMode ? 'white' : '#0f3c28', margin: '8px 0' }}>{s.title}</h4>
                        <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: '0 0 10px 0' }}>{s.desc}</p>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: 'auto', borderTop: '1px solid', borderTopColor: isDarkMode ? '#1e293b' : '#f1f5f9', paddingTop: '12px' }}>
                          <button 
                            onClick={() => { setSelectedItem(s); setServiceForm({ title: s.title, desc: s.desc, fullDesc: s.fullDesc, category: s.category, img: s.img, location: s.location || '', hours: s.hours || '', phone: s.phone || '', email: s.email || '', benefits: s.benefits ? s.benefits.join(', ') : '' }); setCurrentModal('edit_service'); }}
                            style={{ padding: '6px 12px', border: '1px solid', borderColor: isDarkMode ? '#2e3b4e' : '#cbd5e1', background: 'transparent', borderRadius: '8px', color: isDarkMode ? '#cbd5e1' : '#475569', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Edit size={14} /> Éditer
                          </button>
                          <button 
                            onClick={() => handleDeleteService(s._id)}
                            style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Trash2 size={14} /> Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}

      </main>

      {/* ==========================================
          MODALS ADMINISTRATIVES DE CRÉATION/ÉDITION
          ========================================== */}
      
      {/* 1. CMS PUBLICATIONS MODAL */}
      {(currentModal === 'add_publication' || currentModal === 'edit_publication') && (
        <div className="modal-overlay-admin" onClick={() => setCurrentModal(null)}>
          <div className="modal-card-admin animate-modal-in" style={{ maxWidth: '800px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header-admin" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 800, color: '#10b981', textTransform: 'uppercase' }}>Système Editorial Global</p>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 850, color: '#0f3c28' }}>
                  {currentModal === 'add_publication' ? 'Créer une nouvelle publication dynamique' : 'Modifier la publication dynamique'}
                </h3>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  type="button"
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                  style={{ padding: '6px 12px', background: isPreviewMode ? '#0f3c28' : 'transparent', border: '1px solid #0f3c28', color: isPreviewMode ? 'white' : '#0f3c28', borderRadius: '8px', fontWeight: '800', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  👁️ {isPreviewMode ? 'Mode Édition' : 'Prévisualiser'}
                </button>
                <button className="modal-close-btn-admin" onClick={() => { setCurrentModal(null); setIsPreviewMode(false); }}>
                  <X size={16} />
                </button>
              </div>
            </div>
            
            <form onSubmit={currentModal === 'add_publication' ? handleCreatePublication : handleUpdatePublication}>
              {isPreviewMode ? (
                /* LIVE PREVIEW SCHEME */
                <div style={{ padding: '24px', background: isDarkMode ? '#0f172a' : '#f8fafc', borderRadius: '12px', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '60vh', overflowY: 'auto', textAlign: 'left' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Aperçu en temps réel :</span>
                  
                  <div style={{ background: isDarkMode ? '#121824' : 'white', borderRadius: '20px', border: '1px solid', borderColor: isDarkMode ? '#1e293b' : '#e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxWidth: '400px', margin: '0 auto', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div style={{ position: 'relative', height: '200px' }}>
                      <img src={publicationForm.image || 'https://images.unsplash.com/photo-1541888062862-23f2ec4da240?auto=format&fit=crop&w=800&q=80'} alt="Aperçu" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: '800', background: '#dcfce7', color: '#10b981', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>En ligne</span>
                        {publicationForm.isPinned && (
                          <span style={{ fontSize: '0.65rem', fontWeight: '800', background: '#eff6ff', color: '#3b82f6', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>📌 Épinglé</span>
                        )}
                      </div>
                    </div>
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>{publicationForm.type}</span>
                        <span style={{ fontSize: '0.68rem', fontWeight: '800', color: '#3b82f6', background: 'rgba(59,130,246,0.1)', padding: '2px 8px', borderRadius: '4px' }}>{publicationForm.category}</span>
                      </div>
                      <h4 style={{ fontSize: '1.15rem', fontWeight: '850', color: isDarkMode ? 'white' : '#0f3c28', margin: '12px 0 6px 0' }}>{publicationForm.title || 'Sans titre'}</h4>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.5', margin: '0 0 16px 0' }}>{publicationForm.content || 'Aucun contenu rédigé pour le moment...'}</p>
                      
                      {publicationForm.type === 'evenement' && (
                        <div style={{ fontSize: '0.78rem', fontWeight: '750', background: isDarkMode ? '#1a2333' : '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid', borderColor: isDarkMode ? '#2e3b4e' : '#e2e8f0', color: isDarkMode ? '#cbd5e1' : '#475569', textAlign: 'left' }}>
                          <div>📅 Date : <strong>{publicationForm.eventDate ? new Date(publicationForm.eventDate).toLocaleDateString('fr-FR') : 'Non définie'}</strong></div>
                          <div style={{ marginTop: '2px' }}>📍 Lieu : <strong>{publicationForm.eventLocation || 'Non renseigné'}</strong></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* EDIT FORM */
                <div className="modal-body-admin" style={{ maxHeight: '65vh', overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                  <div className="modal-form-group">
                    <label>Titre de la publication *</label>
                    <input type="text" placeholder="Ex: Campagne de vaccination Dengue 2026" value={publicationForm.title} onChange={e => setPublicationForm({ ...publicationForm, title: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                  
                  <div className="modal-form-group double-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label>Type de publication</label>
                      <select value={publicationForm.type} onChange={e => setPublicationForm({ ...publicationForm, type: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: isDarkMode ? '#1a2333' : 'white', color: isDarkMode ? 'white' : '#1e293b' }}>
                        <option value="actualite">Actualité & Flash Infos</option>
                        <option value="evenement">Événement & Agenda</option>
                        <option value="projet">Projet Communal</option>
                        <option value="annonce">Annonce Officielle</option>
                        <option value="information">Information publique / Pratique</option>
                      </select>
                    </div>
                    <div>
                      <label>Catégorie</label>
                      <select value={publicationForm.category} onChange={e => setPublicationForm({ ...publicationForm, category: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: isDarkMode ? '#1a2333' : 'white', color: isDarkMode ? 'white' : '#1e293b' }}>
                        <option value="Général">Général</option>
                        <option value="Santé & Solidarité">Santé & Solidarité</option>
                        <option value="Environnement">Environnement</option>
                        <option value="Jeunesse">Jeunesse</option>
                        <option value="Culture">Culture</option>
                        <option value="Sécurité">Sécurité</option>
                        <option value="Services publics">Services publics</option>
                        <option value="Vie citoyenne">Vie citoyenne</option>
                        <option value="Urbanisme">Urbanisme</option>
                        <option value="Éducation">Éducation</option>
                        <option value="Développement local">Développement local</option>
                      </select>
                    </div>
                  </div>

                  {/* Date and Location only show if type === evenement */}
                  {publicationForm.type === 'evenement' && (
                    <div className="modal-form-group double-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'rgba(16,185,129,0.05)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(16,185,129,0.1)' }}>
                      <div>
                        <label>Date de l'événement *</label>
                        <input type="date" value={publicationForm.eventDate} onChange={e => setPublicationForm({ ...publicationForm, eventDate: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                      <div>
                        <label>Lieu de l'événement *</label>
                        <input type="text" placeholder="Ex: MJC de Dembéni" value={publicationForm.eventLocation} onChange={e => setPublicationForm({ ...publicationForm, eventLocation: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                    </div>
                  )}

                  <div className="modal-form-group">
                    <label>URL de l'image d'illustration</label>
                    <input type="text" placeholder="https://images.unsplash.com/..." value={publicationForm.image} onChange={e => setPublicationForm({ ...publicationForm, image: e.target.value })} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                    {publicationForm.image && (
                      <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden', height: '100px', width: '200px', border: '1px solid #cbd5e1' }}>
                        <img src={publicationForm.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                  </div>

                  <div className="modal-form-group">
                    <label>Contenu / Texte riche de la publication *</label>
                    <textarea rows="6" placeholder="Rédigez le texte officiel ici. Vous pouvez sauter des lignes pour aérer le document..." value={publicationForm.content} onChange={e => setPublicationForm({ ...publicationForm, content: e.target.value })} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: isDarkMode ? '#1a2333' : 'white', color: isDarkMode ? 'white' : '#1e293b' }} />
                  </div>

                  <div className="modal-form-group" style={{ background: isDarkMode ? '#1a2333' : '#f8fafc', padding: '14px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '12px', border: '1px solid', borderColor: isDarkMode ? '#2e3b4e' : '#e2e8f0', color: isDarkMode ? 'white' : '#1e293b', textAlign: 'left' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Paramètres d'affichage & Référencement</span>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
                        <input type="checkbox" checked={publicationForm.isPinned} onChange={e => setPublicationForm({ ...publicationForm, isPinned: e.target.checked })} />
                        📌 Épingler en haut des actualités
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>
                        <input type="checkbox" checked={publicationForm.isFeatured} onChange={e => setPublicationForm({ ...publicationForm, isFeatured: e.target.checked })} />
                        ⭐ Mettre à la Une de la Mairie
                      </label>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700 }}>Mots-clés / Tags (séparés par des virgules)</label>
                      <input type="text" placeholder="Ex: dengue, santé, prévention, dembeni" value={publicationForm.tags} onChange={e => setPublicationForm({ ...publicationForm, tags: e.target.value })} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: isDarkMode ? '#1a2333' : 'white', color: isDarkMode ? 'white' : '#1e293b' }} />
                    </div>
                  </div>

                  <div className="modal-form-group" style={{ textAlign: 'left' }}>
                    <label>Statut initial de publication</label>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '6px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                        <input type="radio" name="status" value="published" checked={publicationForm.status === 'published'} onChange={e => setPublicationForm({ ...publicationForm, status: e.target.value })} />
                        🟢 Publier immédiatement (Visible en ligne)
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}>
                        <input type="radio" name="status" value="draft" checked={publicationForm.status === 'draft'} onChange={e => setPublicationForm({ ...publicationForm, status: e.target.value })} />
                        🟠 Enregistrer en Brouillon (Aperçu Admin uniquement)
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="modal-footer-admin" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-admin-modal-cancel" onClick={() => { setCurrentModal(null); setIsPreviewMode(false); }}>Annuler</button>
                {!isPreviewMode && (
                  <button type="submit" className="btn-admin-modal-save" style={{ background: '#10b981', boxShadow: 'none' }}>
                    {publicationForm.status === 'published' ? 'Valider et Publier' : 'Enregistrer le Brouillon'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}



      {/* 3. SERVICES MODAL */}
      {(currentModal === 'add_service' || currentModal === 'edit_service') && (
        <div className="modal-overlay-admin" onClick={() => setCurrentModal(null)}>
          <div className="modal-card-admin animate-modal-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header-admin">
              <p>Équipements municipaux</p>
              <h3>{currentModal === 'add_service' ? 'Créer une fiche service' : 'Éditer la fiche service'}</h3>
              <button className="modal-close-btn-admin" onClick={() => setCurrentModal(null)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={currentModal === 'add_service' ? handleCreateService : handleUpdateService}>
              <div className="modal-body-admin">
                <div className="modal-form-group double-row">
                  <div>
                    <label>Nom du service *</label>
                    <input type="text" value={serviceForm.title} onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })} required />
                  </div>
                  <div>
                    <label>Catégorie</label>
                    <select value={serviceForm.category} onChange={e => setServiceForm({ ...serviceForm, category: e.target.value })}>
                      <option value="Soins">Soins</option>
                      <option value="Social">Social</option>
                      <option value="Prévention">Prévention</option>
                      <option value="Famille">Famille</option>
                      <option value="Aînés">Aînés</option>
                    </select>
                  </div>
                </div>
                <div className="modal-form-group">
                  <label>Accroche / Description courte *</label>
                  <input type="text" value={serviceForm.desc} onChange={e => setServiceForm({ ...serviceForm, desc: e.target.value })} required />
                </div>
                <div className="modal-form-group">
                  <label>Description complète détaillée</label>
                  <textarea rows="3" value={serviceForm.fullDesc} onChange={e => setServiceForm({ ...serviceForm, fullDesc: e.target.value })} />
                </div>
                <div className="modal-form-group double-row">
                  <div>
                    <label>Adresse physique</label>
                    <input type="text" value={serviceForm.location} onChange={e => setServiceForm({ ...serviceForm, location: e.target.value })} />
                  </div>
                  <div>
                    <label>Horaires réguliers</label>
                    <input type="text" value={serviceForm.hours} onChange={e => setServiceForm({ ...serviceForm, hours: e.target.value })} />
                  </div>
                </div>
                <div className="modal-form-group double-row">
                  <div>
                    <label>Ligne téléphonique</label>
                    <input type="text" value={serviceForm.phone} onChange={e => setServiceForm({ ...serviceForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label>E-mail de contact</label>
                    <input type="email" value={serviceForm.email} onChange={e => setServiceForm({ ...serviceForm, email: e.target.value })} />
                  </div>
                </div>
                <div className="modal-form-group">
                  <label>Image d'illustration URL</label>
                  <input type="text" value={serviceForm.img} onChange={e => setServiceForm({ ...serviceForm, img: e.target.value })} />
                </div>
                <div className="modal-form-group">
                  <label>Points forts (séparés par des virgules)</label>
                  <input type="text" placeholder="Ex: Gratuit, Sans rdv" value={serviceForm.benefits} onChange={e => setServiceForm({ ...serviceForm, benefits: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer-admin">
                <button type="button" className="btn-admin-modal-cancel" onClick={() => setCurrentModal(null)}>Annuler</button>
                <button type="submit" className="btn-admin-modal-save">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. RESPOND DEMANDE MODAL */}
      {currentModal === 'respond_demande' && selectedItem && (
        <div className="modal-overlay-admin" onClick={() => setCurrentModal(null)}>
          <div className="modal-card-admin animate-modal-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header-admin">
              <p>Guichet Unique</p>
              <h3>Décision sur la démarche citoyenne</h3>
              <button className="modal-close-btn-admin" onClick={() => setCurrentModal(null)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleRespondDemande}>
              <div className="modal-body-admin">
                <div style={{ background: isDarkMode ? '#1a2333' : '#f8fafc', padding: '14px', borderRadius: '12px', border: '1.5px solid #cbd5e1', marginBottom: '10px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase' }}>Objet du dossier</span>
                  <div style={{ fontWeight: '800', color: isDarkMode ? 'white' : '#1e293b', fontSize: '0.92rem', marginTop: '2px' }}>{selectedItem.title}</div>
                </div>

                <div className="modal-form-group">
                  <label>Statut de la décision</label>
                  <select value={respondForm.status} onChange={e => setRespondForm({ ...respondForm, status: e.target.value })}>
                    <option value="approved">Approuver & Signer le document</option>
                    <option value="rejected">Rejeter / Pièces manquantes</option>
                    <option value="pending">Laisser en attente</option>
                  </select>
                </div>

                <div className="modal-form-group">
                  <label>Message officiel transmis par e-mail *</label>
                  <textarea rows="5" placeholder="Indiquez au citoyen l'approbation, le lieu de retrait du document ou la raison précise du rejet..." value={respondForm.message} onChange={e => setRespondForm({ ...respondForm, message: e.target.value })} required />
                </div>
              </div>
              <div className="modal-footer-admin">
                <button type="button" className="btn-admin-modal-cancel" onClick={() => setCurrentModal(null)}>Annuler</button>
                <button type="submit" className="btn-admin-modal-save">Notifier le Citoyen</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
