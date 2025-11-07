import React, { useState } from 'react';

const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode; color: string; }> = ({ title, value, change, icon, color }) => {
  const isPositive = change.startsWith('+');
  return (
    <div className="bg-card-bg p-5 rounded-xl shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm text-text-secondary font-roboto">{title}</p>
        <p className="text-2xl font-bold font-poppins text-text-primary">{value}</p>
        <p className={`text-xs font-roboto ${isPositive ? 'text-green-500' : 'text-red-500'}`}>{change}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  );
};

const YieldEvolutionChart: React.FC = () => {
    const data = [
        { month: 'Jan', yield: 350 }, { month: 'Fév', yield: 380 }, { month: 'Mar', yield: 410 },
        { month: 'Avr', yield: 450 }, { month: 'Mai', yield: 480 }, { month: 'Juin', yield: 520 }
    ];
    const maxYield = 600;

    return (
        <div className="bg-card-bg p-6 rounded-xl shadow-sm h-full">
            <h2 className="font-poppins font-bold text-lg mb-4 text-text-primary">Évolution du Rendement (T)</h2>
            <div className="h-64 relative">
                <div className="absolute w-full h-full grid grid-rows-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="border-t border-border-color"></div>)}
                </div>
                <svg className="w-full h-full absolute" preserveAspectRatio="none">
                    <path d={data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * (100 / (data.length -1))}% ${100 - (p.yield / maxYield) * 100}%`).join(' ')} fill="none" stroke="#2E8B57" strokeWidth="2"/>
                </svg>
                 <div className="absolute w-full h-full flex justify-around">
                    {data.map((p, i) => (
                        <div key={i} className="relative w-full h-full group">
                            <div className="absolute bg-primary w-3 h-3 rounded-full -ml-1.5 -mt-1.5" style={{ left: `${i * (100 / (data.length -1))}%`, top: `${100 - (p.yield / maxYield) * 100}%`}}></div>
                            <div className="absolute bg-card-bg p-2 rounded shadow-lg text-xs invisible group-hover:visible -mt-10" style={{ left: `${i * (100 / (data.length -1))}%`, top: `${100 - (p.yield / maxYield) * 100}%`}}>
                                {p.yield} T
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-around mt-2 text-xs text-text-secondary">
                {data.map(p => <span key={p.month}>{p.month}</span>)}
            </div>
        </div>
    );
};

const CropHealthChart: React.FC = () => {
    const data = { excellent: 45, good: 35, warning: 20 };
    const circumference = 2 * Math.PI * 45;

    return (
         <div className="bg-card-bg p-6 rounded-xl shadow-sm h-full flex flex-col justify-between">
            <h2 className="font-poppins font-bold text-lg mb-4 text-text-primary">Santé des Cultures</h2>
            <div className="flex-grow flex items-center justify-center relative">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="#EAECEE" strokeWidth="10" />
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="#1ABC9C" strokeWidth="10" strokeDasharray={`${circumference * (data.excellent / 100)} ${circumference}`} />
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="#2E8B57" strokeWidth="10" strokeDasharray={`${circumference * (data.good / 100)} ${circumference}`} strokeDashoffset={-circumference * (data.excellent / 100)} />
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="#F1C40F" strokeWidth="10" strokeDasharray={`${circumference * (data.warning / 100)} ${circumference}`} strokeDashoffset={-circumference * ((data.excellent + data.good) / 100)} />
                </svg>
                <div className="absolute text-center">
                    <p className="text-3xl font-bold font-poppins">{data.excellent + data.good}%</p>
                    <p className="text-sm text-text-secondary">Sain</p>
                </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center text-sm"><span className="w-3 h-3 bg-secondary rounded-full mr-2"></span>Excellent</div>
                <div className="flex items-center text-sm"><span className="w-3 h-3 bg-primary rounded-full mr-2"></span>Bon</div>
                <div className="flex items-center text-sm"><span className="w-3 h-3 bg-accent rounded-full mr-2"></span>Attention</div>
            </div>
        </div>
    )
}


const Analytics: React.FC = () => {
    const [parcelFilter, setParcelFilter] = useState('all');
    
    const detailedData = [
        { parcel: "Parcelle Nord", crop: "Blé", ndvi: 0.82, humidity: 68, yieldPrediction: 7.5, health: "Excellent" },
        { parcel: "Parcelle Sud", crop: "Maïs", ndvi: 0.78, humidity: 75, yieldPrediction: 8.2, health: "Bon" },
        { parcel: "Parcelle Est", crop: "Tournesol", ndvi: 0.65, humidity: 45, yieldPrediction: 4.1, health: "Attention" },
    ];
    
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-primary to-secondary p-6 rounded-xl text-white">
                <h1 className="text-3xl font-bold font-poppins">Analytics</h1>
                <p className="font-roboto mt-1">Analyse approfondie des performances et prévisions de rendement.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Rendement Total Est." value="19.8 T" change="+5.2%" icon={<svg className="w-6 h-6 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>} color="bg-green-100" />
                <StatCard title="Santé Globale" value="80%" change="+3%" icon={<svg className="w-6 h-6 text-blue-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>} color="bg-blue-100" />
                <StatCard title="Précision Prédiction" value="94%" change="+1.5%" icon={<svg className="w-6 h-6 text-purple-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>} color="bg-purple-100" />
                <StatCard title="Utilisation Eau (Mois)" value="4.8k m³" change="-8%" icon={<svg className="w-6 h-6 text-cyan-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path></svg>} color="bg-cyan-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <YieldEvolutionChart />
                </div>
                <div>
                    <CropHealthChart />
                </div>
            </div>

            <div className="bg-card-bg p-6 rounded-xl shadow-sm">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <h2 className="font-poppins font-bold text-lg text-text-primary">Diagnostic Détaillé par Parcelle</h2>
                    <div className="flex gap-2">
                         <select value={parcelFilter} onChange={e => setParcelFilter(e.target.value)} className="border border-border-color rounded-lg px-3 py-1.5 text-sm bg-white">
                            <option value="all">Toutes les parcelles</option>
                            <option value="Parcelle Nord">Parcelle Nord</option>
                            <option value="Parcelle Sud">Parcelle Sud</option>
                            <option value="Parcelle Est">Parcelle Est</option>
                        </select>
                         <input type="date" className="border border-border-color rounded-lg px-3 py-1.5 text-sm" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-roboto">
                         <thead>
                            <tr className="border-b-2 border-border-color">
                                <th className="p-3 text-sm font-semibold text-text-secondary">Parcelle</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">Culture</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">NDVI</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">Humidité Sol</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">Prédiction Rendement (T/ha)</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">Santé</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedData.filter(d => parcelFilter === 'all' || d.parcel === parcelFilter).map(d => (
                                <tr key={d.parcel} className="border-b border-border-color hover:bg-gray-50">
                                    <td className="p-3 font-semibold text-text-primary">{d.parcel}</td>
                                    <td className="p-3 text-sm text-text-secondary">{d.crop}</td>
                                    <td className="p-3 text-sm font-semibold text-text-primary">{d.ndvi}</td>
                                    <td className="p-3 text-sm text-text-secondary">{d.humidity}%</td>
                                    <td className="p-3 text-sm text-primary font-bold">{d.yieldPrediction}</td>
                                    <td className="p-3">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${d.health === 'Excellent' ? 'bg-secondary/20 text-secondary' : d.health === 'Bon' ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-yellow-600'}`}>
                                            {d.health}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
