import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Info, ArrowRight, Play, CheckCircle2, FileText, Trash2, Heart, Music, Users, 
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Newspaper, Image, Calendar, 
  Truck, Globe, CreditCard, Utensils, Baby, Palette, ClipboardList, ShieldAlert, Award,
  Landmark, MoreHorizontal, GraduationCap, Hammer, MapPin
} from 'lucide-react';
import { Link } from 'react-router-dom';

// 1. ERROR BOUNDARY - Empêche le crash global si une section échoue
class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error(`[Error Boundary] Crash intercepté dans la section ${this.props.sectionName || 'Inconnue'} :`, error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', margin: '20px auto', maxWidth: '800px', textAlign: 'center', background: '#fee2e2', color: '#991b1b', borderRadius: '16px', border: '1px solid #fca5a5' }}>
          <ShieldAlert size={48} style={{ margin: '0 auto 16px auto', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', fontWeight: 700 }}>Section momentanément indisponible</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Une erreur de rendu a été interceptée. Le reste du site continue de fonctionner normalement.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const Home = () => {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [eventIndex, setEventIndex] = useState(0);
  const [activeRuinsTab, setActiveRuinsTab] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState(null);
  const [activeCommuneTab, setActiveCommuneTab] = useState('mairie');
  const [showCommuneDetails, setShowCommuneDetails] = useState(false);
  const [activeModalTopic, setActiveModalTopic] = useState(null);

  const [allNewsItems, setAllNewsItems] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [isLoadingCMS, setIsLoadingCMS] = useState(true);
  const [cmsError, setCmsError] = useState(null);

  const nextEvent = () => {
    if (eventIndex < allEvents.length - 3) {
      setEventIndex(eventIndex + 1);
    }
  };

  const prevEvent = () => {
    if (eventIndex > 0) {
      setEventIndex(eventIndex - 1);
    }
  };

  const visibleEvents = allEvents.slice(eventIndex, eventIndex + 3);

  useEffect(() => {
    // Fetch publications for the dynamic CMS avec gestion sécurisée
    const fetchPublications = async () => {
      try {
        setIsLoadingCMS(true);
        const response = await fetch('http://localhost:4000/api/publications?status=published');
        
        if (!response.ok) {
          throw new Error(`API a répondu avec le statut ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.success && Array.isArray(data.data)) {
          // Séparer les événements des actualités pour l'affichage
          const events = data.data.filter(pub => pub.type === 'evenement');
          const news = data.data.filter(pub => pub.type !== 'evenement');
          
          setAllEvents(events);
          setAllNewsItems(news);
        } else {
          // Fallback silencieux si la donnée est mal formée
          setAllEvents([]);
          setAllNewsItems([]);
        }
      } catch (error) {
        console.error("Erreur critique lors de la récupération des publications CMS:", error);
        setCmsError(error.message);
      } finally {
        setIsLoadingCMS(false);
      }
    };
    
    fetchPublications();
  }, []);

  // Safe mapping des données pour éviter les TypeError sur les maps
  const safeNewsItems = Array.isArray(allNewsItems) ? allNewsItems : [];
  
  const filteredNews = activeCategory === 'Tous' 
    ? safeNewsItems 
    : safeNewsItems.filter(item => item && item.category === activeCategory);

  // Sécurisation stricte de la récupération pour éviter tout "Cannot read properties of null"
  const featuredItem = filteredNews && filteredNews.length > 0 
    ? (filteredNews.find(item => item && item.isFeatured) || filteredNews[0]) 
    : null;
    
  const secondaryItems = featuredItem && Array.isArray(filteredNews) 
    ? filteredNews.filter(item => item && item._id !== featuredItem._id).slice(0, 2) 
    : [];
    
  const sidebarItems = featuredItem && Array.isArray(safeNewsItems)
    ? safeNewsItems.filter(item => item && item._id !== featuredItem._id && !secondaryItems.some(sec => sec && sec._id === item._id)).slice(0, 3) 
    : [];

  const services = [
    { title: "Identité civile & ANTS", desc: "Suivez vos demandes et renouvellements de Passeport ou CNI en ligne.", icon: <CreditCard size={20} /> },
    { title: "Gestion environnementale", desc: "Planifiez la collecte d'encombrants et signalez une anomalie sur la voie publique.", icon: <Trash2 size={20} /> },
    { title: "Paiement cantine", desc: "Consultez les menus et réglez les factures de restauration scolaire en ligne.", icon: <Utensils size={20} /> },
    { title: "Petite Enfance & Crèche", desc: "Déposez votre dossier d'inscription en crèche et suivez les affectations.", icon: <Baby size={20} /> },
    { title: "Agenda territorial", desc: "Consultez les actions de prévention et inscrivez-vous aux ateliers.", icon: <Palette size={20} /> },
    { title: "Démarches administratives", desc: "Accédez instantanément au guichet virtuel pour vos requêtes civiles.", icon: <ClipboardList size={20} /> },
  ];

  const accordionItems = [
    {
      q: "Comment programmer un enlèvement d'encombrants à domicile ?",
      a: "Vous pouvez en faire la demande gratuitement depuis votre Espace Citoyen dans l'onglet 'Démarches'. Remplissez le formulaire de planification, sélectionnez le type d'encombrant et une date d'enlèvement vous sera communiquée sous 48 heures."
    },
    {
      q: "Quels types de déchets sont acceptés par le service ?",
      a: "Sont acceptés les appareils électroménagers hors d'usage, le mobilier usagé, les matelas et les cartons volumineux. Les gravats, produits chimiques et déchets verts doivent être déposés directement à la déchèterie."
    },
    {
      q: "Quels sont les jours de collecte ordinaires dans les quartiers ?",
      a: "La collecte des ordures ménagères s'effectue trois fois par semaine (Lundi, Mercredi et Vendredi matin). Veillez à sortir vos bacs la veille au soir à partir de 20 heures."
    },
    {
      q: "Comment contacter directement le Pôle Technique environnemental ?",
      a: "Vous pouvez contacter le service technique environnemental par courriel à contact.technique@dembeni.fr, ou par téléphone au 02 69 61 11 05 du lundi au vendredi."
    }
  ];

  const toggleAccordion = (index) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  return (
    <div className="home-page">
      
      {/* 1. CINEMATIC & IMMERSIVE MUNICIPAL HERO */}
      <section className="immersive-hero">
        <div className="hero-bg" />
        <div className="hero-overlay-gradient" />
        
        <div className="hero-content-all">
          <div className="hero-text-block">
            <h1 className="hero-title-main">
              Bienvenue sur le site officiel <br/>
              de la commune de <span className="highlight-text">DEMBENI</span>
            </h1>
            <p className="hero-desc-main">
              À travers cette plateforme numérique, la municipalité souhaite renforcer la proximité avec ses administrés, améliorer l'accès à l'information publique et faciliter les démarches administratives.
            </p>
            <div className="hero-btns-centered">
              <Link to="/actualites" className="btn-hero-pill-primary">
                <Newspaper size={18} className="btn-left-icon" />
                <span>Actualité</span>
                <ArrowRight size={16} className="btn-right-icon" />
              </Link>
              <Link to="/contact" className="btn-hero-pill-secondary">
                <MoreHorizontal size={18} className="btn-left-icon" />
                <span>Autres</span>
                <ArrowRight size={16} className="btn-right-icon" />
              </Link>
            </div>
          </div>
 
          {/* FLOATING GLASSMORPHIC INFO CARDS — CINEMATIC LAYOUT */}
          <div className="floating-cards-container">
            {/* Card 1: Hôtel de Ville — Vertical overlay design */}
            <div className="floating-card vertical-card">
              <img src="/mairie.jpg" alt="Hôtel de Ville" className="card-full-image" />
              <div className="card-footer-glass">
                <div className="card-footer-icon-circle">
                  <Landmark size={18} />
                </div>
                <div className="card-footer-text">
                  <span className="card-tag">ADMINISTRATION</span>
                  <p className="card-footer-desc">
                    Dembéni est une commune dynamique, riche de son histoire, engagée dans la transition et tournée vers l'avenir.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Card 2: Vie Locale — Wide community focus card */}
            <div className="floating-card wide-card">
              <img src="/groupe.jpg" alt="Vie Locale" className="card-full-image" />
              <div className="card-footer-glass">
                <div className="card-footer-icon-circle">
                  <Users size={18} />
                </div>
                <div className="card-footer-text">
                  <span className="card-tag">VIE CITOYENNE</span>
                  <p className="card-footer-desc">
                    Découvrez nos associations dynamiques, nos initiatives locales et participez activement à la vie citoyenne.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REFINED SERVICES SECTION */}
      <section className="services-section" style={{ paddingTop: '64px', paddingBottom: '64px' }}>
        <div className="section-header" style={{ marginBottom: '40px' }}>
          <div className="section-tag" style={{ background: '#eafaf1', color: '#16a34a', fontSize: '0.72rem', padding: '4px 12px', borderRadius: '20px', display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
            <Info size={12} /> Démarches en ligne
          </div>
          <h2 className="section-title-modern" style={{ fontSize: '1.8rem', fontWeight: 850, marginTop: '12px', color: '#0f3c28' }}>
            Vos démarches administratives <span>simplifiées :</span>
          </h2>
          <p className="section-subtitle-modern" style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '6px' }}>
            Accédez en quelques clics à l'ensemble de nos guichets numériques et suivez l'avancement de vos dossiers en temps réel.
          </p>
        </div>
        
        <div className="services-grid-modern" style={{ gap: '20px' }}>
          {services.map((s, i) => (
            <div key={i} className="service-card-modern" style={{ padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.01)' }}>
              <div className="service-card-icon-wrap" style={{ width: '44px', height: '44px', borderRadius: '12px', color: '#16a34a', background: '#eafaf1', marginBottom: '16px' }}>{s.icon}</div>
              <h3 className="service-card-title" style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f3c28', marginBottom: '8px' }}>{s.title}</h3>
              <p className="service-card-desc" style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.5, margin: '0 0 16px 0' }}>{s.desc}</p>
              <Link to="/demarches" className="service-card-btn" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
                Accéder au service <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3. MODERN IMMERSIVE INFO COMMUNE SECTION */}
      <section className="commune-info-section">
        <div className="commune-info-container">
          <div className="commune-info-grid">
            
            {/* LEFT AREA: Text & Details */}
            <div className="commune-info-left">
              <div className="commune-section-badge">
                <Landmark size={14} /> Institutionnel
              </div>
              <h2 className="commune-info-title">
                Dembéni, territoire de <span>vie et d'avenir au cœur de Mayotte</span>
              </h2>
              <p className="commune-info-text">
                Découvrez l'histoire, le patrimoine et la population de notre collectivité. La municipalité s'engage au quotidien pour offrir un cadre de vie durable, dynamique et proche de chacun de ses citoyens.
              </p>
              
              {/* Key Indicators Grid */}
              <div className="commune-indicators-grid">
                <div className="indicator-card">
                  <div className="indicator-header">
                    <Users size={18} className="indicator-icon" />
                    <span className="indicator-num">17 000+</span>
                  </div>
                  <span className="indicator-label">Habitants</span>
                </div>
                <div className="indicator-card">
                  <div className="indicator-header">
                    <Award size={18} className="indicator-icon" />
                    <span className="indicator-num">30+</span>
                  </div>
                  <span className="indicator-label">Associations</span>
                </div>
                <div className="indicator-card">
                  <div className="indicator-header">
                    <GraduationCap size={18} className="indicator-icon" />
                    <span className="indicator-num">1</span>
                  </div>
                  <span className="indicator-label">Université</span>
                </div>
              </div>
              
              {/* Toggle reveal button */}
              <button 
                onClick={() => setShowCommuneDetails(!showCommuneDetails)} 
                className={`commune-voir-plus-btn ${showCommuneDetails ? 'is-open' : ''}`}
                style={{ border: 'none', cursor: 'pointer' }}
              >
                <span>{showCommuneDetails ? "Fermer les informations" : "Infos de la commune"}</span>
                <div className="btn-circle-arrow" style={{ transform: showCommuneDetails ? 'rotate(90deg)' : 'none', transition: 'transform 0.3s ease' }}>
                  <ArrowRight size={16} />
                </div>
              </button>
            </div>

            {/* RIGHT AREA: Interactive Showcase Tabs & Image View */}
            <div className="commune-info-right">
              {/* Showcase Container */}
              <div className="showcase-card">
                {/* Main Selected Image */}
                <div className="showcase-image-wrapper">
                  {activeCommuneTab === 'mairie' && (
                    <img src="/mairie.jpg" alt="Hôtel de Ville" className="showcase-active-img" />
                  )}
                  {activeCommuneTab === 'jeunesse' && (
                    <img src="/news_workshop.png" alt="Jeunesse & Éducation" className="showcase-active-img" />
                  )}
                  {activeCommuneTab === 'lagon' && (
                    <img src="/beach_dembeni.png" alt="Littoral & Lagon" className="showcase-active-img" />
                  )}
                  {activeCommuneTab === 'projets' && (
                    <img src="/market_dembeni.png" alt="Projets & Développement" className="showcase-active-img" />
                  )}
                  
                  {/* Floating Glass Overlay Info */}
                  <div className="showcase-floating-overlay">
                    <div className="showcase-overlay-header">
                      {activeCommuneTab === 'mairie' && <span className="overlay-badge">ADMINISTRATION</span>}
                      {activeCommuneTab === 'jeunesse' && <span className="overlay-badge">ÉDUCATION & JEUNESSE</span>}
                      {activeCommuneTab === 'lagon' && <span className="overlay-badge">PATRIMOINE NATUREL</span>}
                      {activeCommuneTab === 'projets' && <span className="overlay-badge">DÉVELOPPEMENT URBAIN</span>}
                    </div>
                    <p className="showcase-overlay-desc">
                      {activeCommuneTab === 'mairie' && "L'Hôtel de Ville de Dembéni est le pôle de centralité des services communaux, engagé dans la proximité."}
                      {activeCommuneTab === 'jeunesse' && "Nous accompagnons nos jeunes et nos établissements scolaires pour bâtir le socle d'avenir de la commune."}
                      {activeCommuneTab === 'lagon' && "Le lagon et le littoral de Dembéni forment une réserve écologique précieuse et un joyau de biodiversité locale."}
                      {activeCommuneTab === 'projets' && "Les aménagements communaux modernes guident la structuration urbaine et dynamisent l'économie locale."}
                    </p>
                  </div>
                </div>

                {/* Tabs Selector List inside the showcase card */}
                <div className="showcase-tabs-bar">
                  <button 
                    className={`showcase-tab-btn ${activeCommuneTab === 'mairie' ? 'active' : ''}`}
                    onClick={() => setActiveCommuneTab('mairie')}
                  >
                    Hôtel de Ville
                  </button>
                  <button 
                    className={`showcase-tab-btn ${activeCommuneTab === 'jeunesse' ? 'active' : ''}`}
                    onClick={() => setActiveCommuneTab('jeunesse')}
                  >
                    Jeunesse & Éducation
                  </button>
                  <button 
                    className={`showcase-tab-btn ${activeCommuneTab === 'lagon' ? 'active' : ''}`}
                    onClick={() => setActiveCommuneTab('lagon')}
                  >
                    Lagon & Nature
                  </button>
                  <button 
                    className={`showcase-tab-btn ${activeCommuneTab === 'projets' ? 'active' : ''}`}
                    onClick={() => setActiveCommuneTab('projets')}
                  >
                    Projets Urbains
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* DYNAMIC REVEAL COMMUNE DETAILS PANEL */}
          {showCommuneDetails && (
            <div className="commune-expanded-content">
              <div className="expanded-grid">
                {/* Box 1: Histoire & Patrimoine */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/beach_dembeni.png" alt="Histoire & Patrimoine" className="expanded-card-img" />
                    <div className="expanded-card-tag">HISTOIRE & PATRIMOINE</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <Landmark size={18} className="card-icon-small" />
                      <h3>Richesse patrimoniale</h3>
                    </div>
                    <p>
                      Dembéni recèle d'incroyables richesses historiques, des vestiges médiévaux aux récits de l'océan Indien.
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'patrimoine',
                        title: 'Histoire & Patrimoine de Dembéni',
                        subtitle: 'Un passé prestigieux gravé dans la pierre',
                        image: '/beach_dembeni.png',
                        icon: <Landmark size={24} />,
                        text: "La commune de Dembéni abrite un patrimoine historique et archéologique exceptionnel. Ses sites témoignent d'une occupation humaine très ancienne et d'échanges intenses au sein de l'océan Indien. L'ancienne usine sucrière et les vestiges de mosquées du lagon constituent des pièces maîtresses de notre histoire locale que nous veillons à restaurer et valoriser.",
                        stats: [
                          { val: "IXe s.", label: "Origines" },
                          { val: "15 km", label: "Littoral" },
                          { val: "3", label: "Sites classés" }
                        ],
                        listTitle: "Grands projets patrimoniaux :",
                        list: [
                          "Restauration des ruines de l'usine sucrière historique.",
                          "Aménagement de sentiers d'interprétation écologique.",
                          "Sensibilisation scolaire à la protection du lagon marin."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Box 2: Vie Associative & Citoyenne */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/groupe.jpg" alt="Vie Associative & Citoyenneté" className="expanded-card-img" />
                    <div className="expanded-card-tag">CITOYENNETÉ & ASSOCIATIONS</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <Users size={18} className="card-icon-small" />
                      <h3>Cohésion citoyenne</h3>
                    </div>
                    <p>
                      Le réseau associatif dynamique anime les quartiers de Dembéni à travers le sport, la culture et l'aide intergénérationnelle.
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'association',
                        title: 'Vie Citoyenne & Associations',
                        subtitle: 'Un tissu associatif engagé au quotidien',
                        image: '/groupe.jpg',
                        icon: <Users size={24} />,
                        text: "Avec plus de 30 associations actives enregistrées dans la commune, le tissu social de Dembéni est d'un dynamisme rare. La municipalité apporte un soutien logistique, matériel et financier annuel conséquent pour accompagner ces initiatives de proximité. Les actions menées touchent à la fois l'intégration des jeunes, le soutien aux personnes âgées, l'animation sportive locale (football, basket-ball) et la préservation culturelle.",
                        stats: [
                          { val: "30+", label: "Associations" },
                          { val: "2 MJC", label: "Infrastructures" },
                          { val: "150+", label: "Bénévoles" }
                        ],
                        listTitle: "Actions citoyennes clés :",
                        list: [
                          "Soutien direct aux clubs sportifs amateurs de la commune.",
                          "Organisation annuelle du Forum des Associations de Dembéni.",
                          "Mise en place d'ateliers de cohésion sociale inter-quartiers."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Box 3: Éducation & Jeunesse */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/news_workshop.png" alt="Éducation & Jeunesse" className="expanded-card-img" />
                    <div className="expanded-card-tag">JEUNESSE & ÉDUCATION</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <GraduationCap size={18} className="card-icon-small" />
                      <h3>Avenir académique</h3>
                    </div>
                    <p>
                      Dembéni est le pôle d'excellence d'enseignement supérieur de l'île en hébergeant le Centre Universitaire de Mayotte (CUFR).
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'jeunesse',
                        title: 'Jeunesse & Éducation',
                        subtitle: 'Investir dans le savoir de nos futurs talents',
                        image: '/news_workshop.png',
                        icon: <GraduationCap size={24} />,
                        text: "Dembéni is le poumon éducatif et universitaire de Mayotte. En abritant le CUFR, elle accueille des milliers d'étudiants poursuivant des diplômes supérieurs. Parallèlement, la commune gère et modernise en permanence ses 12 écoles primaires et maternelles. L'accent est mis sur le plan numérique dans les classes, la rénovation des toitures scolaires et un service de restauration scolaire de qualité.",
                        stats: [
                          { val: "4 200", label: "Élèves" },
                          { val: "1 CUFR", label: "Pôle supérieur" },
                          { val: "12", label: "Écoles modernes" }
                        ],
                        listTitle: "Priorités éducatives municipales :",
                        list: [
                          "Plan d'équipement numérique et interactif des classes.",
                          "Rénovation complète des infrastructures et isolation thermique.",
                          "Renforcement de l'aide aux devoirs péri-éducative."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Box 4: Développement Local */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/market_dembeni.png" alt="Infrastructures & Urbanisme" className="expanded-card-img" />
                    <div className="expanded-card-tag">DÉVELOPPEMENT LOCAL</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <Hammer size={18} className="card-icon-small" />
                      <h3>Chantiers structurants</h3>
                    </div>
                    <p>
                      La restructuration urbaine, la sécurisation des voiries et l'éclairage vert transforment durablement la vie des quartiers.
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'urbanisme',
                        title: 'Développement Local & Urbanisme',
                        subtitle: 'Une métamorphose urbaine et durable',
                        image: '/market_dembeni.png',
                        icon: <Hammer size={24} />,
                        text: "La modernisation de Dembéni passe par des investissements urbains structurants. La municipalité met en œuvre son Plan Local d'Urbanisme (PLU) visant à créer des espaces de vie plus qualitatifs, des voiries sécurisées et à déployer un réseau d'éclairage public photovoltaïque moderne et durable. Ces chantiers contribuent activement à l'insertion professionnelle locale.",
                        stats: [
                          { val: "8", label: "Chantiers majeurs" },
                          { val: "100%", label: "Éclairage LED/Solaire" },
                          { val: "PLU", label: "Planifié" }
                        ],
                        listTitle: "Grands axes d'aménagement :",
                        list: [
                          "Réfection et sécurisation des axes de voirie communaux.",
                          "Aménagement d'une zone artisanale et de marchés couverts.",
                          "Modernisation des réseaux de collecte d'eaux pluviales."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Box 5: Environnement & Biodiversité */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/dembeni_lagon_aerial.jpg" alt="Environnement & Biodiversité" className="expanded-card-img" />
                    <div className="expanded-card-tag">ENVIRONNEMENT</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <Globe size={18} className="card-icon-small" />
                      <h3>Environnement préservé</h3>
                    </div>
                    <p>
                      Entre mangroves fertiles et récifs coralliens précieux, Dembéni protège activement sa biodiversité terrestre et marine.
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'biodiversite',
                        title: 'Environnement & Biodiversité',
                        subtitle: 'Protéger nos écosystèmes exceptionnels',
                        image: '/dembeni_lagon_aerial.jpg',
                        icon: <Globe size={24} />,
                        text: "Dembéni dispose d'un patrimoine écologique rare, caractérisé par de vastes mangroves indispensables à la reproduction marine et par un lagon exceptionnel. Consciente de cette richesse, la collectivité mène des politiques actives de préservation : opérations régulières de nettoyage participatif des plages, plantation d'espèces végétales stabilisatrices et lutte contre l'érosion des sols agricoles.",
                        stats: [
                          { val: "3", label: "Zones protégées" },
                          { val: "0 plastique", label: "Objectif plage" },
                          { val: "4", label: "Opérations / an" }
                        ],
                        listTitle: "Programmes environnementaux :",
                        list: [
                          "Campagnes citoyennes de reboisement et de végétalisation.",
                          "Nettoyage des lits de rivières et des plages côtières.",
                          "Partenariats de protection avec le Parc Naturel Marin."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Box 6: Culture & Traditions */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/news_concert.png" alt="Culture & Traditions" className="expanded-card-img" />
                    <div className="expanded-card-tag">CULTURE & TRADITIONS</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <Palette size={18} className="card-icon-small" />
                      <h3>Identité culturelle</h3>
                    </div>
                    <p>
                      Les danses folkloriques traditionnelles et l'artisanat local animent et façonnent l'identité forte de Mayotte.
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'culture',
                        title: 'Culture, Traditions & Identité',
                        subtitle: 'Faire vivre la mémoire et l\'art de Mayotte',
                        image: '/news_concert.png',
                        icon: <Palette size={24} />,
                        text: "L'identité culturelle de Dembéni s'exprime à travers ses chants traditionnels (Deba, Chigoma), son artisanat délicat et ses célébrations festives qui rythment l'année. La commune s'engage à faire vivre ce patrimoine immatériel auprès de la jeunesse en soutenant des ateliers artistiques réguliers et en finançant la programmation de festivals culturels.",
                        stats: [
                          { val: "10+", label: "Groupes Deba" },
                          { val: "1", label: "Festival annuel" },
                          { val: "5", label: "Ateliers jeunesse" }
                        ],
                        listTitle: "Soutien à la création culturelle :",
                        list: [
                          "Subventions aux groupes folkloriques traditionnels locaux.",
                          "Organisation de la fête communale annuelle de la musique.",
                          "Transmission intergénérationnelle du tressage traditionnel."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Box 7: Villages & Quartiers */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/groupe.jpg" alt="Villages & Quartiers de Dembéni" className="expanded-card-img" />
                    <div className="expanded-card-tag">QUARTIERS & TERRITOIRES</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <MapPin size={18} className="card-icon-small" />
                      <h3>Cinq villages unis</h3>
                    </div>
                    <p>
                      Dembéni regroupe cinq grands villages dynamiques : Tsararano, Iloni, Ongojou, Nyambadao, et Dembéni chef-lieu.
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'quartiers',
                        title: 'Villages & Territoires de Dembéni',
                        subtitle: 'Une union de terroirs et de cultures',
                        image: '/groupe.jpg',
                        icon: <MapPin size={24} />,
                        text: "La commune de Dembéni se caractérise par la richesse de ses cinq localités historiques. Du pôle urbain et universitaire en plein essor au calme verdoyant d'Ongojou ou d'Iloni, chaque village apporte sa contribution unique au dynamisme global de notre collectivité. La municipalité s'efforce de garantir un accès équitable aux services publics, équipements sportifs et infrastructures routières pour l'ensemble des habitants, sans distinction.",
                        stats: [
                          { val: "5", label: "Villages" },
                          { val: "Tsararano", label: "Pôle Scolaire" },
                          { val: "Iloni", label: "Faune & Flore" }
                        ],
                        listTitle: "Les cinq localités de la commune :",
                        list: [
                          "Dembéni Chef-lieu : Centre administratif et universitaire (CUFR).",
                          "Tsararano : Carrefour résidentiel et scolaire stratégique.",
                          "Iloni, Ongojou & Nyambadao : Havres côtiers et agricoles préservés."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Box 8: Chiffres Clés & Administration */}
                <div className="expanded-card">
                  <div className="expanded-card-image-wrap">
                    <img src="/mairie.jpg" alt="Chiffres Clés de Dembéni" className="expanded-card-img" />
                    <div className="expanded-card-tag">CHIFFRES CLÉS</div>
                  </div>
                  <div className="expanded-card-body">
                    <div className="expanded-card-title-row">
                      <Info size={18} className="card-icon-small" />
                      <h3>Dembéni en chiffres</h3>
                    </div>
                    <p>
                      Découvrez les données démographiques et administratives clés qui illustrent le développement de notre collectivité.
                    </p>
                    <button 
                      onClick={() => setActiveModalTopic({
                        id: 'chiffres',
                        title: 'Chiffres Clés & Vitalité de Dembéni',
                        subtitle: 'Une collectivité d\'avenir en pleine croissance',
                        image: '/mairie.jpg',
                        icon: <Info size={24} />,
                        text: "Dembéni est l'une des communes les plus dynamiques et attractives de Mayotte. Grâce à son positionnement géographique central et à sa population jeune et active, elle attire chaque année de nouveaux résidents et entrepreneurs. Voici les données clés qui guident nos politiques de développement pour répondre aux attentes de nos concitoyens.",
                        stats: [
                          { val: "17 000+", label: "Habitants" },
                          { val: "12", label: "Écoles maternelles/primaires" },
                          { val: "15 km", label: "De façade maritime" }
                        ],
                        listTitle: "Indicateurs de développement :",
                        list: [
                          "Plus de 30 associations locales subventionnées par an.",
                          "1 centre universitaire de référence accueillant des milliers d'étudiants.",
                          "100% de l'éclairage public modernisé en technologies écologiques (LED & Solaires)."
                        ]
                      })}
                      className="expanded-card-action-btn"
                    >
                      <span>En savoir plus</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* PORTAL MODAL DIALOG OVERLAY */}
        {activeModalTopic && (
          <div className="commune-portal-modal-backdrop" onClick={() => setActiveModalTopic(null)}>
            <div className="commune-portal-modal" onClick={(e) => e.stopPropagation()}>
              <button className="commune-modal-close-btn" onClick={() => setActiveModalTopic(null)}>
                &times;
              </button>
              <div className="commune-modal-grid">
                <div className="commune-modal-media">
                  <img src={activeModalTopic.image} alt={activeModalTopic.title} className="commune-modal-img" />
                  <div className="commune-modal-media-overlay">
                    <div className="commune-modal-icon-bubble">
                      {activeModalTopic.icon}
                    </div>
                    <span className="commune-modal-subtitle">{activeModalTopic.subtitle}</span>
                  </div>
                </div>
                <div className="commune-modal-info">
                  <h2>{activeModalTopic.title}</h2>
                  <p className="commune-modal-text">{activeModalTopic.text}</p>
                  
                  {/* Modal Sub-stats */}
                  <div className="commune-modal-stats">
                    {activeModalTopic.stats.map((s, idx) => (
                      <div key={idx} className="modal-stat-box">
                        <span className="modal-stat-val">{s.val}</span>
                        <span className="modal-stat-label">{s.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="commune-modal-list-section">
                    <h3>{activeModalTopic.listTitle}</h3>
                    <ul>
                      {activeModalTopic.list.map((item, idx) => (
                        <li key={idx}>
                          <span className="bullet-green">✓</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. PREMIUM NEWS SECTION WITH LIGHTWEIGHT CARDS */}
      <section className="news-section-premium">
        <div className="h-container">
          <div className="news-header-modern">
            <div className="news-header-icon">
              <Newspaper size={20} />
            </div>
            <h2 className="news-title-premium">
              L'actualité de <span>notre commune</span>
            </h2>
            <p className="news-subtitle-premium">
              Restez informé en temps réel des derniers événements, projets d'urbanisme et décisions de la municipalité de Dembéni.
            </p>
            <div className="news-filters-modern">
              {['Tous', 'Vie Municipale', 'Travaux', 'Événements', 'Culture'].map((f, i) => (
                <button 
                  key={i} 
                  className={`news-filter-btn ${activeCategory === f ? 'active' : ''}`}
                  onClick={() => setActiveCategory(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <SectionErrorBoundary sectionName="Actualités">
            {isLoadingCMS ? (
              <div className="news-layout-grid" style={{ minHeight: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', color: '#64748b' }}>
                  <div className="spinner" style={{ margin: '0 auto 16px', width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <p>Chargement des publications...</p>
                </div>
              </div>
            ) : cmsError ? (
              <div className="news-layout-grid" style={{ minHeight: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#fee2e2', borderRadius: '16px' }}>
                <p style={{ color: '#991b1b', fontWeight: 600 }}>Impossible de charger les actualités.</p>
              </div>
            ) : (
              <div className="news-layout-grid">
                <div className="news-main-column">
                  {featuredItem ? (
                    <div className="news-card-featured">
                      <img src={featuredItem.coverImage || featuredItem.image || '/placeholder.png'} alt={featuredItem.title} className="news-card-img" />
                      <div className="news-card-overlay" />
                      <div className="news-card-content">
                        <span className={`news-card-badge ${featuredItem.badgeClass || 'badge-yellow'}`}>
                          {featuredItem.category || 'Actualité'}
                        </span>
                        <span className="news-card-date">
                          {featuredItem.date || (featuredItem.createdAt ? new Date(featuredItem.createdAt).toLocaleDateString('fr-FR') : '')}
                        </span>
                        <h3 className="news-card-title-lg">{featuredItem.title}</h3>
                        <p className="news-card-desc-lg">{featuredItem.desc || featuredItem.content?.substring(0, 100) || ''}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="no-news-placeholder" style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', color: '#64748b' }}>
                      Aucune actualité disponible pour cette catégorie.
                    </div>
                  )}
                  
                  <div className="news-sub-grid">
                    {secondaryItems.map((item) => (
                      <div key={item._id || item.id || Math.random()} className="news-card-small">
                        <img src={item.coverImage || item.image || '/placeholder.png'} alt={item.title} className="news-card-img" />
                        <div className="news-card-overlay" />
                        <div className="news-card-content">
                          <span className={`news-card-badge ${item.badgeClass || 'badge-green'}`}>
                            {item.category || 'Information'}
                          </span>
                          <span className="news-card-date">
                            {item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : '')}
                          </span>
                          <h4 className="news-card-title-sm">{item.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="news-sidebar-premium">
                  <h3 className="sidebar-title-premium">À ne pas manquer</h3>
                  <div className="sidebar-items-list">
                    {sidebarItems.map((item) => (
                      <div 
                        key={item._id || item.id || Math.random()} 
                        className="sidebar-item-premium" 
                        onClick={() => setActiveCategory(item.category || 'Tous')}
                      >
                        <div className="sidebar-icon-wrap">
                          <Image size={16} />
                        </div>
                        <div className="sidebar-info">
                          <span className={`news-card-badge ${item.badgeClass || 'badge-cyan'} sidebar-badge`}>
                            {item.category || 'Brève'}
                          </span>
                          <h4 className="sidebar-item-title">{item.title}</h4>
                          <p className="sidebar-item-meta">
                            {item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR') : '')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </SectionErrorBoundary>

          <div className="news-footer-actions">
            <Link to="/actualites" className="btn-news-all">
              <span>Voir toutes les actualités</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. DYNAMIC MUNICIPAL EVENTS */}
      <section className="events-video-section" style={{ padding: '64px 0', background: 'white' }}>
        <div className="h-container">
          <div className="events-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', textAlign: 'left' }}>
            <div className="events-header-left-wrap" style={{ maxWidth: '680px' }}>
              <div className="section-tag-simple" style={{ background: '#f5f5f7', color: '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                <Calendar size={12} /> Agenda communal
              </div>
              <h2 className="events-title-modern" style={{ fontSize: '1.8rem', fontWeight: 850, marginTop: '12px', color: '#0f3c28' }}>Participez aux <span>événements</span> de Dembéni</h2>
              <p className="events-subtitle-modern" style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '6px', margin: 0 }}>
                Retrouvez l'agenda des rencontres citoyennes, culturelles, sportives et festives prévues dans vos quartiers.
              </p>
            </div>
            <div className="slider-arrows-premium" style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`slider-arrow-prem prev ${eventIndex === 0 ? 'inactive' : 'active'}`}
                onClick={prevEvent}
                disabled={eventIndex === 0}
                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                className={`slider-arrow-prem next ${eventIndex >= allEvents.length - 3 ? 'inactive' : 'active'}`}
                onClick={nextEvent}
                disabled={eventIndex >= allEvents.length - 3}
                style={{ width: '36px', height: '36px', borderRadius: '50%' }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
          
          <SectionErrorBoundary sectionName="Événements">
            <div className="events-grid-premium" style={{ gap: '20px' }}>
              {isLoadingCMS ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '20px', color: '#64748b' }}>
                  Chargement de l'agenda...
                </div>
              ) : cmsError ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#fee2e2', borderRadius: '20px', color: '#991b1b' }}>
                  L'agenda est momentanément indisponible.
                </div>
              ) : visibleEvents.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '20px', color: '#64748b' }}>
                  Aucun événement programmé pour le moment.
                </div>
              ) : (
                visibleEvents.map((item) => (
                  <div key={item._id || item.id || Math.random()} className="event-card-premium" style={{ borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', background: '#f8fafc', textAlign: 'left' }}>
                    <div className="event-media-premium" style={{ height: '160px', position: 'relative' }}>
                      <img src={item.coverImage || item.image || '/placeholder.png'} alt={item.title} className="event-img-premium" />
                      <div className="play-btn-glass" style={{ width: '36px', height: '36px' }}><Play size={14} fill="currentColor" /></div>
                    </div>
                    <div className="event-body-premium" style={{ padding: '20px' }}>
                      <div className="event-meta-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`event-badge-prem ${item.badgeClass || 'badge-purple'}`} style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px' }}>{item.category || 'Événement'}</span>
                        <span className="event-meta-date" style={{ fontSize: '0.72rem', color: '#64748b' }}>
                          {item.date || (item.eventDate ? new Date(item.eventDate).toLocaleDateString('fr-FR') : '')}
                        </span>
                      </div>
                      <h3 className="event-title-prem" style={{ fontSize: '1rem', fontWeight: 800, color: '#0f3c28', margin: '12px 0 6px 0' }}>{item.title}</h3>
                      <div className="event-meta-venue" style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 700 }}>📍 {item.venue || 'Dembéni'}</div>
                      <p className="event-desc-prem" style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.5, margin: '10px 0 16px 0' }}>
                        {item.desc || item.content?.substring(0, 80) || ''}
                      </p>
                      <Link to="/demarches" className="btn-learn-more-prem" style={{ fontSize: '0.8rem', fontWeight: 800, color: '#16a34a', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        En savoir plus <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </SectionErrorBoundary>
        </div>
      </section>

      {/* 6. WASTE ACCORDION SECTION */}
      <section className="waste-section-premium">
        <div className="h-container">
          <div className="waste-layout-grid">
            <div className="waste-info-content">
              <div className="waste-badge-pill">
                <Truck size={14} />
                <span>Salubrité & Environnement</span>
              </div>
              <h2 className="waste-title-main">
                Gestion des déchets & <span>cadre de vie</span>
              </h2>
              <p className="waste-desc-main">
                Afin de préserver la beauté exceptionnelle de notre lagon et de garantir la propreté de nos villages, la collectivité déploie des services de tri sélectif et d'enlèvement d'encombrants.
              </p>
              
              <div className="waste-accordion-list">
                {accordionItems.map((item, i) => (
                  <div key={i} className={`waste-accordion-card ${activeAccordion === i ? 'active' : ''}`}>
                    <div 
                      className="waste-accordion-header" 
                      onClick={() => toggleAccordion(i)}
                    >
                      <div className="waste-accordion-title">
                        <span>{item.q}</span>
                      </div>
                      <div className="waste-accordion-arrow">
                        <ChevronDown size={15} />
                      </div>
                    </div>
                    {activeAccordion === i && (
                      <div className="waste-accordion-body">
                        <p className="waste-accordion-text">{item.a}</p>
                        
                        {i === 0 && (
                          <div className="accordion-step-list">
                            <div className="accordion-step-item">
                              <span className="step-number">1</span>
                              <span><strong>Demande simplifiée :</strong> Remplissez le formulaire de planification en ligne en quelques clics.</span>
                            </div>
                            <div className="accordion-step-item">
                              <span className="step-number">2</span>
                              <span><strong>Validation :</strong> Notre pôle environnement vous confirme un créneau sous 48 heures.</span>
                            </div>
                            <div className="accordion-step-item">
                              <span className="step-number">3</span>
                              <span><strong>Passage :</strong> Déposez vos encombrants la veille au soir devant votre portail (dépôt sur voirie interdit).</span>
                            </div>
                          </div>
                        )}

                        {i === 1 && (
                          <div className="accordion-grid-list">
                            <div className="accordion-sub-panel">
                              <span className="panel-title green">Acceptés ✓</span>
                              <ul className="panel-items">
                                <li><span className="bullet-icon green">✓</span> Mobilier usagé (chaises, tables, lits)</li>
                                <li><span className="bullet-icon green">✓</span> Appareils électroménagers en panne</li>
                                <li><span className="bullet-icon green">✓</span> Cartons volumineux pliés</li>
                              </ul>
                            </div>
                            <div className="accordion-sub-panel">
                              <span className="panel-title red">Refusés ✗</span>
                              <ul className="panel-items">
                                <li><span className="bullet-icon red">✗</span> Gravats et résidus de chantiers</li>
                                <li><span className="bullet-icon red">✗</span> Déchets de jardinage (végétaux)</li>
                                <li><span className="bullet-icon red">✗</span> Piles, batteries, huiles et solvants</li>
                              </ul>
                            </div>
                          </div>
                        )}

                        {i === 2 && (
                          <div className="accordion-schedule-row">
                            <div className="schedule-badge-row">
                              <span className="schedule-days">Lundi, Mercredi, Vendredi matin</span>
                              <span className="schedule-sectors">Dembéni Chef-lieu, Tsararano, Iloni</span>
                            </div>
                            <div className="schedule-badge-row">
                              <span className="schedule-days">Mardi, Jeudi, Samedi matin</span>
                              <span className="schedule-sectors">Ongojou, Nyambadao</span>
                            </div>
                          </div>
                        )}

                        {i === 3 && (
                          <div className="accordion-step-list" style={{ marginTop: '8px' }}>
                            <div className="accordion-step-item">
                              <span>📞 <strong>Téléphone direct :</strong> 02 69 61 11 05 (Secrétariat technique)</span>
                            </div>
                            <div className="accordion-step-item">
                              <span>✉️ <strong>Courriel :</strong> environnement@dembeni.fr</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="waste-actions-row">
                <Link to="/demarches" className="btn-waste-action">
                  <span>Demander une collecte</span>
                  <ArrowRight size={16} />
                </Link>
                <Link to="/contact" className="btn-waste-secondary">
                  <span>Nous contacter</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            
            <div className="waste-visual-collage">
              <div className="waste-collage-image-card">
                <img src="/waste_collection_premium.png" alt="Service public de salubrité à Dembéni" />
                <div className="collage-overlay" />
                <div className="collage-caption-box">
                  <span className="collage-tag">Action Municipale</span>
                  <h3 className="collage-heading">Service public de proximité</h3>
                  <p className="collage-text">
                    Nos agents municipaux et nos équipes de collecte interviennent chaque jour dans tous nos quartiers pour maintenir un cadre de vie propre, sain et accueillant pour tous.
                  </p>
                </div>
              </div>
              
              <div className="waste-stats-badges-grid">
                <div className="waste-stat-badge">
                  <span className="waste-stat-number">450 T</span>
                  <span className="waste-stat-label">Recyclées / an</span>
                </div>
                <div className="waste-stat-badge">
                  <span className="waste-stat-number">98%</span>
                  <span className="waste-stat-label">Régularité</span>
                </div>
                <div className="waste-stat-badge">
                  <span className="waste-stat-number">48h</span>
                  <span className="waste-stat-label">Confirmation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. RECEPTION & PUBLIC SERVICE SECTION */}
      <section className="public-service-section" style={{ padding: '64px 0', background: 'white' }}>
        <div className="h-container">
          <div className="ps-banner" style={{ borderRadius: '24px', overflow: 'hidden', padding: '32px', background: '#0b1528' }}>
            <div className="ps-content" style={{ textAlign: 'left' }}>
              <div className="ps-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '24px' }}>
                <div className="ps-title-row" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="news-header-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={18} /></div>
                  <h2 className="ps-title" style={{ fontSize: '1.4rem', fontWeight: 850, color: 'white', margin: 0 }}>Services Municipaux & Administration</h2>
                </div>
                <h3 className="ps-subtitle" style={{ fontSize: '0.88rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '8px', margin: 0 }}>
                  À votre service au quotidien
                </h3>
              </div>
              <div className="ps-body-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px', alignItems: 'center' }}>
                <div className="ps-text" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, margin: 0 }}>
                    Les agents de la Mairie de Dembéni vous accompagnent dans toutes vos démarches administratives, de l'état civil aux inscriptions scolaires en passant par les aides du CCAS.
                  </p>
                  <p style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.78)', lineHeight: 1.6, margin: 0 }}>
                    Nous mettons tout en œuvre pour vous offrir un accueil chaleureux et des réponses rapides pour faciliter votre intégration et vos projets sur notre territoire.
                  </p>
                </div>
                <div className="ps-image-card" style={{ height: '180px', borderRadius: '16px', overflow: 'hidden' }}>
                  <img src="https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80" alt="Mairie de Dembéni" className="ps-img" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CULTURE & PATRIMOINE HISTORIQUE */}
      <section className="culture-section" style={{ padding: '64px 0', background: '#f8fafc' }}>
        <div className="h-container">
          <div style={{ textAlign: 'center' }}>
            <div className="section-tag-simple" style={{ background: '#faf5ff', color: '#7c3aed', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
              <Globe size={12} /> Culture & Patrimoine
            </div>
            <h2 className="presentation-title" style={{ fontSize: '1.8rem', fontWeight: 850, marginTop: '12px', color: '#0f3c28' }}>
              Un comptoir commercial médiéval unique
            </h2>
            <p className="presentation-text" style={{ maxWidth: '750px', margin: '8px auto 0 auto', fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6 }}>
              Dembéni abrite l'un des sites archéologiques les plus importants des Comores et de la côte orientale de l'Afrique, témoignant de sa place de carrefour commercial dès le IXe siècle.
            </p>
          </div>
          
          <div className="culture-filters" style={{ gap: '8px', justifyContent: 'center', marginTop: '24px' }}>
            {[
              { label: 'Site de Dembéni', desc: "Le site abrite les vestiges d'une ancienne cité fortifiée commerciale d'importance majeure." },
              { label: 'Comptoir Commercial', desc: "Des poteries de Chine et d'Iran retrouvées témoignent des échanges florissants dans l'océan Indien." },
              { label: 'Fouilles & Conservation', desc: "Les fouilles révèlent d'anciennes mosquées et fours de potiers préservés pour l'avenir." }
            ].map((tab, idx) => (
              <button 
                key={idx} 
                className={`news-filter-btn ${activeRuinsTab === idx ? 'active' : ''}`}
                onClick={() => setActiveRuinsTab(idx)}
                style={{ padding: '6px 14px', fontSize: '0.78rem', borderRadius: '8px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="ruins-img-card" style={{ height: '360px', borderRadius: '20px', overflow: 'hidden', position: 'relative', marginTop: '24px' }}>
            <img src="https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1200&q=80" alt="Ruins" className="ruins-img" />
          </div>
          
          <p className="ruins-caption" style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700, marginTop: '14px', maxWidth: '800px', margin: '14px auto 0 auto' }}>
            💡 <strong>Détail historique :</strong> {[
              "Le site abrite les vestiges d'une ancienne cité fortifiée commerciale d'importance majeure.",
              "Des poteries de Chine et d'Iran retrouvées témoignent des échanges florissants dans l'océan Indien dès le IXe siècle.",
              "Les fouilles révèlent d'anciennes mosquées et fours de potiers préservés pour faire rayonner la culture de l'île."
            ][activeRuinsTab]}
          </p>
        </div>
      </section>

      {/* 9. HEALTH AND SOLIDARITY SECTION */}
      <section className="h-container" style={{ paddingTop: '64px', paddingBottom: '64px' }}>
        <div className="pink-section" style={{ borderRadius: '24px', overflow: 'hidden', display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', background: '#fff0f6', border: '1px solid #ffdeeb' }}>
          <div className="pink-content" style={{ padding: '36px', textAlign: 'left' }}>
            <div className="section-tag-simple" style={{ background: '#fce7f3', color: '#be185d', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', display: 'inline-flex', gap: '6px', alignItems: 'center' }}><Heart size={12} /> Solidarité & Santé</div>
            <h2 className="pink-title" style={{ fontSize: '1.8rem', fontWeight: 850, marginTop: '12px', color: '#9d174d' }}>
              Dembéni se mobilise pour <span>la santé publique</span>
            </h2>
            <p className="pink-desc" style={{ fontSize: '0.88rem', color: '#be185d', lineHeight: 1.6, marginTop: '8px', marginBottom: '24px' }}>
              Chaque année, la commune organise des marches solidaires et des ateliers d'information pour la prévention des maladies et le soutien aux familles en partenariat avec le CCAS.
            </p>
            <div className="pink-btns" style={{ display: 'flex', gap: '12px' }}>
              <Link to="/services" className="btn-pink-dark" style={{ background: '#be185d', color: 'white', padding: '10px 24px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
                Nos services santé
              </Link>
              <Link to="/contact" className="btn-pink-light" style={{ background: 'white', color: '#be185d', border: '1px solid #ffc2d9', padding: '10px 24px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, textDecoration: 'none' }}>
                Prendre contact
              </Link>
            </div>
          </div>
          <div className="pink-visual" style={{ background: "url('https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80') center/cover" }} />
        </div>
      </section>

      {/* 10. SOCIAL & ASSOCIATIVE LIFE */}
      <section className="social-associative-section" style={{ padding: '64px 0', background: 'white' }}>
        <div className="h-container">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div className="section-tag-simple" style={{ background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontSize: '0.72rem', display: 'inline-flex', gap: '6px', alignItems: 'center' }}><Users size={12} /> Vie sociale & associative</div>
            <h2 className="presentation-title" style={{ fontSize: '1.8rem', fontWeight: 850, marginTop: '12px', color: '#0f3c28' }}>
              Un tissu associatif actif et soudé
            </h2>
            <p className="presentation-text" style={{ maxWidth: '750px', margin: '8px auto 0 auto', fontSize: '0.88rem', color: '#64748b', lineHeight: 1.6 }}>
              La commune de Dembéni soutient plus de 30 associations locales oeuvrant pour la cohésion sociale, l'encadrement des jeunes et l'éveil culturel.
            </p>
          </div>

          <div className="presentation-layout" style={{ marginTop: '32px', gap: '32px', gridTemplateColumns: '1fr 1fr', alignItems: 'center' }}>
            <div className="presentation-images" style={{ height: '300px', borderRadius: '16px', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80" alt="Association" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="presentation-content" style={{ textAlign: 'left' }}>
              <div className="presentation-text">
                <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  Afin de soutenir ce dynamisme, la commune alloue des subventions d'équipement et met à disposition plusieurs salles communales et terrains sportifs. Ces actions permettent d'impliquer notre jeunesse dans des projets d'utilité publique.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="main-footer" style={{ background: '#0b1528', color: 'white', padding: '48px 0 24px 0' }}>
        <div className="h-container">
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'left', marginBottom: '32px' }}>
            <div className="footer-brand">
              <h2 className="footer-logo" style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981', margin: '0 0 12px 0' }}>DEMBÉNI MAIRIE</h2>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: 0 }}>Site portail officiel de la commune de Dembéni, Mayotte. Accès aux démarches 24h/24.</p>
            </div>
            <div className="footer-links-group">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', marginBottom: '12px' }}>Mairie</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><Link to="/demarches" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textDecoration: 'none' }}>Démarches civiles</Link></li>
                <li><Link to="/services" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textDecoration: 'none' }}>Pôle Santé</Link></li>
                <li><Link to="/contact" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textDecoration: 'none' }}>Contact & Horaires</Link></li>
              </ul>
            </div>
            <div className="footer-links-group">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', marginBottom: '12px' }}>Découvrir</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li><Link to="/actualites" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textDecoration: 'none' }}>Dernières infos</Link></li>
                <li><Link to="/demarches" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textDecoration: 'none' }}>Espace Citoyen</Link></li>
              </ul>
            </div>
            <div className="footer-links-group">
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', marginBottom: '12px' }}>Hôtel de Ville</h4>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', margin: '0 0 6px 0' }}>1 Rue de la Mairie, 97660 Dembéni</p>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', margin: 0 }}>Standard : 02 69 61 11 00</p>
            </div>
          </div>
          
          <div className="footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>&copy; 2026 Ville de Dembéni. Tous droits réservés.</p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>Plateforme de Smart City • République Française</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
