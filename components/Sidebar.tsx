
import React from 'react';
import { Page } from '../App';
import {
  DashboardIcon, ParcelsIcon, SensorIcon, DroneIcon, SatelliteIcon, AnalysisIcon,
  IrrigationIcon, RecommendationIcon, MarketplaceIcon, AnalyticsIcon, AlertIcon, SettingsIcon,
} from './icons';

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const navItems: { name: Page; icon: React.FC<{ className?: string }> }[] = [
  { name: 'Tableau de bord', icon: DashboardIcon },
  { name: 'Parcelles', icon: ParcelsIcon },
  { name: 'Capteurs IoT', icon: SensorIcon },
  { name: 'Gestion Drones', icon: DroneIcon },
  { name: 'Images satellites', icon: SatelliteIcon },
  { name: 'Analyse Images IA', icon: AnalysisIcon },
  { name: 'Irrigation Auto', icon: IrrigationIcon },
  { name: 'Recommandations IA', icon: RecommendationIcon },
  { name: 'Marketplace', icon: MarketplaceIcon },
  { name: 'Analytics', icon: AnalyticsIcon },
  { name: 'Alertes', icon: AlertIcon },
  { name: 'Paramètres', icon: SettingsIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ activePage, setActivePage }) => {
  return (
    <aside className="fixed top-0 left-0 w-64 h-full bg-card-bg shadow-lg flex flex-col z-10">
      <div className="flex items-center justify-center h-20 border-b border-border-color">
         <div className="flex items-center">
          <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-4-4 1.41-1.41L10 12.17l6.59-6.59L18 7l-8 8z"/>
          </svg>
          <div className="ml-3">
            <h1 className="text-xl font-poppins font-bold text-primary">AGRICAM IA</h1>
            <p className="text-xs text-text-secondary font-roboto">Agriculture de précision</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.name} className="mb-2">
              <button
                onClick={() => setActivePage(item.name)}
                className={`w-full flex items-center p-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                  activePage === item.name
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                }`}
              >
                <item.icon className="w-5 h-5 mr-4" />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
