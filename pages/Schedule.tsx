
import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Plus, Calendar as CalendarIcon, Clock, User, Scissors, Trash2, XCircle, Ban, AlertCircle } from 'lucide-react';
import { Button, Modal, Input, Select, Avatar, Tabs } from '../components/ui';
import { useApp } from '../context/AppContext';
import { AppointmentStatus, Appointment } from '../types';

const Schedule: React.FC = () => {
  const { appointments, services, clients, addAppointment, updateAppointmentStatus, deleteAppointment, userConfig } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const datePickerRef = useRef<HTMLInputElement>(null);
  
  // New Appointment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('APPOINTMENT'); // 'APPOINTMENT' | 'BLOCK'
  
  const [newAptClientId, setNewAptClientId] = useState('');
  const [newAptServiceId, setNewAptServiceId] = useState('');
  const [newAptTime, setNewAptTime] = useState('');
  
  // New Block State
  const [blockDuration, setBlockDuration] = useState('60');

  // Edit/View Appointment Modal State
  const [viewApt, setViewApt] = useState<Appointment | null>(null);

  // --- Date Navigation ---
  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() && 
           d1.getMonth() === d2.getMonth() && 
           d1.getFullYear() === d2.getFullYear();
  };

  // Helper to format date for input type="date"
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const [year, month, day] = e.target.value.split('-').map(Number);
    // Create date at midnight to avoid timezone issues with standard ISO parsing
    setSelectedDate(new Date(year, month - 1, day));
  };

  // --- Data Preparation ---
  // Filter appointments for selected day (including cancelled for visual toggle if needed, but filtering out for now)
  const dailyAppointments = appointments.filter(apt => 
    isSameDay(new Date(apt.date), selectedDate) && apt.status !== AppointmentStatus.CANCELLED
  );

  // --- WhatsApp Helper ---
  const openWhatsApp = (phone: string, clientName: string, date: Date) => {
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const message = `Olá ${clientName}, confirmando seu horário hoje às ${time}?`;
    window.open(`https://wa.me/55${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // --- Save Logic ---
  const handleSave = () => {
    if (!newAptTime) return;
    const [hours, minutes] = newAptTime.split(':').map(Number);
    const aptDate = new Date(selectedDate);
    aptDate.setHours(hours, minutes, 0, 0);

    if (modalTab === 'APPOINTMENT') {
        if (!newAptClientId || !newAptServiceId) return;
        addAppointment({
          clientId: newAptClientId,
          serviceId: newAptServiceId,
          date: aptDate.toISOString(),
          status: AppointmentStatus.CONFIRMED,
        });
    } else {
        // BLOCK LOGIC
        if (!blockDuration) return;
        const durationInt = parseInt(blockDuration, 10);
        
        addAppointment({
            date: aptDate.toISOString(),
            status: AppointmentStatus.BLOCKED,
            notes: 'Horário Bloqueado',
            customDuration: isNaN(durationInt) ? 60 : durationInt
        });
    }

    resetModal();
  };

  const resetModal = () => {
    setIsModalOpen(false);
    setNewAptClientId('');
    setNewAptServiceId('');
    setNewAptTime('');
    setBlockDuration('60');
    setModalTab('APPOINTMENT');
  };

  // --- Time Grid Generation ---
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = userConfig.startHour;
    const endHour = userConfig.endHour;
    
    let current = new Date(selectedDate);
    current.setHours(startHour, 0, 0, 0);
    
    const end = new Date(selectedDate);
    end.setHours(endHour, 0, 0, 0);

    while (current <= end) {
      slots.push(new Date(current));
      // Increment by 30 mins
      current = new Date(current.getTime() + 30 * 60000);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // --- Grid Helpers ---
  const getAppointmentStartingAt = (slotDate: Date) => {
    return dailyAppointments.find(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.getTime() === slotDate.getTime();
    });
  };

  const isSlotOccupiedByOngoing = (slotDate: Date) => {
    return dailyAppointments.some(apt => {
      const start = new Date(apt.date);
      // Get duration: If blocked, use customDuration, else use service duration
      let duration = 60;
      if (apt.status === AppointmentStatus.BLOCKED) {
          duration = apt.customDuration || 60;
      } else {
          const service = services.find(s => s.id === apt.serviceId);
          duration = service?.durationMinutes || 60;
      }

      const end = new Date(start.getTime() + duration * 60000);
      
      // Is slot strictly inside the interval (start < slot < end)
      return slotDate > start && slotDate < end;
    });
  };

  const handleSlotClick = (date: Date) => {
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setNewAptTime(timeStr);
    setIsModalOpen(true);
  };

  const handleCancelApt = () => {
    if (viewApt) {
        if(window.confirm('Deseja realmente cancelar este agendamento/bloqueio?')) {
            updateAppointmentStatus(viewApt.id, AppointmentStatus.CANCELLED);
            setViewApt(null);
        }
    }
  };

  const handleDeleteApt = () => {
    if (viewApt) {
        if(window.confirm('Deseja EXCLUIR permanentemente este registro?')) {
            deleteAppointment(viewApt.id);
            setViewApt(null);
        }
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Calendar Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-20 px-4 py-4 border-b border-stone-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-stone-800">Agenda</h1>
          <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())}>Hoje</Button>
        </div>
        
        <div className="flex gap-2">
          <div className="flex-1 flex items-center justify-between bg-stone-50 p-2 rounded-xl">
            <button onClick={() => changeDate(-1)} className="p-2 text-stone-500 hover:bg-white rounded-lg transition-colors">
              <ChevronLeft size={20} />
            </button>
            <div className="text-center animate-in fade-in zoom-in duration-200" key={selectedDate.toISOString()}>
              <span className="block text-xs font-semibold text-stone-400 uppercase">
                {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
              </span>
              <span className="block text-lg font-bold text-stone-800">
                {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
              </span>
            </div>
            <button onClick={() => changeDate(1)} className="p-2 text-stone-500 hover:bg-white rounded-lg transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>

          <button 
            onClick={() => {
              try {
                datePickerRef.current?.showPicker();
              } catch(e) {
                // Fallback or ignore
              }
            }}
            className="bg-stone-50 rounded-xl flex items-center justify-center w-14 relative hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <CalendarIcon size={20} className="text-stone-500" />
            <input 
              ref={datePickerRef}
              type="date"
              className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
              value={formatDateForInput(selectedDate)}
              onChange={handleDateSelect}
              tabIndex={-1}
            />
          </button>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="p-4 pb-24 space-y-2">
        {timeSlots.map((slot, index) => {
          const apt = getAppointmentStartingAt(slot);
          const isBusy = isSlotOccupiedByOngoing(slot);
          
          if (isBusy) return null;

          if (apt) {
            const isBlocked = apt.status === AppointmentStatus.BLOCKED;
            const service = isBlocked ? null : services.find(s => s.id === apt.serviceId);
            const client = isBlocked ? null : clients.find(c => c.id === apt.clientId);
            const duration = isBlocked ? (apt.customDuration || 60) : (service?.durationMinutes || 60);
            
            return (
              <div key={`apt-${apt.id}`} className="flex gap-4 animate-in slide-in-from-right-2 duration-300">
                <div className="flex flex-col items-end w-14 pt-2">
                  <span className="text-sm font-bold text-stone-800">
                    {slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div 
                  className={`flex-1 relative rounded-2xl p-4 border-l-4 shadow-sm active:scale-[0.98] transition-transform cursor-pointer
                    ${isBlocked 
                        ? 'bg-[repeating-linear-gradient(45deg,#f5f5f4,#f5f5f4_10px,#fafaf9_10px,#fafaf9_20px)] border-stone-400' 
                        : (service?.color || 'bg-white border-stone-300')
                    }`}
                  onClick={() => setViewApt(apt)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-bold ${isBlocked ? 'text-stone-500 italic' : 'text-stone-900'}`}>
                          {isBlocked ? 'BLOQUEADO' : service?.name}
                      </h3>
                      {!isBlocked && <p className="text-sm opacity-80 mb-2">{client?.name}</p>}
                      <div className="flex gap-2">
                         <span className="px-2 py-0.5 bg-white/50 rounded text-xs font-medium">
                           {duration} min
                         </span>
                         {!isBlocked && (
                            <span className="px-2 py-0.5 bg-white/50 rounded text-xs font-medium">
                            R$ {service?.price}
                            </span>
                         )}
                      </div>
                    </div>
                    {client && !isBlocked && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          openWhatsApp(client.phone, client.name, slot);
                        }}
                        className="p-2 bg-white rounded-full shadow-sm text-green-600 active:scale-90 transition-transform"
                      >
                        <MessageCircle size={18} fill="currentColor" className="text-white" />
                        <MessageCircle size={18} className="absolute top-2 left-2" />
                      </button>
                    )}
                    {isBlocked && (
                        <div className="text-stone-400">
                            <Ban size={20} />
                        </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Render Empty Slot
          return (
            <div key={`slot-${index}`} className="flex gap-4 group">
              <div className="flex flex-col items-end w-14 pt-2">
                <span className="text-sm font-medium text-stone-400 group-hover:text-primary-400 transition-colors">
                  {slot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <button 
                onClick={() => handleSlotClick(slot)}
                className="flex-1 h-12 rounded-xl border-2 border-dashed border-stone-200 hover:border-primary-200 hover:bg-primary-50/50 flex items-center justify-center text-stone-300 hover:text-primary-400 transition-all active:scale-[0.98]"
              >
                <Plus size={20} />
                <span className="ml-2 text-sm font-medium">Disponível</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-40">
        <button 
          onClick={() => {
            setNewAptTime(''); 
            resetModal();
            setIsModalOpen(true);
          }}
          className="w-14 h-14 bg-primary-600 rounded-full shadow-lg shadow-primary-200 flex items-center justify-center text-white active:scale-90 transition-transform"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* New Appointment Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={resetModal}
        title="Gerenciar Horário"
      >
        <div className="space-y-4">
          <Tabs 
            options={[
                {label: 'Novo Agendamento', value: 'APPOINTMENT'},
                {label: 'Bloqueio / Pausa', value: 'BLOCK'}
            ]}
            value={modalTab}
            onChange={setModalTab}
          />

          {modalTab === 'APPOINTMENT' ? (
              <>
                <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1 ml-1 flex items-center gap-1">
                    <User size={12} /> Cliente
                    </label>
                    <Select 
                    value={newAptClientId} 
                    onChange={(e) => setNewAptClientId(e.target.value)}
                    className={!newAptClientId ? "text-stone-400" : ""}
                    >
                    <option value="" disabled>Selecione a cliente</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id} className="text-stone-800">{c.name}</option>
                    ))}
                    </Select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1 ml-1 flex items-center gap-1">
                    <Scissors size={12} /> Serviço
                    </label>
                    <Select 
                    value={newAptServiceId} 
                    onChange={(e) => setNewAptServiceId(e.target.value)}
                    className={!newAptServiceId ? "text-stone-400" : ""}
                    >
                    <option value="" disabled>Selecione o serviço</option>
                    {services.map(s => (
                        <option key={s.id} value={s.id} className="text-stone-800">
                        {s.name} ({s.durationMinutes} min - R${s.price})
                        </option>
                    ))}
                    </Select>
                </div>
              </>
          ) : (
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <div className="flex items-start gap-2 text-orange-600 mb-4">
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <p className="text-xs">
                        Bloqueie horários para almoço, descanso ou compromissos pessoais.
                        O horário ficará indisponível na agenda online.
                    </p>
                </div>
                <div>
                    <label className="block text-xs font-medium text-stone-500 mb-1 ml-1 flex items-center gap-1">
                    <Clock size={12} /> Tempo de Bloqueio (minutos)
                    </label>
                    <Input 
                        type="number"
                        value={blockDuration}
                        onChange={(e) => setBlockDuration(e.target.value)}
                        placeholder="Ex: 60"
                    />
                </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1 ml-1 flex items-center gap-1">
              <Clock size={12} /> Horário ({selectedDate.toLocaleDateString()})
            </label>
            <Input 
              type="time" 
              value={newAptTime}
              onChange={(e) => setNewAptTime(e.target.value)}
            />
          </div>

          <div className="pt-4">
            <Button 
                fullWidth 
                onClick={handleSave} 
                disabled={
                    modalTab === 'APPOINTMENT' 
                    ? (!newAptClientId || !newAptServiceId || !newAptTime)
                    : (!blockDuration || !newAptTime)
                }
                variant={modalTab === 'BLOCK' ? 'secondary' : 'primary'}
            >
              {modalTab === 'APPOINTMENT' ? 'Confirmar Agendamento' : 'Confirmar Bloqueio'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* View/Edit Modal */}
      <Modal
        isOpen={!!viewApt}
        onClose={() => setViewApt(null)}
        title={viewApt?.status === AppointmentStatus.BLOCKED ? "Detalhes do Bloqueio" : "Detalhes do Agendamento"}
      >
         {viewApt && (
            <div className="space-y-6">
                <div className="flex flex-col items-center">
                    {viewApt.status === AppointmentStatus.BLOCKED ? (
                         <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center text-stone-400 mb-2">
                            <Ban size={32} />
                         </div>
                    ) : (
                        <Avatar src={clients.find(c => c.id === viewApt.clientId)?.avatarUrl || ''} alt="Client" size="lg" />
                    )}
                    
                    <h3 className="mt-2 text-lg font-bold text-stone-800">
                        {viewApt.status === AppointmentStatus.BLOCKED ? 'Horário Indisponível' : clients.find(c => c.id === viewApt.clientId)?.name}
                    </h3>
                    
                    {!viewApt.status && (
                        <p className="text-primary-600 font-medium">
                            {services.find(s => s.id === viewApt.serviceId)?.name}
                        </p>
                    )}
                    
                    <p className="text-stone-500 text-sm mt-1">
                         {new Date(viewApt.date).toLocaleDateString()} às {new Date(viewApt.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                    </p>
                     <p className="text-stone-400 text-xs mt-1">
                         Duração: {viewApt.status === AppointmentStatus.BLOCKED ? viewApt.customDuration : services.find(s => s.id === viewApt.serviceId)?.durationMinutes} min
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button fullWidth variant="secondary" icon={XCircle} onClick={handleCancelApt}>
                        Cancelar/Liberar
                    </Button>
                    <Button fullWidth variant="danger" icon={Trash2} onClick={handleDeleteApt}>
                        Excluir
                    </Button>
                </div>
            </div>
         )}
      </Modal>
    </div>
  );
};

export default Schedule;
