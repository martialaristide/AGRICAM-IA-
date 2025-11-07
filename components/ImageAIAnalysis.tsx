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

const DiagnosticItem: React.FC<{label: string, value: string, color: string}> = ({label, value, color}) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-text-secondary">{label}</span>
        <span className={`font-bold ${color}`}>{value}</span>
    </div>
);


const ImageAnalysisCard: React.FC<{
    source: 'Drone' | 'Satellite';
    parcel: string;
    date: string;
    imageUrl: string;
    crop: string;
    cropConfidence: number;
    diagnostics: { waterStress: number, nitrogenDeficiency: number };
    disease?: { name: string; severity: 'Faible' | 'Moyenne' | 'Élevée'; confidence: number; }
}> = ({ source, parcel, date, imageUrl, crop, cropConfidence, diagnostics, disease }) => (
    <div className="bg-card-bg rounded-xl shadow-sm p-5 flex flex-col">
        <div className="relative">
            <img src={imageUrl} alt={`Analyse de ${parcel}`} className="rounded-lg w-full h-48 object-cover" />
            <span className={`absolute top-3 left-3 text-xs font-bold text-white px-3 py-1 rounded-full ${source === 'Drone' ? 'bg-yellow-500' : 'bg-blue-500'}`}>{source}</span>
        </div>
        <h3 className="font-poppins font-bold text-lg mt-4 text-text-primary">{parcel}</h3>
        <p className="text-sm text-text-secondary">{date}</p>
        
        <div className="mt-4 bg-gray-50 p-3 rounded-lg text-center">
             <p className="text-xs text-text-secondary">Reconnaissance</p>
             <p className="font-bold text-text-primary">{crop} <span className="text-green-600">({cropConfidence}% confiance)</span></p>
        </div>

        {disease && (
            <div className="mt-3 bg-red-50 p-3 rounded-lg">
                <p className="font-bold text-red-700">Maladie détectée</p>
                <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-red-600">{disease.name}</span>
                    <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">{disease.severity} ({disease.confidence}%)</span>
                </div>
            </div>
        )}

         <div className="mt-3 bg-blue-50 p-4 rounded-lg space-y-2 flex-grow">
            <h4 className="font-poppins font-semibold text-text-primary text-sm">Diagnostic IA</h4>
            <DiagnosticItem label="Stress hydrique" value={`${diagnostics.waterStress}%`} color={diagnostics.waterStress > 50 ? "text-orange-600" : "text-green-600"} />
            <DiagnosticItem label="Carence en azote" value={`${diagnostics.nitrogenDeficiency}%`} color={diagnostics.nitrogenDeficiency > 40 ? "text-yellow-600" : "text-green-600"} />
        </div>

        <div className="flex gap-2 mt-4">
            <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg text-sm w-full hover:bg-blue-600 transition">Réanalyser</button>
            <button className="bg-gray-200 text-text-primary font-bold py-2 px-4 rounded-lg text-sm w-full hover:bg-gray-300 transition">Marquer zone</button>
        </div>
    </div>
);

const AnalysisChart: React.FC = () => {
    const data = [
        { month: 'Jan', precision: 88 },
        { month: 'Fév', precision: 91 },
        { month: 'Mar', precision: 90 },
        { month: 'Avr', precision: 94 },
        { month: 'Mai', precision: 95 },
        { month: 'Juin', precision: 94 },
    ];
    const maxPrecision = 100;

    return (
        <div className="bg-card-bg p-6 rounded-xl shadow-sm">
            <h2 className="font-poppins font-bold text-lg mb-4 text-text-primary">Évolution de la précision de l'IA</h2>
            <div className="w-full h-64 flex items-end justify-around space-x-2">
                {data.map(item => (
                    <div key={item.month} className="flex flex-col items-center h-full w-full">
                        <div className="w-full h-full flex items-end">
                            <div 
                                className="bg-primary hover:bg-primary-light transition-colors w-full rounded-t-md" 
                                style={{ height: `${(item.precision / maxPrecision) * 100}%` }}
                                title={`${item.precision}%`}
                            >
                            </div>
                        </div>
                        <span className="text-xs text-text-secondary mt-2">{item.month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const ImageAIAnalysis: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6 rounded-xl text-white">
        <h1 className="text-3xl font-bold font-poppins">Analyse d'images IA</h1>
        <p className="font-roboto mt-1">Reconnaissance automatique des cultures et détection des maladies</p>
      </div>
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Images analysées" value="2" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-800" viewBox="0 0 20 20" fill="currentColor"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" /></svg>} color="bg-blue-100" />
        <StatCard title="Précision cultures" value="95%" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-800" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>} color="bg-green-100" />
        <StatCard title="Maladies détectées" value="1" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-800" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 1a1 1 0 011 1v2.268l.555.277a2 2 0 011.89 0l.555-.277V2a1 1 0 112 0v2.268l.555.277a2 2 0 011.89 0l.555-.277V2a1 1 0 112 0v5.536l-1.055.527a2 2 0 01-1.89 0l-.555-.277v-2.268l-.555.277a2 2 0 01-1.89 0l-.555-.277v2.268l-.555.277a2 2 0 01-1.89 0l-1.055-.527V2a1 1 0 011-1zm-9 6.536V2a1 1 0 112 0v2.268l.555.277a2 2 0 011.89 0l.555-.277V2a1 1 0 112 0v2.268l.555.277a2 2 0 011.89 0l.555-.277V2a1 1 0 112 0v5.536l-1.055.527a2 2 0 01-1.89 0l-.555-.277v-2.268l-.555.277a2 2 0 01-1.89 0l-.555-.277v2.268l-.555.277a2 2 0 01-1.89 0L1 8.536z" clipRule="evenodd" /></svg>} color="bg-red-100" />
        <StatCard title="Précision IA" value="94%" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-800" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0L8 5.13 6.07 4.4a1 1 0 00-1.28.87l-.59 1.95-1.93.64a1 1 0 00-.63 1.28l.96 1.83-1.3 1.5a1 1 0 00.17 1.4l1.75 1.1-1.02 1.77a1 1 0 00.84 1.38l1.9.31 1.07 1.79a1 1 0 001.36.44l1.8-.97 1.8.97a1 1 0 001.36-.44l1.07-1.79 1.9-.31a1 1 0 00.84-1.38l-1.02-1.77 1.75-1.1a1 1 0 00.17-1.4l-1.3-1.5.96-1.83a1 1 0 00-.63-1.28l-1.93-.64-.59-1.95a1 1 0 00-1.28-.87L12 5.13l-.51-1.96zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>} color="bg-purple-100" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ImageAnalysisCard 
            source="Drone"
            parcel="Parcelle Nord"
            date="18/01/2024"
            imageUrl="https://picsum.photos/seed/drone1/600/400"
            crop="Blé"
            cropConfidence={96}
            diagnostics={{ waterStress: 25, nitrogenDeficiency: 15 }}
            disease={{ name: "Rouille brune", severity: "Faible", confidence: 78 }}
          />
          <ImageAnalysisCard 
            source="Satellite"
            parcel="Parcelle Sud"
            date="18/01/2024"
            imageUrl="https://picsum.photos/seed/satellite1/600/400"
            crop="Maïs"
            cropConfidence={96}
            diagnostics={{ waterStress: 55, nitrogenDeficiency: 30 }}
          />
      </div>

       <div className="mt-6">
         <AnalysisChart />
       </div>
    </div>
  );
};

export default ImageAIAnalysis;