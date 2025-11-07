
import React from 'react';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; }> = ({ title, value, icon }) => (
  <div className="bg-card-bg p-5 rounded-xl shadow-sm flex items-center">
    <div className="text-primary mr-4">{icon}</div>
    <div>
      <p className="text-2xl font-bold font-poppins text-text-primary">{value}</p>
      <p className="text-sm text-text-secondary font-roboto">{title}</p>
    </div>
  </div>
);

const MissionCard: React.FC<{ title: string; parcel: string; duration: string; weather: string; status: 'Planifié' | 'Terminé'; statusColor: string;}> = ({ title, parcel, duration, weather, status, statusColor }) => (
    <div className="bg-card-bg p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-poppins font-bold text-lg text-text-primary">{title}</h3>
                <p className="text-sm text-text-secondary font-roboto mt-1">{parcel}</p>
            </div>
            <span className={`text-xs font-bold text-white px-3 py-1 rounded-full ${statusColor}`}>{status}</span>
        </div>
        <div className="flex justify-between items-center mt-4 text-sm text-text-secondary">
            <span>Durée: {duration}</span>
            <span>Météo: {weather}</span>
        </div>
        <div className="flex gap-2 mt-4">
            {status === 'Planifié' && <button className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-primary-light transition">Démarrer</button>}
            <button className="bg-gray-200 text-text-primary font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-300 transition">Config</button>
        </div>
    </div>
);

const DroneManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-6 rounded-xl text-white">
        <h1 className="text-3xl font-bold font-poppins">Gestion des Drones</h1>
        <p className="font-roboto mt-1">Planification et contrôle des vols automatisés</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Drones actifs" value="3" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>} />
        <StatCard title="Missions planifiées" value="2" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>} />
        <StatCard title="Images capturées" value="1,247" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" /></svg>} />
        <StatCard title="Efficacité moyenne" value="87%" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z" clipRule="evenodd" /></svg>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="font-poppins font-bold text-xl text-text-primary">Missions de vol</h2>
          <MissionCard title="Mission surveillance Parcelle Est" parcel="Parcelle Est" duration="25min" weather="Favorable - vent 8km/h" status="Planifié" statusColor="bg-yellow-500"/>
          <MissionCard title="Cartographie NDVI Parcelle Nord" parcel="Parcelle Nord" duration="32min" weather="Excellent - Vent 5km/h" status="Terminé" statusColor="bg-green-500"/>
        </div>
        <div className="bg-card-bg p-5 rounded-xl shadow-sm">
          <h2 className="font-poppins font-bold text-xl text-text-primary mb-4">Carte des vols</h2>
          <div className="bg-gradient-to-br from-green-100 to-blue-100 h-64 rounded-lg flex flex-col items-center justify-center text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
            <p className="mt-2 font-semibold text-text-primary">Carte interactive des trajectoires</p>
            <p className="text-sm text-text-secondary">Visualisation en temps réel des vols</p>
          </div>
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            <h3 className="font-poppins font-semibold text-text-primary">Détails du vol sélectionné</h3>
            <ul className="text-sm text-text-secondary mt-2 space-y-1">
                <li className="flex justify-between"><span>Altitude:</span> <span className="font-semibold text-text-primary">75m</span></li>
                <li className="flex justify-between"><span>Vitesse:</span> <span className="font-semibold text-text-primary">4 m/s</span></li>
                <li className="flex justify-between"><span>Intervalle capture:</span> <span className="font-semibold text-text-primary">3s</span></li>
                <li className="flex justify-between"><span>Date prévue:</span> <span className="font-semibold text-text-primary">18/01/2024</span></li>
            </ul>
          </div>
        </div>
      </div>

       <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-xl text-white text-center flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold font-poppins text-left">Planifier une nouvelle mission</h2>
                <p className="font-roboto mt-1 text-left">Programmez une nouvelle mission de surveillance ou d'analyse pour vos drones.</p>
            </div>
            <button className="bg-white text-purple-600 font-bold py-2 px-6 rounded-full shadow-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                Nouvelle Mission
            </button>
        </div>
    </div>
  );
};

export default DroneManagement;
