
import { VehicleTypeComplete, BodyTypeComplete } from './types';

export const availableVehicleTypes: VehicleTypeComplete[] = [
  { id: '1', type: 'Carreta', category: 'heavy', selected: false },
  { id: '2', type: 'Truck', category: 'heavy', selected: false },
  { id: '3', type: 'Toco', category: 'medium', selected: false },
  { id: '4', type: '3/4', category: 'medium', selected: false },
  { id: '5', type: 'VUC', category: 'light', selected: false },
  { id: '6', type: 'Van', category: 'light', selected: false },
  { id: '7', type: 'HR', category: 'light', selected: false },
];

export const availableBodyTypes: BodyTypeComplete[] = [
  { id: '1', type: 'Carroceria Aberta', category: 'open', selected: false },
  { id: '2', type: 'Carroceria Fechada', category: 'closed', selected: false },
  { id: '3', type: 'Baú', category: 'closed', selected: false },
  { id: '4', type: 'Refrigerado', category: 'special', selected: false },
  { id: '5', type: 'Graneleiro', category: 'special', selected: false },
  { id: '6', type: 'Tanque', category: 'special', selected: false },
  { id: '7', type: 'Prancha', category: 'open', selected: false },
  { id: '8', type: 'Munk', category: 'special', selected: false },
];
