
import React, { useState } from 'react';
import { ChevronLeft, Calendar as CalendarIcon, Clock, Check, Share2, Sparkles, MessageCircle, AlertTriangle, User, Phone } from 'lucide-react';
import { Card, Button, Avatar, Input } from '../components/ui';
import { useApp } from '../context/AppContext';
import { Service, PageView, AppointmentStatus } from '../types';

interface PublicBookingProps {
  onBack: () => void;
}

const PublicBooking: React.FC<PublicBookingProps> = ({ onBack }) => {
  const { userConfig, services, appointments, currentUser } = useApp();
  
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Client Data State
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // --- Helpers ---
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

  const handleShare = async () => {
    const shareData = {
        title: userConfig.businessName,
        text: 'Agende seu horário comigo!',
        url: window.location.href,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (error) {
            console.log('Error sharing:', error);
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareData.url);
            alert('Link copiado para a área de transferência!');
        } catch (err) {
            alert('Não foi possível copiar o link automaticamente.');
        }
    }
  };

  // --- Deposit Calculation Logic ---
  const depositConfig = userConfig.depositConfig;
  const isDepositActive = depositConfig?.enabled;
  
  // We determine if we show the deposit warning.
  const showDepositInfo = isDepositActive && (depositConfig.scope === 'ALL' || depositConfig.scope === 'NEW');
  
  const depositAmount = (selectedService && isDepositActive) 
     ? (selectedService.price * depositConfig.percentage / 100) 
     : 0;

  // --- Logic: Generate Available Slots ---
  const generateSlots = () => {
    if (!selectedService) return [];

    const slots = [];
    const startHour = userConfig.startHour;
    const endHour = userConfig.endHour;
    const now = new Date();
    
    let current = new Date(selectedDate);
    current.setHours(startHour, 0, 0, 0);
    
    const end = new Date(selectedDate);
    end.setHours(endHour, 0, 0, 0);

    // Filter appointments for the day (Include BLOCKED)
    const dayAppointments = appointments.filter(apt => 
      isSameDay(new Date(apt.date), selectedDate) && apt.status !== 'CANCELLED'
    );

    while (current < end) {
      // 1. Past Time Check
      if (isSameDay(current, now) && current < now) {
          current = new Date(current.getTime() + 30 * 60000);
          continue;
      }

      const slotTime = current.getTime();
      const selectedDurationMs = (selectedService.durationMinutes) * 60000;
      const proposedEnd = slotTime + selectedDurationMs;
      
      const isBusy = dayAppointments.some(apt => {
        const aptStart = new Date(apt.date).getTime();
        
        // Calculate duration based on Type (Service vs Block)
        let aptDuration = 60 * 60000;
        if (apt.status === AppointmentStatus.BLOCKED) {
           aptDuration = (apt.customDuration || 60) * 60000;
        } else {
           const service = services.find(s => s.id === apt.serviceId);
           aptDuration = (service?.durationMinutes || 60) * 60000;
        }

        const aptEnd = aptStart + aptDuration;

        // Intersection Check:
        return (slotTime < aptEnd && proposedEnd > aptStart);
      });

      if (!isBusy) {
        slots.push(new Date(current));
      }
      
      // Step: 30 mins
      current = new Date(current.getTime() + 30 * 60000);
    }
    return slots;
  };

  const slots = generateSlots();

  const handleWhatsAppBooking = () => {
    if (!selectedService || !selectedTime) return;
    
    if (!clientName || !clientPhone) {
        alert("Por favor, preencha seu nome e telefone para continuar.");
        return;
    }

    const dateStr = selectedDate.toLocaleDateString('pt-BR');
    let text = `Olá! Gostaria de agendar *${selectedService.name}* para o dia *${dateStr}* às *${selectedTime}*.`;
    
    text += `\n\n*Meus Dados:*`;
    text += `\nNome: ${clientName}`;
    text += `\nTelefone: ${clientPhone}`;

    if (showDepositInfo) {
        text += `\n\nEstou ciente do sinal de reserva de R$ ${depositAmount.toFixed(2)}.`;
    }

    // Use dynamic admin phone or fallback
    const adminPhone = userConfig.businessPhone ? userConfig.businessPhone.replace(/\D/g, '') : "5511999999999";
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="bg-white min-h-screen pb-safe">
      {/* --- Admin Bar (Demo Only) --- */}
      <div className="bg-stone-900 text-white text-xs py-2 px-4 flex justify-between items-center sticky top-0 z-50">
        <span>Modo Visualização do Cliente</span>
        <button onClick={onBack} className="underline font-medium hover:text-primary-300">
          Voltar para Admin
        </button>
      </div>

      {/* --- Header / Profile --- */}
      <div className="bg-primary-50 p-6 rounded-b-[2.5rem] shadow-sm flex flex-col items-center text-center space-y-3 pt-8">
        <div className="p-1 bg-white rounded-full shadow-md">
           <Avatar src={currentUser?.avatarUrl || ""} alt="Logo" size="xl" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-800">{userConfig.businessName}</h1>
          <p className="text-stone-500 text-sm max-w-[250px] mx-auto">
            Realçando sua beleza natural com cuidado e elegância. Agende seu horário abaixo.
          </p>
        </div>
        <div className="flex gap-2 text-primary-600 text-sm font-medium">
          <span className="flex items-center gap-1"><Sparkles size={14}/> Especialista</span>
          <span className="text-stone-300">•</span>
          <span className="flex items-center gap-1">4.9 <span className="text-yellow-400">★</span></span>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-md mx-auto pb-32">
        
        {/* --- 1. Select Service --- */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-xs">1</span>
            Escolha o Procedimento
          </h2>
          <div className="space-y-3">
            {services.map(service => (
              <div 
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  setSelectedTime(null); // Reset time when service changes
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                  selectedService?.id === service.id 
                    ? 'border-primary-500 bg-primary-50 shadow-md ring-1 ring-primary-500' 
                    : 'border-stone-100 bg-white hover:border-primary-200'
                }`}
              >
                <div>
                  <h3 className="font-bold text-stone-800">{service.name}</h3>
                  <p className="text-xs text-stone-500 mt-1">{service.durationMinutes} minutos</p>
                </div>
                <div className="flex items-center gap-3">
                   <span className="font-semibold text-stone-900">R$ {service.price}</span>
                   {selectedService?.id === service.id && <div className="text-primary-600"><Check size={20} /></div>}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- 2. Select Date & Time (Only if service selected) --- */}
        {selectedService && (
          <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-xs">2</span>
              Escolha o Horário
            </h2>

            {/* Date Picker */}
            <div className="flex items-center justify-between bg-stone-50 p-2 rounded-xl">
              <button onClick={() => changeDate(-1)} className="p-2 hover:bg-white rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-stone-400" />
              </button>
              <div className="text-center">
                <span className="block text-xs font-semibold text-stone-400 uppercase">
                  {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long' })}
                </span>
                <span className="block text-lg font-bold text-stone-800">
                  {selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
                </span>
              </div>
              <button onClick={() => changeDate(1)} className="p-2 hover:bg-white rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-stone-400 rotate-180" />
              </button>
            </div>

            {/* Time Slots Grid */}
            <div className="grid grid-cols-4 gap-2">
              {slots.length === 0 ? (
                <div className="col-span-4 py-8 text-center text-stone-400 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                  Sem horários livres para este dia.
                </div>
              ) : (
                slots.map((date, idx) => {
                  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  const isSelected = selectedTime === timeStr;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedTime(timeStr)}
                      className={`py-2 px-1 rounded-xl text-sm font-medium transition-all ${
                        isSelected 
                          ? 'bg-primary-600 text-white shadow-lg shadow-primary-200 scale-105' 
                          : 'bg-white border border-stone-200 text-stone-600 hover:border-primary-300'
                      }`}
                    >
                      {timeStr}
                    </button>
                  );
                })
              )}
            </div>
          </section>
        )}

        {/* --- 3. Client Details (Only if Time Selected) --- */}
        {selectedService && selectedTime && (
            <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                 <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center text-xs">3</span>
                    Seus Dados
                </h2>
                <div className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm space-y-4">
                     <div>
                        <div className="relative">
                            <User className="absolute left-4 top-3.5 text-stone-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="Seu Nome Completo"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300"
                            />
                        </div>
                     </div>
                     <div>
                        <div className="relative">
                            <Phone className="absolute left-4 top-3.5 text-stone-400" size={18} />
                            <input 
                                type="tel" 
                                placeholder="Seu WhatsApp (Ex: 11999999999)"
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                className="w-full h-12 pl-12 pr-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300"
                            />
                        </div>
                     </div>
                </div>
            </section>
        )}
        
        {/* --- Deposit Info Block --- */}
        {selectedService && selectedTime && showDepositInfo && (
             <div className="animate-in slide-in-from-bottom-4 duration-700 delay-100">
                 <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-start gap-3">
                    <AlertTriangle size={20} className="text-orange-500 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-orange-800">
                            Reserva de Horário
                        </p>
                        <p className="text-xs text-orange-700">
                            {depositConfig.scope === 'NEW' 
                                ? 'Para novas clientes, é necessário um sinal para confirmar.' 
                                : 'É necessário um sinal de reserva para confirmar este horário.'}
                        </p>
                        <div className="pt-2 flex justify-between items-center border-t border-orange-200/50 mt-2">
                             <div className="text-xs text-orange-600">
                                Total: R$ {selectedService.price.toFixed(2)}
                             </div>
                             <div className="text-right">
                                 <p className="text-xs font-bold text-orange-800">Sinal: R$ {depositAmount.toFixed(2)}</p>
                                 <p className="text-[10px] text-orange-600">Restante: R$ {(selectedService.price - depositAmount).toFixed(2)}</p>
                             </div>
                        </div>
                    </div>
                 </div>
             </div>
        )}

        {/* --- 4. Action --- */}
        {selectedService && selectedTime && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-stone-100 animate-in slide-in-from-bottom-full z-40 pb-safe">
            <Button 
              fullWidth 
              size="lg" 
              className={`shadow-xl shadow-green-200 bg-[#25D366] hover:bg-[#128C7E] ${(!clientName || !clientPhone) ? 'opacity-75' : ''}`}
              icon={MessageCircle}
              onClick={handleWhatsAppBooking}
            >
              Agendar no WhatsApp
            </Button>
            <p className="text-center text-[10px] text-stone-400 mt-2">
              Você será redirecionado para o WhatsApp para confirmar.
            </p>
          </div>
        )}

        {/* --- Footer --- */}
        <div className="pt-10 pb-10 text-center">
          <button 
            onClick={handleShare}
            className="text-primary-600 font-bold flex items-center justify-center gap-2 mx-auto text-sm hover:scale-105 transition-transform"
          >
            <Share2 size={16} /> Compartilhar Perfil
          </button>
        </div>

      </div>
    </div>
  );
};

export default PublicBooking;
