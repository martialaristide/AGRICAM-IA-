
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

const RecommendationCard: React.FC<{
    title: string;
    priority: 'ÉLEVÉE' | 'URGENT' | 'MOYENNE';
    priorityColor: string;
    confidence: number;
    category: string;
    parcel: string;
    date: string;
    description: string;
}> = ({ title, priority, priorityColor, confidence, category, parcel, date, description }) => (
    <div className="bg-card-bg p-5 rounded-xl shadow-sm">
        <div className="flex justify-between items-start">
            <div>
                <div className="flex items-center gap-2">
                    <h3 className="font-poppins font-bold text-lg text-text-primary">{title}</h3>
                    <span className={`text-xs font-bold text-white px-3 py-1 rounded-full ${priorityColor}`}>{priority}</span>
                </div>
                <p className="text-sm text-text-secondary mt-1">{parcel} • {category} • {date}</p>
            </div>
            <div className="text-center">
                <p className="text-sm font-bold text-green-600">{confidence}%</p>
                <p className="text-xs text-text-secondary">Confiance IA</p>
            </div>
        </div>
        <p className="text-text-secondary mt-3">{description}</p>
        <div className="flex gap-2 mt-4">
            <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-blue-600 transition">Appliquer</button>
            <button className="bg-gray-200 text-text-primary font-bold py-2 px-4 rounded-lg text-sm hover:bg-gray-300 transition">Reporter</button>
            <button className="bg-red-100 text-red-600 font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-200 transition">Ignorer</button>
        </div>
    </div>
);

const AIRecommendations: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 rounded-xl text-white">
                <h1 className="text-3xl font-bold font-poppins">Recommandations IA</h1>
                <p className="font-roboto mt-1">Intelligence artificielle pour optimiser vos rendements</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Recommandations" value="3" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>} />
                <StatCard title="Priorité élevée" value="2" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 9.586V7z" clipRule="evenodd" /></svg>} />
                <StatCard title="Confiance moyenne" value="86%" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>} />
                <StatCard title="Délai moyen" value="24h" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 5a1 1 0 112 0v5l3.293-3.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0l-5-5A1 1 0 114.707 6.707L9 11.086V5z" clipRule="evenodd" /></svg>} />
            </div>

            <div className="space-y-4">
                <RecommendationCard
                    title="Irrigation d'urgence nécessaire"
                    priority="ÉLEVÉE"
                    priorityColor="bg-orange-500"
                    confidence={94}
                    category="Irrigation"
                    parcel="Parcelle Est"
                    date="20/01/2024"
                    description="Le niveau d'humidité du sol est critique (45%). Activation automatique de l'irrigation recommandée dans les 2h."
                />
                 <RecommendationCard
                    title="Traitement anti-mildiou requis"
                    priority="URGENT"
                    priorityColor="bg-red-500"
                    confidence={85}
                    category="disease_treatment"
                    parcel="Parcelle Est"
                    date="20/01/2024"
                    description="Détection de mildiou sur 4.2 ha avec 85% de confiance. Traitement fongicide recommandé sous 24h."
                />
                 <RecommendationCard
                    title="Optimisation phosphore"
                    priority="MOYENNE"
                    priorityColor="bg-yellow-500"
                    confidence={78}
                    category="Fertilisation"
                    parcel="Parcelle Nord"
                    date="19/01/2024"
                    description="Apport ciblé en phosphore pour maximiser le rendement en période de floraison."
                />
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-xl text-white flex justify-between items-center">
                 <div>
                    <h2 className="text-xl font-bold font-poppins text-left">Moteur d'IA</h2>
                    <p className="font-roboto mt-1 text-left">Notre IA analyse en continu vos données pour générer des recommandations personnalisées.</p>
                </div>
                <button className="bg-white text-purple-600 font-bold py-2 px-6 rounded-full shadow-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                    Configurer l'IA
                </button>
            </div>
        </div>
    );
};

export default AIRecommendations;
