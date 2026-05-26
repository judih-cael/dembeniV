import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import UserLogin from './components/UserLogin';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import Contact from './components/Contact';
import SubPage from './components/SubPage';
import NewsPage from './components/NewsPage';
import SantePage from './components/SantePage';
import { FileText, Hammer, Briefcase, Globe, Heart, Shield } from 'lucide-react';

function App() {
  const demarchesData = [
    { title: 'État Civil', description: 'Actes de naissance, mariage, décès et livret de famille.', icon: <FileText size={24}/> },
    { title: 'Identité', description: 'Demandes de passeport et carte nationale d\'identité.', icon: <Shield size={24}/> },
    { title: 'Urbanisme', description: 'Permis de construire, déclaration préalable et PLU.', icon: <Hammer size={24}/> },
    { title: 'Élections', description: 'Inscription sur les listes électorales et vote par procuration.', icon: <Globe size={24}/> },
  ];

  const projetsData = [
    { title: 'Éco-quartier Dembéni', description: 'Développement d\'un nouvel espace de vie durable et moderne.', icon: <Hammer size={24}/> },
    { title: 'Rénovation Scolaire', description: 'Modernisation des infrastructures éducatives de la commune.', icon: <Briefcase size={24}/> },
    { title: 'Parc Municipal', description: 'Aménagement d\'un nouvel espace vert pour les familles.', icon: <Heart size={24}/> },
  ];

  const servicesData = [
    { title: 'Éducation', description: 'Écoles, cantines et activités périscolaires.', icon: <Heart size={24}/> },
    { title: 'Social & Santé', description: 'Accompagnement des familles et services de soins.', icon: <Shield size={24}/> },
    { title: 'Environnement', description: 'Gestion des déchets et propreté urbaine.', icon: <Globe size={24}/> },
    { title: 'Culture & Sport', description: 'Médiathèque, stades et associations locales.', icon: <Briefcase size={24}/> },
  ];

  return (
    <Router>
      <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/"          element={<Home />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/user-login" element={<UserLogin />} />
            <Route path="/compte"    element={<UserDashboard />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/admin"     element={<AdminDashboard />} />
            <Route path="/contact"   element={<Contact />} />
            
            {/* New Sub-pages */}
            <Route path="/demarches" element={<SubPage title="Démarches Administratives" subtitle="Retrouvez tous les services en ligne pour faciliter votre quotidien." items={demarchesData} category="Services publics" />} />
            <Route path="/projet"    element={<SubPage title="Grands Projets" subtitle="Découvrez les chantiers qui façonnent le Dembéni de demain." items={projetsData} category="Développement local" />} />
            <Route path="/services"  element={<SubPage title="Services Publics" subtitle="Une administration proche de vous, à votre écoute au quotidien." items={servicesData} category="Services publics" />} />
            <Route path="/actualites" element={<NewsPage />} />
            <Route path="/culture"    element={<SubPage title="Culture & Patrimoine" subtitle="Découvrez la richesse culturelle et historique de Dembéni." category="Culture" />} />
            <Route path="/solidarite" element={<SantePage />} />
            <Route path="/sante"      element={<SantePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
