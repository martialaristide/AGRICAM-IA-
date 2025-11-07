import React, { useState } from 'react';

interface ProgressBarProps {
  label: string;
  value: number;
  max: number;
  color: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ label, value, max, color }) => (
    <div className="w-full">
        <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-roboto text-text-secondary">{label}</span>
            <span className="text-sm font-roboto font-bold text-text-primary">{value}/{max}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
            <div className={color} style={{ width: `${(value / max) * 100}%`, height: '100%', borderRadius: '9999px' }}></div>
        </div>
    </div>
);

const ParcelCard: React.FC<{
    name: string; crop: string; area: number; status: string; statusColor: string;
    humidity: number; temp: number; ph: number; plantedDate: string;
    nitrogen: number; phosphorus: number; potassium: number;
}> = ({ name, crop, area, status, statusColor, humidity, temp, ph, plantedDate, nitrogen, phosphorus, potassium }) => (
    <div className="bg-card-bg rounded-xl shadow-sm overflow-hidden">
        <div className={`${statusColor} p-4 text-white flex justify-between items-center`}>
            <div>
                <h3 className="font-poppins font-bold text-lg">{name}</h3>
                <p className="text-sm font-roboto">{crop} • {area} hectares</p>
            </div>
            <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase">{status}</span>
        </div>
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-orange-50 p-3 rounded-lg">
                    <p className="text-xs text-orange-500">Humidité</p>
                    <p className="text-xl font-bold text-orange-700">{humidity}%</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-xs text-red-500">Température</p>
                    <p className="text-xl font-bold text-red-700">{temp}°C</p>
                </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-poppins font-semibold text-text-primary">Analyse du sol</h4>
                <ProgressBar label="Azote (N)" value={nitrogen} max={100} color="bg-green-500" />
                <ProgressBar label="Phosphore (P)" value={phosphorus} max={100} color="bg-blue-500" />
                <ProgressBar label="Potassium (K)" value={potassium} max={100} color="bg-purple-500" />
                <div className="pt-2 text-sm text-text-secondary flex items-center">
                    <span className="font-bold mr-2 text-text-primary">pH du sol: {ph}</span>
                </div>
            </div>
             <div className="bg-green-50 p-3 rounded-lg text-center">
                <p className="text-sm text-green-700 font-roboto">Planté le: <span className="font-bold">{plantedDate}</span></p>
            </div>
        </div>
    </div>
);

const parcelsData = [
    { 
        name: "Parcelle Nord", crop: "Blé", area: 15.5, status: "Bon", statusColor: "bg-green-600",
        humidity: 68, temp: 22, ph: 6.8, plantedDate: "15/03/2024",
        nitrogen: 78, phosphorus: 45, potassium: 92,
        map: { top: '10%', left: '15%', width: '40%', height: '30%' }
    },
    { 
        name: "Parcelle Sud", crop: "Maïs", area: 23.2, status: "Excellent", statusColor: "bg-blue-600",
        humidity: 75, temp: 24, ph: 7.2, plantedDate: "10/04/2024",
        nitrogen: 85, phosphorus: 52, potassium: 88,
        map: { top: '50%', left: '5%', width: '50%', height: '45%' }
    },
    { 
        name: "Parcelle Est", crop: "Tournesol", area: 18.7, status: "Attention", statusColor: "bg-yellow-500",
        humidity: 45, temp: 26, ph: 6.5, plantedDate: "25/04/2024",
        nitrogen: 62, phosphorus: 38, potassium: 74,
        map: { top: '25%', left: '60%', width: '35%', height: '50%' }
    }
];

const Parcels: React.FC = () => {
  const [selectedParcel, setSelectedParcel] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-primary p-6 rounded-xl text-white">
        <h1 className="text-3xl font-bold font-poppins">Gestion des parcelles</h1>
        <p className="font-roboto mt-1">Vue d'ensemble et localisation de vos 3 parcelles agricoles</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <div className="bg-card-bg rounded-xl shadow-sm p-4 sticky top-6">
           <h2 className="font-poppins font-bold text-lg mb-4 text-text-primary">Carte des parcelles</h2>
           <div className="relative w-full h-96 lg:h-[calc(100vh-12rem)] max-h-[700px] bg-green-50 border border-border-color rounded-lg overflow-hidden">
             <div 
               className="absolute inset-0 bg-repeat" 
               style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'\%232E8B57\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}>
             </div>
             {parcelsData.map(parcel => (
               <div
                 key={parcel.name}
                 style={parcel.map}
                 onMouseEnter={() => setSelectedParcel(parcel.name)}
                 onMouseLeave={() => setSelectedParcel(null)}
                 className={`absolute rounded-lg cursor-pointer transition-all duration-300 flex items-center justify-center text-center p-2
                   ${parcel.statusColor}
                   ${selectedParcel === parcel.name ? 'opacity-80 scale-105 shadow-2xl' : 'opacity-60'}`
                 }
               >
                 <span className="text-white font-bold text-sm drop-shadow-md">{parcel.name}</span>
               </div>
             ))}
           </div>
        </div>
        
        <div className="space-y-6">
          {parcelsData.map(parcel => (
            <div 
              key={parcel.name}
              onMouseEnter={() => setSelectedParcel(parcel.name)}
              onMouseLeave={() => setSelectedParcel(null)}
              className={`transition-all duration-300 ${selectedParcel === parcel.name ? 'scale-105 shadow-2xl' : 'scale-100'}`}
            >
              <ParcelCard {...parcel} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Parcels;