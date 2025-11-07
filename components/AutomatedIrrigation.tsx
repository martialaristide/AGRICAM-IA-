
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

const IrrigationSystemCard: React.FC<{ parcel: string; waterUsed: number; efficiency: number; zones: number; status: 'Actif' | 'Inactif', mode: 'Automatique' | 'Manuel' }> = ({ parcel, waterUsed, efficiency, zones, status, mode }) => (
    <div className="bg-card-bg p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-poppins font-bold text-lg text-text-primary">{parcel}</h3>
                <p className="text-sm text-text-secondary mt-1">{waterUsed}L utilisés</p>
            </div>
            <div className="flex gap-2">
                <span className={`text-xs font-bold text-white px-3 py-1 rounded-full ${status === 'Actif' ? 'bg-green-500' : 'bg-gray-400'}`}>{status}</span>
                <span className={`text-xs font-bold text-white px-3 py-1 rounded-full ${mode === 'Automatique' ? 'bg-blue-500' : 'bg-yellow-500'}`}>{mode}</span>
            </div>
        </div>
        <div className="flex justify-between items-center mt-4 text-sm text-text-secondary">
            <span>{zones} zones</span>
            <span>{efficiency}% Efficacité</span>
            <span>Temps réel</span>
        </div>
        <div className="flex gap-2 mt-4">
            <button className="bg-yellow-400 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-yellow-500 transition">Pause</button>
            <button className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-600 transition">Arrêter</button>
            <button className="bg-gray-200 text-text-primary font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-300 transition">Config</button>
        </div>
    </div>
);


const AutomatedIrrigation: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-400 to-teal-400 p-6 rounded-xl text-white">
                <h1 className="text-3xl font-bold font-poppins">Système d'Irrigation Automatisé</h1>
                <p className="font-roboto mt-1">Gestion intelligente de l'arrosage basée sur l'IA et les capteurs IoT</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Systèmes actifs" value="1" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>} />
                <StatCard title="Efficacité moyenne" value="87%" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>} />
                <StatCard title="Eau utilisée aujourd'hui" value="1250L" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.739-1.96l.082.203.203.082a4 4 0 011.96 7.739A3.5 3.5 0 0114.5 16h-9z" /></svg>} />
                <StatCard title="Surveillance auto" value="24/7" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 5a1 1 0 112 0v5l3.293-3.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5A1 1 0 114.707 6.707L9 11.086V5z" clipRule="evenodd" /></svg>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h2 className="font-poppins font-bold text-xl text-text-primary">Systèmes d'irrigation</h2>
                    <IrrigationSystemCard parcel="Parcelle Nord" waterUsed={1250} efficiency={87} zones={1} status="Actif" mode="Automatique" />
                </div>
                <div className="bg-card-bg p-5 rounded-xl shadow-sm">
                    <h2 className="font-poppins font-bold text-xl text-text-primary mb-4">Zones d'irrigation</h2>
                    <div className="bg-gray-100 h-64 rounded-lg flex flex-col items-center justify-center text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 0h-4m4 0l-5-5" /></svg>
                        <p className="mt-2 font-semibold text-text-secondary">Sélectionnez un système pour voir les détails des zones</p>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6 rounded-xl text-white">
                <h2 className="text-xl font-bold font-poppins text-left">Intelligence d'irrigation</h2>
                <p className="font-roboto mt-1 mb-4 text-left">Système automatisé basé sur l'IA, les prévisions météo et les données des capteurs IoT.</p>
                <div className="flex flex-wrap gap-4 items-center">
                    <span className="bg-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm">IA prédictive</span>
                    <span className="bg-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm">Météo intégrée</span>
                    <span className="bg-white/20 text-white font-semibold py-2 px-4 rounded-full text-sm">Optimisation continue</span>
                    <div className="flex-grow"></div>
                    <button className="bg-white text-blue-600 font-bold py-2 px-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors text-sm">Programmer</button>
                    <button className="bg-white text-blue-600 font-bold py-2 px-4 rounded-full shadow-lg hover:bg-gray-100 transition-colors text-sm">Configurer</button>
                </div>
            </div>
        </div>
    );
};

export default AutomatedIrrigation;
