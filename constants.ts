import { Appointment, AppointmentStatus, Client, Service, Transaction } from './types';

export const MOCK_SERVICES: Service[] = [
  { id: '1', name: 'Manicure Gel', price: 120, durationMinutes: 120, color: 'bg-pink-100 border-pink-200 text-pink-700' },
  { id: '2', name: 'Manicure Simples', price: 40, durationMinutes: 45, color: 'bg-stone-100 border-stone-200 text-stone-700' },
  { id: '3', name: 'Pedicure Spa', price: 60, durationMinutes: 60, color: 'bg-purple-100 border-purple-200 text-purple-700' },
  { id: '4', name: 'Design Sobrancelha', price: 50, durationMinutes: 30, color: 'bg-orange-100 border-orange-200 text-orange-700' },
];

export const MOCK_CLIENTS: Client[] = [
  { id: '101', name: 'Ana Silva', phone: '11999999999', avatarUrl: 'https://picsum.photos/100/100?random=1', totalVisits: 12, lastVisit: '2023-10-15' },
  { id: '102', name: 'Beatriz Costa', phone: '11988888888', avatarUrl: 'https://picsum.photos/100/100?random=2', totalVisits: 5, lastVisit: '2023-10-20' },
  { id: '103', name: 'Carla Dias', phone: '11977777777', avatarUrl: 'https://picsum.photos/100/100?random=3', totalVisits: 2, lastVisit: '2023-09-01' },
  { id: '104', name: 'Daniela Lima', phone: '11966666666', avatarUrl: 'https://picsum.photos/100/100?random=4', totalVisits: 8, lastVisit: '2023-10-05' },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

// Helper to set specific hours
const setTime = (date: Date, hours: number, minutes: number) => {
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const MOCK_APPOINTMENTS: Appointment[] = [
  { id: 'a1', clientId: '101', serviceId: '1', date: setTime(today, 9, 0), status: AppointmentStatus.CONFIRMED },
  { id: 'a2', clientId: '102', serviceId: '4', date: setTime(today, 13, 30), status: AppointmentStatus.PENDING },
  { id: 'a3', clientId: '103', serviceId: '3', date: setTime(tomorrow, 10, 0), status: AppointmentStatus.CONFIRMED },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'INCOME', amount: 120, date: setTime(today, 11, 0), description: 'Ana Silva - Gel', category: 'Serviço' },
  { id: 't2', type: 'EXPENSE', amount: 45.50, date: setTime(today, 8, 30), description: 'Compra de Lixas', category: 'Material' },
  { id: 't3', type: 'INCOME', amount: 350, date: setTime(new Date(today.getTime() - 86400000), 18, 0), description: 'Fechamento Dia Anterior', category: 'Serviço' },
  { id: 't4', type: 'INCOME', amount: 280, date: setTime(new Date(today.getTime() - 172800000), 18, 0), description: 'Fechamento Dia 24', category: 'Serviço' },
];
