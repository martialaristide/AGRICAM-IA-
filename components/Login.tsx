
import React, { useState } from 'react';

interface LoginProps {
  onLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('agriculteur');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login/register logic
    if (isRegistering) {
      if (email && password && name) {
        onLogin();
      } else {
        alert('Veuillez remplir tous les champs.');
      }
    } else {
      if (email && password) {
        onLogin();
      } else {
        alert('Veuillez entrer votre email et mot de passe.');
      }
    }
  };

  const roles = [
      { value: 'agriculteur', label: 'Agriculteur' },
      { value: 'fournisseur_intrant', label: 'Fournisseur d\'intrant' },
      { value: 'acheteur', label: 'Acheteur' },
      { value: 'investisseur', label: 'Investisseur' },
      { value: 'technicien', label: 'Technicien' },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card-bg rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
            <div className="flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-4-4 1.41-1.41L10 12.17l6.59-6.59L18 7l-8 8z"/>
                </svg>
                <div className="ml-3 text-left">
                    <h1 className="text-2xl font-poppins font-bold text-primary">AGRICAM IA</h1>
                    <p className="text-sm text-text-secondary font-roboto">Agriculture de précision</p>
                </div>
            </div>
            <h2 className="text-2xl font-poppins font-semibold text-text-primary">
            {isRegistering ? 'Créer un compte' : 'Bienvenue'}
            </h2>
            <p className="text-text-secondary font-roboto mt-1">
            {isRegistering ? 'Rejoignez la révolution agricole.' : 'Connectez-vous à votre tableau de bord.'}
            </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRegistering && (
            <div>
              <label htmlFor="name" className="text-sm font-medium text-text-secondary block mb-2">Nom complet</label>
              <input 
                id="name" 
                name="name" 
                type="text" 
                required 
                className="w-full px-4 py-2 border border-border-color rounded-lg focus:ring-primary focus:border-primary" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-text-secondary block mb-2">Adresse email</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              autoComplete="email" 
              required 
              className="w-full px-4 py-2 border border-border-color rounded-lg focus:ring-primary focus:border-primary" 
              placeholder="email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium text-text-secondary block mb-2">Mot de passe</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              autoComplete="current-password" 
              required 
              className="w-full px-4 py-2 border border-border-color rounded-lg focus:ring-primary focus:border-primary" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {isRegistering && (
             <div>
              <label htmlFor="role" className="text-sm font-medium text-text-secondary block mb-2">Je suis un...</label>
              <select 
                id="role" 
                name="role" 
                required 
                className="w-full px-4 py-2 border border-border-color rounded-lg focus:ring-primary focus:border-primary bg-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          )}

          {!isRegistering && (
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary-light border-gray-300 rounded" />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-text-secondary">Se souvenir de moi</label>
                </div>
                <div className="text-sm">
                    <a href="#" className="font-medium text-primary hover:text-primary-light">Mot de passe oublié?</a>
                </div>
            </div>
          )}

          <div>
            <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light">
              {isRegistering ? 'S\'inscrire' : 'Se connecter'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-text-secondary">
          {isRegistering ? 'Vous avez déjà un compte ?' : 'Pas encore de compte ?'}
          <button onClick={() => setIsRegistering(!isRegistering)} className="font-medium text-primary hover:text-primary-light ml-1">
            {isRegistering ? 'Se connecter' : 'Créer un compte'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
