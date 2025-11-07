import React from 'react';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
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

const AlertItem: React.FC<{ title: string; description: string; time: string; icon: React.ReactNode; color: string; }> = ({ title, description, time, icon, color }) => (
    <div className={`bg-card-bg border-l-4 ${color} p-4 rounded-r-lg shadow-sm flex items-start gap-4`}>
        <div className="flex-shrink-0">{icon}</div>
        <div>
            <p className="font-poppins font-bold text-text-primary">{title}</p>
            <p className="text-sm text-text-secondary mt-1">{description}</p>
            <p className="text-xs text-text-secondary mt-2">{time}</p>
        </div>
    </div>
);

const Alerts: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 rounded-xl text-white">
                <h1 className="text-3xl font-bold font-poppins">Gestion des Alertes</h1>
                <p className="font-roboto mt-1">Surveillez et réagissez aux événements critiques en temps réel.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Alertes Actives" value="2" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-800" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 12a1 1 0 112 0 1 1 0 01-2 0zm1-8a1 1 0 00-1 1v4a1 1 0 102 0V5a1 1 0 00-1-1z" clipRule="evenodd" /></svg>} color="bg-orange-100" />
                <StatCard title="Alertes Urgentes" value="1" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-800" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.635-1.03 2.851-1.03 3.486 0l5.58 9.098c.635 1.03-.477 2.303-1.743 2.303H4.42c-1.266 0-2.378-1.273-1.743-2.303l5.58-9.098zM10 12a1 1 0 110-2 1 1 0 010 2zm-1-3a1 1 0 001 1h.01a1 1 0 100-2H10a1 1 0 00-1 1z" clipRule="evenodd" /></svg>} color="bg-red-100" />
                <StatCard title="Alertes Traitées (24h)" value="5" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-800" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>} color="bg-green-100" />
            </div>

            <div className="bg-card-bg p-6 rounded-xl shadow-sm">
                <h2 className="font-poppins font-bold text-lg mb-4 text-text-primary">Alertes en temps réel</h2>
                 <div className="space-y-4">
                    <AlertItem 
                        title="Traitement anti-mildiou requis"
                        description="Détection de mildiou sur Parcelle Est avec 85% de confiance. Traitement fongicide recommandé sous 24h."
                        time="il y a 5 minutes"
                        icon={<svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                        color="border-red-500"
                    />
                     <AlertItem 
                        title="Irrigation d'urgence nécessaire"
                        description="Le niveau d'humidité du sol sur Parcelle Est est critique (45%). Activation automatique de l'irrigation recommandée."
                        time="il y a 12 minutes"
                        icon={<svg className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="border-orange-500"
                    />
                </div>
            </div>

            <div className="bg-card-bg p-6 rounded-xl shadow-sm">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <h2 className="font-poppins font-bold text-lg text-text-primary">Historique des Alertes</h2>
                    <div className="flex gap-2">
                        <select className="border border-border-color rounded-lg px-3 py-1.5 text-sm">
                            <option>Toutes les priorités</option>
                            <option>Urgente</option>
                            <option>Élevée</option>
                            <option>Moyenne</option>
                        </select>
                        <select className="border border-border-color rounded-lg px-3 py-1.5 text-sm">
                            <option>Toutes les parcelles</option>
                            <option>Parcelle Nord</option>
                            <option>Parcelle Sud</option>
                            <option>Parcelle Est</option>
                        </select>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-roboto">
                         <thead>
                            <tr className="border-b-2 border-border-color">
                                <th className="p-3 text-sm font-semibold text-text-secondary">Date</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">Priorité</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">Parcelle</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">Description</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-border-color">
                                <td className="p-3 text-sm text-text-secondary">19/01/2024 14:20</td>
                                <td className="p-3"><span className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">Moyenne</span></td>
                                <td className="p-3 text-sm text-text-secondary">Parcelle Nord</td>
                                <td className="p-3 text-sm text-text-secondary">Apport en phosphore recommandé.</td>
                                <td className="p-3 text-sm text-green-600 font-semibold">Traité</td>
                            </tr>
                             <tr className="border-b border-border-color">
                                <td className="p-3 text-sm text-text-secondary">18/01/2024 09:00</td>
                                <td className="p-3"><span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Info</span></td>
                                <td className="p-3 text-sm text-text-secondary">Général</td>
                                <td className="p-3 text-sm text-text-secondary">Vol de drone de surveillance programmé.</td>
                                <td className="p-3 text-sm text-gray-500 font-semibold">Archivé</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Alerts;
