
import React, { useState } from 'react';
import { Search, Phone, Star, ChevronLeft, Calendar, Image as ImageIcon, Plus, Camera, AlertCircle } from 'lucide-react';
import { Card, Avatar, Button, Modal, Input } from '../components/ui';
import { useApp } from '../context/AppContext';
import { Client, AppointmentStatus } from '../types';

const Clients: React.FC = () => {
  const { clients, appointments, services, addClient, updateClient, addClientPhoto, userConfig } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // New Client Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');

  // Simulated local state for photos to show instant feedback without complex backend
  const [localPhotos, setLocalPhotos] = useState<string[]>([
     'https://picsum.photos/300/300?random=1',
     'https://picsum.photos/300/300?random=2',
     'https://picsum.photos/300/300?random=3'
  ]);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClient = () => {
    if(!newClientName || !newClientPhone) return;
    addClient({
      name: newClientName,
      phone: newClientPhone,
      avatarUrl: '', // Will be generated in context
      notes: ''
    });
    setIsAddModalOpen(false);
    setNewClientName('');
    setNewClientPhone('');
  };
  
  const handleAddPhoto = () => {
    if(selectedClient) {
        addClientPhoto(selectedClient.id);
        setLocalPhotos(prev => [`https://picsum.photos/300/300?random=${Date.now()}`, ...prev]);
    }
  };

  const toggleDepositRequirement = () => {
    if(selectedClient) {
        const updated = { ...selectedClient, requiresDeposit: !selectedClient.requiresDeposit };
        setSelectedClient(updated);
        updateClient(updated);
    }
  };

  // --- Client Detail View ---
  if (selectedClient) {
    const clientHistory = appointments
      .filter(apt => apt.clientId === selectedClient.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <div className="flex flex-col h-full bg-stone-50">
        {/* Detail Header */}
        <div className="sticky top-0 bg-white z-10 px-4 py-4 border-b border-stone-100 flex items-center gap-4">
          <button 
            onClick={() => setSelectedClient(null)} 
            className="p-2 -ml-2 hover:bg-stone-50 rounded-full text-stone-600"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-stone-800">Perfil da Cliente</h1>
        </div>

        <div className="p-4 space-y-6 pb-20">
          {/* Profile Card */}
          <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
            <Avatar src={selectedClient.avatarUrl} alt={selectedClient.name} size="xl" />
            <h2 className="mt-4 text-xl font-bold text-stone-800">{selectedClient.name}</h2>
            <p className="text-stone-500 text-sm mb-4">{selectedClient.phone}</p>
            
            <div className="flex gap-4 w-full">
              <Button 
                fullWidth 
                variant="outline" 
                icon={Phone} 
                onClick={() => window.location.href = `tel:${selectedClient.phone}`}
              >
                Ligar
              </Button>
              <Button 
                fullWidth 
                icon={Calendar} 
                onClick={() => {
                  setSelectedClient(null);
                }}
              >
                Agendar
              </Button>
            </div>
          </div>

          {/* Deposit Toggle (Only if Specific Scope is active) */}
          {userConfig.depositConfig?.enabled && userConfig.depositConfig.scope === 'SPECIFIC' && (
             <Card className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-stone-800 flex items-center gap-2">
                        <AlertCircle size={16} className="text-orange-500" /> Exigir Sinal?
                    </h3>
                    <p className="text-xs text-stone-500 mt-1">
                        Sinal de {userConfig.depositConfig.percentage}% no agendamento.
                    </p>
                </div>
                <button 
                  onClick={toggleDepositRequirement}
                  className={`w-12 h-6 rounded-full transition-colors relative ${selectedClient.requiresDeposit ? 'bg-primary-500' : 'bg-stone-300'}`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${selectedClient.requiresDeposit ? 'left-7' : 'left-1'}`} />
                </button>
             </Card>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="flex flex-col items-center justify-center py-4">
               <span className="text-2xl font-bold text-primary-600">{clientHistory.length}</span>
               <span className="text-xs text-stone-400 uppercase font-bold tracking-wider">Visitas</span>
            </Card>
            <Card className="flex flex-col items-center justify-center py-4">
               <span className="text-2xl font-bold text-stone-800">
                 {Math.round(Math.random() * 30)} dias
               </span>
               <span className="text-xs text-stone-400 uppercase font-bold tracking-wider">Média Retorno</span>
            </Card>
          </div>

          {/* Tabs Section */}
          <div>
             <div className="flex justify-between items-center mb-3">
                 <h3 className="font-bold text-stone-800 flex items-center gap-2">
                    <ImageIcon size={18} /> Galeria
                 </h3>
                 <button onClick={handleAddPhoto} className="text-primary-600 text-sm font-medium flex items-center gap-1">
                     <Camera size={16} /> Adicionar
                 </button>
             </div>
             <div className="grid grid-cols-3 gap-2">
               {localPhotos.map((src, i) => (
                 <div key={i} className="aspect-square rounded-lg bg-stone-200 overflow-hidden relative group">
                   <img 
                      src={src} 
                      alt="Gallery" 
                      className="w-full h-full object-cover animate-in fade-in duration-500"
                   />
                 </div>
               ))}
             </div>
          </div>

          <div>
            <h3 className="font-bold text-stone-800 mb-3 flex items-center gap-2">
               <Calendar size={18} /> Histórico
             </h3>
             <div className="space-y-3">
               {clientHistory.length === 0 ? (
                 <p className="text-sm text-stone-400 text-center py-4">Nenhuma visita registrada.</p>
               ) : (
                 clientHistory.map(apt => {
                   const service = services.find(s => s.id === apt.serviceId);
                   return (
                     <Card key={apt.id} className="flex justify-between items-center py-3">
                        <div>
                          <p className="font-bold text-stone-800 text-sm">{service?.name}</p>
                          <p className="text-xs text-stone-400">
                            {new Date(apt.date).toLocaleDateString()} • {new Date(apt.date).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                          </p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          apt.status === AppointmentStatus.COMPLETED ? 'bg-green-100 text-green-700' : 
                          apt.status === AppointmentStatus.CANCELLED ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {apt.status === AppointmentStatus.COMPLETED ? 'Realizado' : 
                           apt.status === AppointmentStatus.CANCELLED ? 'Cancelado' : 'Agendado'}
                        </span>
                     </Card>
                   );
                 })
               )}
             </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Main List View ---
  return (
    <div className="p-4 space-y-4 pb-20">
      <div className="flex justify-between items-center mt-2">
        <h1 className="text-xl font-bold text-stone-800">Clientes</h1>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="p-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400" size={20} />
        <input 
          type="text"
          placeholder="Buscar cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent"
        />
      </div>

      {/* Client List */}
      <div className="grid gap-3">
        {filteredClients.map(client => (
          <Card 
            key={client.id} 
            onClick={() => setSelectedClient(client)}
            className="flex items-center gap-4 active:bg-stone-50"
          >
            <Avatar src={client.avatarUrl} alt={client.name} />
            <div className="flex-1">
              <h3 className="font-semibold text-stone-800">{client.name}</h3>
              <p className="text-xs text-stone-500">Última visita: {new Date(client.lastVisit).toLocaleDateString()}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center text-yellow-500 text-xs font-bold gap-1">
                <span>{client.totalVisits}</span>
                <Star size={12} fill="currentColor" />
              </div>
              {client.requiresDeposit && (
                  <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-medium">
                    Exige Sinal
                  </span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Add Client Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Nova Cliente">
        <div className="space-y-4">
          <Input 
            label="Nome Completo" 
            placeholder="Ex: Maria Souza" 
            value={newClientName}
            onChange={(e) => setNewClientName(e.target.value)}
          />
          <Input 
            label="Telefone (WhatsApp)" 
            placeholder="Ex: 11999999999" 
            type="tel"
            value={newClientPhone}
            onChange={(e) => setNewClientPhone(e.target.value)}
          />
          <div className="pt-2">
             <Button fullWidth onClick={handleCreateClient}>Salvar Cliente</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Clients;