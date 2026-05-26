
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, Loader2, Mail, Lock, ArrowRight, Home, User, Phone, 
  MapPin, Image, CheckCircle, ChevronRight, Info, AlertCircle, Building, Users, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  // Auto-detect route to activate correct form tab
  const isRegisterRoute = location.pathname === '/register';
  const [activeTab, setActiveTab] = useState(isRegisterRoute ? 'register' : 'login');

  // Input states
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    quartier: '',
    profileImage: ''
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [isRegistered, setIsRegistered] = useState(false);

  // Sync tab with URL changes
  useEffect(() => {
    setActiveTab(location.pathname === '/register' ? 'register' : 'login');
    setMsg({ type: '', text: '' });
  }, [location.pathname]);

  const onLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
  const onRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await axios.post('http://localhost:4000/api/auth/login', loginData);
      const { token, ...userData } = res.data.data;
      
      login(token, userData);
      setMsg({ type: 'success', text: 'Connexion réussie ! Redirection...' });
      
      setTimeout(() => {
        if (userData.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/compte');
        }
      }, 900);
    } catch (err) {
      setMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Identifiants incorrects ou compte toujours en attente de validation.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    if (registerData.password !== registerData.confirmPassword) {
      setMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:4000/api/auth/register', {
        firstname: registerData.firstname,
        lastname: registerData.lastname,
        email: registerData.email,
        phone: registerData.phone,
        password: registerData.password,
        address: registerData.address,
        quartier: registerData.quartier,
        profileImage: registerData.profileImage
      });

      setIsRegistered(true);
      setRegisterData({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        address: '',
        quartier: '',
        profileImage: ''
      });
    } catch (err) {
      setMsg({ 
        type: 'error', 
        text: err.response?.data?.message || 'Une erreur est survenue lors de l\'inscription.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-portal-fullscreen">
      <div className="auth-portal-wrapper">
        <div className="auth-portal-card-main">
          
          {/* LEFT PANE - INSTITUTIONAL DISPLAY */}
          <div className="auth-pane-left">
            <div className="pane-image-overlay" />
            
            <div className="pane-content-wrap">
              <Link to="/" className="pane-logo-badge">
                <span className="logo-letter">D</span>
                <span className="logo-label">DEMBÉNI</span>
              </Link>
              
              <div className="pane-welcome-text">
                <span className="pane-tag">PORTAIL CITOYEN OFFICIEL</span>
                <h1 className="pane-title">Votre mairie numérique, plus proche de vous.</h1>
                <p className="pane-subtitle">
                  Accédez instantanément à l'ensemble de vos démarches administratives, suivez l'avancement de vos dossiers et échangez directement avec les agents communaux.
                </p>
              </div>

              {/* Informational features grid */}
              <div className="pane-features-grid">
                <div className="pane-feature-item">
                  <div className="feature-icon-circle">
                    <Building size={20} />
                  </div>
                  <div>
                    <h4 className="feature-item-title">Guichet Unique</h4>
                    <p className="feature-item-desc">Actes d'état civil, urbanisme et CCAS 100% numérisés.</p>
                  </div>
                </div>

                <div className="pane-feature-item">
                  <div className="feature-icon-circle">
                    <Users size={20} />
                  </div>
                  <div>
                    <h4 className="feature-item-title">Espace Communal Humain</h4>
                    <p className="feature-item-desc">Un accompagnement de proximité pour tous les habitants.</p>
                  </div>
                </div>

                <div className="pane-feature-item">
                  <div className="feature-icon-circle">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h4 className="feature-item-title">Sécurité & Confidentialité</h4>
                    <p className="feature-item-desc">Vos données personnelles chiffrées et protégées conformément au RGPD.</p>
                  </div>
                </div>
              </div>

              <div className="pane-footer-text">
                © {new Date().getFullYear()} Mairie de Dembéni • Département de Mayotte.
              </div>
            </div>
          </div>

          {/* RIGHT PANE - AUTHENTICATION FORM CONTROLLER */}
          <div className="auth-pane-right">
            
            {/* Success screen on registration approval status */}
            {isRegistered ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="registration-success-container"
              >
                <div className="success-lottie-badge">
                  <div className="success-ring" />
                  <CheckCircle size={48} className="success-icon-active" />
                </div>
                
                <h2 className="success-title">Inscription Enregistrée !</h2>
                <p className="success-desc">
                  Votre demande de création d'espace citoyen a bien été reçue par le service d'état civil de Dembéni.
                </p>
                
                <div className="success-info-card">
                  <Info size={18} className="success-info-icon" />
                  <p className="success-info-text">
                    Votre compte citoyen est en attente de validation par l'administration de Dembéni. Vous recevrez une notification par email dès confirmation.
                  </p>
                </div>

                <button 
                  onClick={() => { setIsRegistered(false); setActiveTab('login'); }}
                  className="btn-success-back"
                >
                  Retour à la page de connexion
                </button>
              </motion.div>
            ) : (
              <div className="auth-form-container-scroll">
                
                {/* Form header */}
                <div className="auth-form-header">
                  <h2 className="form-portal-title">Bienvenue</h2>
                  <p className="form-portal-subtitle">Authentifiez-vous pour gérer votre espace numérique.</p>
                </div>

                {/* SLIDER TABS SYSTEM */}
                <div className="auth-tabs-slider-wrapper">
                  <div className="auth-tabs-slider">
                    <div className={`slider-active-indicator ${activeTab === 'register' ? 'slide-right' : ''}`} />
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('login')} 
                      className={`auth-tab-btn ${activeTab === 'login' ? 'active' : ''}`}
                    >
                      Connexion
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('register')} 
                      className={`auth-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
                    >
                      Créer un compte
                    </button>
                  </div>
                </div>

                {/* Form notifications alert */}
                {msg.text && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`auth-alert-banner ${msg.type === 'error' ? 'error' : 'success'}`}
                  >
                    {msg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                    <span>{msg.text}</span>
                  </motion.div>
                )}

                {/* SWITCHABLE FORMS CONTAINER */}
                <AnimatePresence mode="wait">
                  {activeTab === 'login' ? (
                    
                    /* FORM A: LOGIN */
                    <motion.form 
                      key="login-form"
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 15 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={handleLoginSubmit}
                      className="auth-reactive-form"
                    >
                      <div className="auth-input-group">
                        <label className="auth-input-label">Adresse E-mail</label>
                        <div className="auth-field-wrapper">
                          <Mail className="field-icon-active" size={18} />
                          <input 
                            type="email" 
                            name="email"
                            className="auth-styled-input"
                            value={loginData.email}
                            onChange={onLoginChange}
                            required
                            placeholder="nom@email.com"
                            autoComplete="email"
                          />
                        </div>
                      </div>

                      <div className="auth-input-group">
                        <label className="auth-input-label">Mot de passe</label>
                        <div className="auth-field-wrapper">
                          <Lock className="field-icon-active" size={18} />
                          <input 
                            type="password" 
                            name="password"
                            className="auth-styled-input"
                            value={loginData.password}
                            onChange={onLoginChange}
                            required
                            placeholder="••••••••"
                            autoComplete="current-password"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="btn-auth-submit-gradient" 
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-spin" size={20} />
                        ) : (
                          <>Se connecter <ArrowRight size={18} /></>
                        )}
                      </button>
                    </motion.form>
                  ) : (
                    
                    /* FORM B: REGISTRATION */
                    <motion.form 
                      key="register-form"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.25 }}
                      onSubmit={handleRegisterSubmit}
                      className="auth-reactive-form"
                    >
                      <div className="input-grid-double">
                        <div className="auth-input-group">
                          <label className="auth-input-label">Prénom</label>
                          <div className="auth-field-wrapper">
                            <User className="field-icon-active" size={18} />
                            <input 
                              type="text" 
                              name="firstname"
                              className="auth-styled-input"
                              value={registerData.firstname}
                              onChange={onRegisterChange}
                              required
                              placeholder="Ahmed"
                            />
                          </div>
                        </div>

                        <div className="auth-input-group">
                          <label className="auth-input-label">Nom</label>
                          <div className="auth-field-wrapper">
                            <User className="field-icon-active" size={18} />
                            <input 
                              type="text" 
                              name="lastname"
                              className="auth-styled-input"
                              value={registerData.lastname}
                              onChange={onRegisterChange}
                              required
                              placeholder="Abdou"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="input-grid-double" style={{ marginTop: '12px' }}>
                        <div className="auth-input-group">
                          <label className="auth-input-label">E-mail</label>
                          <div className="auth-field-wrapper">
                            <Mail className="field-icon-active" size={18} />
                            <input 
                              type="email" 
                              name="email"
                              className="auth-styled-input"
                              value={registerData.email}
                              onChange={onRegisterChange}
                              required
                              placeholder="nom@email.com"
                            />
                          </div>
                        </div>

                        <div className="auth-input-group">
                          <label className="auth-input-label">Téléphone</label>
                          <div className="auth-field-wrapper">
                            <Phone className="field-icon-active" size={18} />
                            <input 
                              type="tel" 
                              name="phone"
                              className="auth-styled-input"
                              value={registerData.phone}
                              onChange={onRegisterChange}
                              placeholder="06 39 xx xx xx"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="input-grid-double" style={{ marginTop: '12px' }}>
                        <div className="auth-input-group">
                          <label className="auth-input-label">Mot de passe</label>
                          <div className="auth-field-wrapper">
                            <Lock className="field-icon-active" size={18} />
                            <input 
                              type="password" 
                              name="password"
                              className="auth-styled-input"
                              value={registerData.password}
                              onChange={onRegisterChange}
                              required
                              placeholder="••••••••"
                            />
                          </div>
                        </div>

                        <div className="auth-input-group">
                          <label className="auth-input-label">Confirmation</label>
                          <div className="auth-field-wrapper">
                            <Lock className="field-icon-active" size={18} />
                            <input 
                              type="password" 
                              name="confirmPassword"
                              className="auth-styled-input"
                              value={registerData.confirmPassword}
                              onChange={onRegisterChange}
                              required
                              placeholder="••••••••"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="input-grid-double" style={{ marginTop: '12px' }}>
                        <div className="auth-input-group">
                          <label className="auth-input-label">Adresse de résidence</label>
                          <div className="auth-field-wrapper">
                            <MapPin className="field-icon-active" size={18} />
                            <input 
                              type="text" 
                              name="address"
                              className="auth-styled-input"
                              value={registerData.address}
                              onChange={onRegisterChange}
                              required
                              placeholder="Rue du dispensaire, Dembéni"
                            />
                          </div>
                        </div>

                        <div className="auth-input-group">
                          <label className="auth-input-label">Quartier</label>
                          <div className="auth-field-wrapper">
                            <MapPin className="field-icon-active" size={18} />
                            <select 
                              name="quartier"
                              className="auth-styled-input"
                              value={registerData.quartier}
                              onChange={onRegisterChange}
                              required
                              style={{ appearance: 'auto', paddingLeft: '2.5rem' }}
                            >
                              <option value="">Quartier...</option>
                              <option value="Dembéni Centre">Dembéni Centre</option>
                              <option value="Tsararano">Tsararano</option>
                              <option value="Iloni">Iloni</option>
                              <option value="Ongojou">Ongojou</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="auth-input-group" style={{ marginTop: '12px' }}>
                        <label className="auth-input-label">Lien photo de profil (optionnel)</label>
                        <div className="auth-field-wrapper">
                          <Image className="field-icon-active" size={18} />
                          <input 
                            type="text" 
                            name="profileImage"
                            className="auth-styled-input"
                            value={registerData.profileImage}
                            onChange={onRegisterChange}
                            placeholder="https://images.unsplash.com/photo-xxx"
                          />
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="btn-auth-submit-gradient" 
                        disabled={loading}
                        style={{ marginTop: '24px' }}
                      >
                        {loading ? (
                          <Loader2 className="h-spin" size={20} />
                        ) : (
                          <>Finaliser mon inscription <ArrowRight size={18} /></>
                        )}
                      </button>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Back Link */}
                <div className="auth-back-link-wrapper">
                  <Link to="/" className="auth-back-link">
                    <Home size={14} /> Retour à la page d'accueil
                  </Link>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
