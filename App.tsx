import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Parcels from './components/Parcels';
import IoTCapteurs from './components/IoTCapteurs';
import DroneManagement from './components/DroneManagement';
import ImageAIAnalysis from './components/ImageAIAnalysis';
import AutomatedIrrigation from './components/AutomatedIrrigation';
import AIRecommendations from './components/AIRecommendations';
import Marketplace from './components/Marketplace';
import Login from './components/Login';
import Alerts from './components/Alerts';
import Settings from './components/Settings';
import Analytics from './components/Analytics';


// A simple type for page names
export type Page = 
  | 'Tableau de bord' 
  | 'Parcelles' 
  | 'Capteurs IoT' 
  | 'Gestion Drones'
  | 'Images satellites'
  | 'Analyse Images IA'
  | 'Irrigation Auto'
  | 'Recommandations IA'
  | 'Marketplace'
  | 'Analytics'
  | 'Alertes'
  | 'Paramètres';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('Tableau de bord');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const renderContent = () => {
    switch (activePage) {
      case 'Tableau de bord':
        return <Dashboard />;
      case 'Parcelles':
        return <Parcels />;
      case 'Capteurs IoT':
        return <IoTCapteurs />;
      case 'Gestion Drones':
        return <DroneManagement />;
      case 'Analyse Images IA':
        return <ImageAIAnalysis />;
      case 'Irrigation Auto':
        return <AutomatedIrrigation />;
      case 'Recommandations IA':
        return <AIRecommendations />;
      case 'Marketplace':
        return <Marketplace />;
      case 'Analytics':
        return <Analytics />;
      case 'Alertes':
        return <Alerts />;
      case 'Paramètres':
        return <Settings />;
      default:
        return <div className="p-8 text-2xl font-poppins text-text-primary">Contenu pour {activePage}</div>;
    }
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="bg-background font-roboto text-text-primary min-h-screen flex">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={() => setIsAuthenticated(false)} 
      />
      <main className="flex-1 ml-64 p-6 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;