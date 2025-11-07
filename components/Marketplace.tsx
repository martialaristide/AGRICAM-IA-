
import React from 'react';

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; change?: string; }> = ({ title, value, icon, change }) => (
    <div className="bg-card-bg p-5 rounded-xl shadow-sm flex items-center">
        <div className="text-primary mr-4">{icon}</div>
        <div>
            <p className="text-2xl font-bold font-poppins text-text-primary">{value}</p>
            <p className="text-sm text-text-secondary font-roboto">{title}</p>
            {change && <p className={`text-xs font-roboto mt-1 ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</p>}
        </div>
    </div>
);

const ProductCard: React.FC<{
    name: string;
    price: number;
    unit: string;
    quantity: number;
    location: string;
    harvestDate: string;
    certifications: number;
    description: string;
    tags: string[];
    imageUrl: string;
    status: 'Disponible' | 'En négociation' | 'Vendu';
    isPremium: boolean;
}> = ({ name, price, unit, quantity, location, harvestDate, certifications, description, tags, imageUrl, status, isPremium }) => (
    <div className="bg-card-bg rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        <img src={imageUrl} alt={name} className="w-full md:w-1/3 h-48 md:h-auto object-cover" />
        <div className="p-5 flex flex-col flex-1">
            <div className="flex justify-between items-start">
                <h3 className="font-poppins font-bold text-xl text-text-primary">{name}</h3>
                <div className="text-right">
                    <p className="text-xl font-bold text-primary">{price}€</p>
                    <p className="text-sm text-text-secondary">par {unit}</p>
                </div>
            </div>
            {isPremium && <span className="text-xs bg-purple-100 text-purple-600 font-bold px-2 py-1 rounded-full self-start my-2">Premium</span>}
            <div className="flex flex-wrap gap-4 text-sm text-text-secondary my-3">
                <span>{quantity} tonnes</span>
                <span>{location}</span>
                <span>{harvestDate}</span>
                <span>{certifications} certifications</span>
            </div>
            <p className="text-sm text-text-secondary flex-grow">{description}</p>
            <div className="flex flex-wrap gap-2 my-3">
                {tags.map(tag => <span key={tag} className="text-xs bg-gray-100 text-text-secondary font-semibold px-2 py-1 rounded-full">{tag}</span>)}
            </div>
            <div className="flex gap-2 mt-auto pt-3 border-t border-border-color">
                <button className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm w-full hover:bg-primary-light transition">Contacter</button>
                <button className="bg-gray-200 text-text-primary font-bold py-2 px-4 rounded-lg text-sm w-full hover:bg-gray-300 transition">Détails</button>
            </div>
        </div>
    </div>
);


const Marketplace: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-teal-500 to-green-500 p-6 rounded-xl text-white">
                <h1 className="text-3xl font-bold font-poppins">Marketplace Agricole</h1>
                <p className="font-roboto mt-1">Connectez producteurs et acheteurs pour des transactions directes</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Offres actives" value="2" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z" /></svg>} />
                <StatCard title="Acheteurs actifs" value="2" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>} />
                <StatCard title="Valeur totale" value="16K€" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.5 2.5 0 00-1.162-.328zM11.5 10.5a2.5 2.5 0 001.162.328V8.84c-.22.07-.412.164-.567.267C11.656 9.479 11.5 10.009 11.5 10.5z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8.5v3a2.5 2.5 0 002.5 2.5h3A2.5 2.5 0 0014 11.5v-3c0-1.492-.602-2.266-1.324-2.746A4.535 4.535 0 0011 5.092V5z" clipRule="evenodd" /></svg>} />
                <StatCard title="Croissance mensuelle" value="+24%" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 7a1 1 0 11-2 0 1 1 0 012 0zm-4 4a1 1 0 100 2h8a1 1 0 100-2H8z" clipRule="evenodd" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z" clipRule="evenodd" /></svg>} change="+24%" />
            </div>

            <div className="bg-card-bg rounded-xl shadow-sm p-4">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div className="flex gap-4 border-b">
                        <button className="py-2 px-4 border-b-2 border-primary text-primary font-semibold">Offres de vente</button>
                        <button className="py-2 px-4 text-text-secondary font-semibold">Acheteurs</button>
                        <button className="py-2 px-4 text-text-secondary font-semibold">Producteurs</button>
                    </div>
                    <div className="flex items-center gap-4">
                        <input type="text" placeholder="Rechercher des produits..." className="border rounded-lg p-2 w-full md:w-auto" />
                        <button className="border rounded-lg p-2 font-semibold">Filtres</button>
                    </div>
                </div>
            </div>
            
            <div className="space-y-6">
                <ProductCard 
                    name="Blé bio"
                    price={320}
                    unit="tonnes"
                    quantity={25}
                    location="Beauce, France"
                    harvestDate="15/07/2024"
                    certifications={2}
                    description="Blé tendre biologique de haute qualité, certification AB. Taux de protéines 12.5%."
                    tags={['Agriculture Biologique', 'HVE Niveau 3']}
                    imageUrl="https://picsum.photos/seed/wheat/600/400"
                    status="Disponible"
                    isPremium={false}
                />
                 <ProductCard 
                    name="Maïs grain"
                    price={185}
                    unit="tonnes"
                    quantity={45}
                    location="Bresse, France"
                    harvestDate="20/09/2024"
                    certifications={2}
                    description="Maïs grain premium, humidité 14%, sans OGM. Idéal pour alimentation animale."
                    tags={['Sans OGM', 'Traçabilité complète']}
                    imageUrl="https://picsum.photos/seed/corn/600/400"
                    status="En négociation"
                    isPremium={true}
                />
            </div>

             <div className="bg-gradient-to-r from-secondary to-primary p-6 rounded-xl text-white flex justify-between items-center">
                 <div>
                    <h2 className="text-xl font-bold font-poppins text-left">Plateforme de mise en relation</h2>
                    <p className="font-roboto mt-1 text-left">Facilitez vos transactions avec des outils de négociation intégrés et un système de paiement sécurisé.</p>
                </div>
                <div className="flex gap-2">
                    <button className="bg-white text-primary font-bold py-2 px-6 rounded-full shadow-lg hover:bg-gray-100 transition-colors whitespace-nowrap">Créer une offre</button>
                    <button className="bg-white/20 text-white font-bold py-2 px-6 rounded-full hover:bg-white/30 transition-colors whitespace-nowrap">Logistique</button>
                </div>
            </div>

        </div>
    );
};

export default Marketplace;
