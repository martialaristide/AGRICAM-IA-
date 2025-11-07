
export interface Sensor {
  id: string;
  type: 'Humidité' | 'Température' | 'pH du sol' | 'NPK' | 'camera';
  parcel: string;
  value: string;
  lastUpdate: string;
  status: 'Actif' | 'Inactif' | 'Erreur';
}
