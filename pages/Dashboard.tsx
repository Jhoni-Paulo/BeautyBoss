
import React from 'react';
import { Plus, TrendingUp, Clock, CheckCircle, Calendar } from 'lucide-react';
import { Card, Button, Avatar } from '../components/ui';
import { AppointmentStatus, PageView } from '../types';
import { useApp } from '../context/AppContext';

interface DashboardProps {
  onNavigate: (page: PageView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { appointments, clients, services, transactions, currentUser } = useApp();

  // Simple logic to find next appointment
  const now = new Date();
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.getDate() === now.getDate() && aptDate.getMonth() === now.getMonth() && aptDate.getFullYear() === now.getFullYear();
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const nextAppt = todayAppointments.find(apt => new Date(apt.date) > now && apt.status !== AppointmentStatus.CANCELLED);

  // Calculate daily income
  const dailyIncome = transactions
    .filter(t => {
      const tDate = new Date(t.date);
      return t.type === 'INCOME' && 
             tDate.getDate() === now.getDate() && 
             tDate.getMonth() === now.getMonth() && 
             tDate.getFullYear() === now.getFullYear();
    })
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="p-4 space-y-6">
      
      {/* Header */}
      <header className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Olá, {currentUser?.name?.split(' ')[0]}</h1>
          <p className="text-stone-500 text-sm">Vamos fazer arte hoje?</p>
        </div>
        <div className="relative">
          <Avatar src={currentUser?.avatarUrl || "https://picsum.photos/200/200"} alt="Profile" size="md" />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary-600">
            <TrendingUp size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">Hoje</span>
          </div>
          <span className="text-2xl font-bold text-stone-800">R$ {dailyIncome}</span>
          <p className="text-xs text-stone-400">{todayAppointments.length} agendamentos</p>
        </Card>
        <Card className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-blue-600">
            <Clock size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider">Próxima</span>
          </div>
          {nextAppt ? (
            <>
              <span className="text-xl font-bold text-stone-800">
                {new Date(nextAppt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <p className="text-xs text-stone-400 truncate">
                {clients.find(c => c.id === nextAppt.clientId)?.name}
              </p>
            </>
          ) : (
            <div className="flex flex-col justify-center h-full">
               <span className="text-sm text-stone-500 font-medium">Livre por hoje!</span>
            </div>
          )}
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          fullWidth 
          icon={Plus} 
          onClick={() => onNavigate('SCHEDULE')}
        >
          Agendar
        </Button>
        <Button 
          fullWidth 
          variant="secondary" 
          icon={Calendar}
          onClick={() => onNavigate('SCHEDULE')}
        >
          Agenda
        </Button>
      </div>

      {/* Up Next List */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-stone-800">Agenda de Hoje</h2>
          <button 
            onClick={() => onNavigate('SCHEDULE')}
            className="text-primary-600 text-sm font-medium"
          >
            Ver tudo
          </button>
        </div>

        <div className="space-y-3">
          {todayAppointments.length === 0 ? (
             <div className="text-center py-8 text-stone-400 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
               <p className="text-sm">Nenhum agendamento para hoje.</p>
             </div>
          ) : (
            todayAppointments.map(apt => {
              const client = clients.find(c => c.id === apt.clientId);
              const service = services.find(s => s.id === apt.serviceId);
              const date = new Date(apt.date);
              
              return (
                <Card key={apt.id} className="flex items-center gap-4">
                  <div className="flex flex-col items-center min-w-[3rem]">
                    <span className="font-bold text-stone-800">
                      {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`text-[10px] uppercase font-medium ${
                      apt.status === AppointmentStatus.CANCELLED ? 'text-red-400' : 'text-stone-400'
                    }`}>
                      {apt.status === AppointmentStatus.COMPLETED ? 'Feito' : 
                       apt.status === AppointmentStatus.CANCELLED ? 'Cancel' : 'Início'}
                    </span>
                  </div>
                  
                  <div className="h-10 w-px bg-stone-100"></div>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-stone-800 truncate ${apt.status === AppointmentStatus.CANCELLED ? 'line-through text-stone-400' : ''}`}>
                      {client?.name}
                    </h3>
                    <p className="text-sm text-stone-500 truncate">{service?.name}</p>
                  </div>

                  {apt.status === AppointmentStatus.CONFIRMED && (
                    <div className="text-green-500">
                      <CheckCircle size={20} />
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;