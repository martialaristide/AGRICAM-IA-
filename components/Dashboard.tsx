
import React from 'react';

const StatCard: React.FC<{ title: string; value: string; change?: string; icon: React.ReactNode; color: string; }> = ({ title, value, change, icon, color }) => {
  return (
    <div className="bg-card-bg p-5 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-text-secondary font-roboto">{title}</p>
        <p className="text-2xl font-bold font-poppins text-text-primary">{value}</p>
        {change && <p className={`text-xs font-roboto ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</p>}
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-xl text-white">
        <h1 className="text-3xl font-bold font-poppins">Bienvenue sur AGRICAM IA</h1>
        <p className="font-roboto mt-1">Votre assistant intelligent pour l'agriculture de précision</p>
        <p className="font-roboto text-sm opacity-80 mt-2">Système opérationnel • 4 capteurs actifs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Parcelles actives" value="3" change="+8%" icon={<svg className="w-6 h-6 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} color="bg-green-100" />
        <StatCard title="Humidité moyenne" value="63%" change="+12%" icon={<svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path></svg>} color="bg-blue-100" />
        <StatCard title="Température moyenne" value="24°C" icon={<svg className="w-6 h-6 text-orange-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>} color="bg-orange-100" />
        <StatCard title="Alertes actives" value="2" icon={<svg className="w-6 h-6 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>} color="bg-red-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card-bg p-6 rounded-xl shadow-sm">
          <h2 className="font-poppins font-bold text-lg mb-4 text-text-primary">État des parcelles</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                <div>
                    <p className="font-bold font-roboto">Parcelle Nord <span className="text-sm font-normal text-text-secondary">• Blé • 15.5 ha</span></p>
                    <p className="text-sm text-text-secondary">68% Humidité • 22°C</p>
                </div>
                <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">Bon</span>
            </div>
             <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                <div>
                    <p className="font-bold font-roboto">Parcelle Sud <span className="text-sm font-normal text-text-secondary">• Maïs • 23.2 ha</span></p>
                    <p className="text-sm text-text-secondary">75% Humidité • 24°C</p>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Excellent</span>
            </div>
             <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
                <div>
                    <p className="font-bold font-roboto">Parcelle Est <span className="text-sm font-normal text-text-secondary">• Tournesol • 18.7 ha</span></p>
                    <p className="text-sm text-text-secondary">45% Humidité • 26°C</p>
                </div>
                <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">Attention</span>
            </div>
          </div>
        </div>

        <div className="bg-card-bg p-6 rounded-xl shadow-sm">
          <h2 className="font-poppins font-bold text-lg mb-4 text-text-primary">Alertes récentes</h2>
          <div className="space-y-3">
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="font-bold text-red-700">Maladie détectée par IA</p>
              <p className="text-sm text-red-600">Mildiou identifié sur Parcelle Est avec 85% de confiance - Action immédiate requise.</p>
              <p className="text-xs text-text-secondary mt-1">20/01/2024 10:15:00</p>
            </div>
             <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
              <p className="font-bold text-yellow-700">Seuil d'irrigation atteint</p>
              <p className="text-sm text-yellow-600">Humidité critique (45%) - Système d'irrigation automatique activé.</p>
               <p className="text-xs text-text-secondary mt-1">20/01/2024 10:10:00</p>
            </div>
             <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="font-bold text-blue-700">Vol de drone programmé</p>
              <p className="text-sm text-blue-600">Mission de surveillance prévue demain 8h - Conditions météo favorables.</p>
               <p className="text-xs text-text-secondary mt-1">20/01/2024 08:00:00</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
