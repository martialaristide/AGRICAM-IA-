import React, { useState } from 'react';

type Tab = 'users' | 'analysis' | 'notifications';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('users');

    const renderContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserManagement />;
            case 'analysis':
                return <AnalysisConfig />;
            case 'notifications':
                return <NotificationPrefs />;
            default:
                return null;
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-6 rounded-xl text-white">
                <h1 className="text-3xl font-bold font-poppins">Paramètres du système</h1>
                <p className="font-roboto mt-1">Gérez les utilisateurs, configurez l'IA et personnalisez vos notifications.</p>
            </div>

            <div className="bg-card-bg rounded-xl shadow-sm p-2">
                <div className="flex border-b border-border-color">
                    <TabButton label="Gestion des utilisateurs" isActive={activeTab === 'users'} onClick={() => setActiveTab('users')} />
                    <TabButton label="Configuration des analyses" isActive={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
                    <TabButton label="Préférences de notification" isActive={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} />
                </div>
                <div className="p-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

const TabButton: React.FC<{label: string, isActive: boolean, onClick: () => void}> = ({label, isActive, onClick}) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-md transition-colors ${
            isActive 
                ? 'border-b-2 border-primary text-primary bg-primary/10' 
                : 'text-text-secondary hover:bg-gray-100'
        }`}
    >
        {label}
    </button>
);

const UserManagement = () => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="font-poppins font-bold text-xl text-text-primary">Utilisateurs</h2>
            <button className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-primary-light transition">Ajouter un utilisateur</button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left font-roboto">
                <thead>
                    <tr className="border-b-2 border-border-color">
                        <th className="p-3 text-sm font-semibold text-text-secondary">Utilisateur</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Rôle</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Statut</th>
                        <th className="p-3 text-sm font-semibold text-text-secondary">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <UserRow name="Admin" email="admin@agricam.ia" role="Administrateur" isActive={true} />
                    <UserRow name="Technicien 1" email="tech1@agricam.ia" role="Technicien" isActive={true} />
                    <UserRow name="Agriculteur Invité" email="guest@agricam.ia" role="Agriculteur" isActive={false} />
                </tbody>
            </table>
        </div>
    </div>
);

const UserRow: React.FC<{name: string, email: string, role: string, isActive: boolean}> = ({ name, email, role, isActive }) => (
    <tr className="border-b border-border-color hover:bg-gray-50">
        <td className="p-3">
            <div className="font-semibold text-text-primary">{name}</div>
            <div className="text-sm text-text-secondary">{email}</div>
        </td>
        <td className="p-3 text-text-secondary">{role}</td>
        <td className="p-3">
             <span className={`text-xs font-bold px-3 py-1 rounded-full ${isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                {isActive ? 'Actif' : 'Inactif'}
            </span>
        </td>
        <td className="p-3 flex gap-2">
            <button className="text-blue-600 hover:text-blue-800">Éditer</button>
            <button className="text-red-600 hover:text-red-800">Supprimer</button>
        </td>
    </tr>
);


const AnalysisConfig = () => (
    <div className="space-y-6 max-w-2xl">
        <h2 className="font-poppins font-bold text-xl text-text-primary">Configuration de l'IA</h2>
        <div>
            <label className="text-sm font-medium text-text-secondary block mb-1">Seuil de confiance (Maladie)</label>
            <input type="range" min="50" max="99" defaultValue="80" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
            <p className="text-xs text-text-secondary mt-1">Déclenche une alerte si la confiance est supérieure à 80%.</p>
        </div>
        <div>
            <label className="text-sm font-medium text-text-secondary block mb-1">Seuil de confiance (Stress hydrique)</label>
            <input type="range" min="50" max="99" defaultValue="75" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" />
             <p className="text-xs text-text-secondary mt-1">Déclenche une alerte si la confiance est supérieure à 75%.</p>
        </div>
        <div className="space-y-2">
             <label className="text-sm font-medium text-text-secondary block">Modules d'analyse actifs</label>
             <label className="flex items-center"><input type="checkbox" defaultChecked className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"/> <span className="ml-2 text-sm">Analyse NDVI</span></label>
             <label className="flex items-center"><input type="checkbox" defaultChecked className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"/> <span className="ml-2 text-sm">Analyse de la biomasse</span></label>
             <label className="flex items-center"><input type="checkbox" className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"/> <span className="ml-2 text-sm">Comptage des plantes (Bêta)</span></label>
        </div>
         <button className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-primary-light transition">Enregistrer les modifications</button>
    </div>
);

const NotificationPrefs = () => (
    <div className="space-y-6">
        <h2 className="font-poppins font-bold text-xl text-text-primary">Notifications</h2>
        <NotificationGroup title="Alertes Critiques (Maladies, Pannes)" />
        <NotificationGroup title="Alertes de Seuil (Irrigation, NPK)" />
        <NotificationGroup title="Rapports et Analyses" />
        <button className="bg-primary text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-primary-light transition">Enregistrer les préférences</button>
    </div>
);

const NotificationGroup: React.FC<{title: string}> = ({title}) => (
    <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-text-primary">{title}</h3>
        <div className="mt-3 flex flex-col md:flex-row gap-4">
             <label className="flex items-center"><input type="checkbox" defaultChecked className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"/> <span className="ml-2 text-sm">Notification in-app</span></label>
             <label className="flex items-center"><input type="checkbox" defaultChecked className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"/> <span className="ml-2 text-sm">Email</span></label>
             <label className="flex items-center"><input type="checkbox" className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"/> <span className="ml-2 text-sm">SMS</span></label>
        </div>
    </div>
);


export default Settings;