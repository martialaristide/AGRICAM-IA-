
import React from 'react';
import { Sensor } from '../types';

const sensorData: Sensor[] = [
  { id: '1', type: 'Humidité', parcel: 'Parcelle Nord', value: '68 %', lastUpdate: '20/01/2024 11:30:00', status: 'Actif' },
  { id: '2', type: 'Température', parcel: 'Parcelle Nord', value: '22 °C', lastUpdate: '20/01/2024 11:30:00', status: 'Actif' },
  { id: '3', type: 'pH du sol', parcel: 'Parcelle Sud', value: '7.2 pH', lastUpdate: '20/01/2024 11:31:00', status: 'Actif' },
  { id: '4', type: 'NPK', parcel: 'Parcelle Est', value: '74 ppm', lastUpdate: '20/01/2024 11:32:00', status: 'Erreur' },
  { id: '5', type: 'camera', parcel: 'Parcelle Sud', value: '1 active', lastUpdate: '20/01/2024 11:33:00', status: 'Actif' },
];

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-card-bg p-5 rounded-xl shadow-sm flex items-center">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} mr-4`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold font-poppins text-text-primary">{value}</p>
            <p className="text-sm text-text-secondary font-roboto">{title}</p>
        </div>
    </div>
);

const getStatusBadge = (status: 'Actif' | 'Inactif' | 'Erreur') => {
  switch (status) {
    case 'Actif':
      return <span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">Actif</span>;
    case 'Inactif':
      return <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">Inactif</span>;
    case 'Erreur':
      return <span className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">Erreur</span>;
  }
};

const IoTCapteurs: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-xl text-white">
        <h1 className="text-3xl font-bold font-poppins">Capteurs IoT</h1>
        <p className="font-roboto mt-1">Surveillance en temps réel de vos parcelles</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Capteurs actifs" value={4} icon={<svg className="w-6 h-6 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>} color="bg-green-100" />
        <StatCard title="Capteurs inactifs" value={0} icon={<svg className="w-6 h-6 text-yellow-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 9v2m0 4h.01" /></svg>} color="bg-yellow-100" />
        <StatCard title="Capteurs en erreur" value={1} icon={<svg className="w-6 h-6 text-red-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>} color="bg-red-100" />
      </div>

      <div className="bg-card-bg p-6 rounded-xl shadow-sm">
        <h2 className="font-poppins font-bold text-lg mb-4 text-text-primary">Liste des capteurs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-roboto">
            <thead>
              <tr className="border-b-2 border-border-color">
                <th className="p-3 text-sm font-semibold text-text-secondary">Capteur</th>
                <th className="p-3 text-sm font-semibold text-text-secondary">Parcelle</th>
                <th className="p-3 text-sm font-semibold text-text-secondary">Valeur</th>
                <th className="p-3 text-sm font-semibold text-text-secondary">Dernière mise à jour</th>
                <th className="p-3 text-sm font-semibold text-text-secondary">État</th>
              </tr>
            </thead>
            <tbody>
              {sensorData.map((sensor) => (
                <tr key={sensor.id} className="border-b border-border-color hover:bg-gray-50">
                  <td className="p-3">
                    <div className="flex items-center">
                        <div className="mr-3 text-text-secondary">ID: {sensor.id}</div>
                        <div className="font-semibold text-text-primary">{sensor.type}</div>
                    </div>
                  </td>
                  <td className="p-3 text-text-secondary">{sensor.parcel}</td>
                  <td className="p-3 font-semibold text-text-primary">{sensor.value}</td>
                  <td className="p-3 text-text-secondary">{sensor.lastUpdate}</td>
                  <td className="p-3">{getStatusBadge(sensor.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-xl text-white text-center">
            <h2 className="text-xl font-bold font-poppins">Importer de nouvelles données IoT</h2>
            <p className="font-roboto mt-1 mb-4">Connectez de nouveaux capteurs ou importez des données manuellement.</p>
            <button className="bg-white text-blue-600 font-bold py-2 px-6 rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                Démarrer l'importation
            </button>
        </div>
    </div>
  );
};

export default IoTCapteurs;
