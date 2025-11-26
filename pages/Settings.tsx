
import React, { useState } from 'react';
import { User, Settings as SettingsIcon, LogOut, ChevronRight, Edit2, Clock, Globe, Plus, Trash2, Share2, DollarSign, Wallet } from 'lucide-react';
import { Card, Button, Avatar, Modal, Input, Select } from '../components/ui';
import { useApp } from '../context/AppContext';
import { Service, PageView } from '../types';

interface SettingsProps {
  onNavigate: (page: PageView) => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const { services, updateService, addService, deleteService, userConfig, updateUserConfig, logout, currentUser, updateUserProfile } = useApp();
  
  // Service Edit State
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDuration, setEditDuration] = useState('');
  
  // New Service State
  const [isNewServiceModalOpen, setIsNewServiceModalOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('');
  const [newServiceColor, setNewServiceColor] = useState('bg-pink-100 border-pink-200 text-pink-700');

  // Hours Edit State
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [startHour, setStartHour] = useState(userConfig.startHour.toString());
  const [endHour, setEndHour] = useState(userConfig.endHour.toString());

  // Deposit Config State
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositEnabled, setDepositEnabled] = useState(userConfig.depositConfig?.enabled || false);
  const [depositPercentage, setDepositPercentage] = useState(userConfig.depositConfig?.percentage || 30);
  const [depositScope, setDepositScope] = useState(userConfig.depositConfig?.scope || 'ALL');

  // Profile Edit State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [editBusinessName, setEditBusinessName] = useState('');
  const [editBusinessPhone, setEditBusinessPhone] = useState('');
  const [editUserName, setEditUserName] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');

  // --- Handlers ---

  const openProfileModal = () => {
    setEditBusinessName(userConfig.businessName);
    setEditBusinessPhone(userConfig.businessPhone || '');
    setEditUserName(currentUser?.name || '');
    setEditAvatarUrl(currentUser?.avatarUrl || '');
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = () => {
    updateUserConfig({ businessName: editBusinessName, businessPhone: editBusinessPhone });
    updateUserProfile(editUserName, editAvatarUrl);
    setIsProfileModalOpen(false);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setEditPrice(service.price.toString());
    setEditDuration(service.durationMinutes.toString());
  };

  const handleSaveService = () => {
    if (editingService) {
      updateService({
        ...editingService,
        price: parseFloat(editPrice),
        durationMinutes: parseInt(editDuration)
      });
      setEditingService(null);
    }
  };

  const handleDeleteService = () => {
    if (editingService) {
        if (window.confirm(`Tem certeza que deseja excluir o serviço "${editingService.name}"?`)) {
            deleteService(editingService.id);
            setEditingService(null);
        }
    }
  };

  const handleCreateService = () => {
    if (!newServiceName || !newServicePrice || !newServiceDuration) return;
    addService({
        name: newServiceName,
        price: parseFloat(newServicePrice),
        durationMinutes: parseInt(newServiceDuration),
        color: newServiceColor
    });
    setIsNewServiceModalOpen(false);
    setNewServiceName('');
    setNewServicePrice('');
    setNewServiceDuration('');
  };

  const handleSaveHours = () => {
    updateUserConfig({
      startHour: parseInt(startHour),
      endHour: parseInt(endHour)
    });
    setIsHoursModalOpen(false);
  };

  const handleSaveDeposit = () => {
    updateUserConfig({
        depositConfig: {
            enabled: depositEnabled,
            percentage: depositPercentage,
            scope: depositScope
        }
    });
    setIsDepositModalOpen(false);
  };
  
  const handleShareProfile = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: userConfig.businessName,
      text: `Agende seu horário no ${userConfig.businessName}!`,
      url: window.location.href, // Em um app real, seria a URL pública específica
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (error) {
            console.log('Error sharing', error);
        }
    } else {
        // Fallback para Clipboard
        try {
            await navigator.clipboard.writeText(shareData.url);
            alert('Link copiado para a área de transferência!');
        } catch (err) {
            alert('Não foi possível copiar o link automaticamente.');
        }
    }
  };

  const colorOptions = [
    { value: 'bg-pink-100 border-pink-200 text-pink-700', label: 'Rosa' },
    { value: 'bg-purple-100 border-purple-200 text-purple-700', label: 'Roxo' },
    { value: 'bg-blue-100 border-blue-200 text-blue-700', label: 'Azul' },
    { value: 'bg-green-100 border-green-200 text-green-700', label: 'Verde' },
    { value: 'bg-orange-100 border-orange-200 text-orange-700', label: 'Laranja' },
    { value: 'bg-stone-100 border-stone-200 text-stone-700', label: 'Cinza' },
  ];

  return (
    <div className="p-4 space-y-6 pb-20">
      <h1 className="text-xl font-bold text-stone-800 mt-2">Perfil e Ajustes</h1>

      {/* User Card */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
        <Avatar src={currentUser?.avatarUrl || "https://picsum.photos/200/200"} alt="Profile" size="lg" />
        <div className="flex-1">
          <h2 className="font-bold text-stone-900">{userConfig.businessName}</h2>
          <p className="text-sm text-stone-500">{currentUser?.name}</p>
        </div>
        <Button variant="ghost" size="sm" onClick={openProfileModal}>
          <Edit2 size={16} />
        </Button>
      </div>

      {/* Public Page Link */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider ml-1">Divulgação</h3>
        <Card 
          className="bg-gradient-to-r from-primary-500 to-primary-600 border-none text-white active:scale-[0.99] transition-transform cursor-pointer relative"
          onClick={() => onNavigate('PUBLIC_BOOKING')}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-white/20 rounded-lg text-white">
                 <Globe size={20} />
               </div>
               <div>
                 <h4 className="font-bold text-white">Link na Bio (Página Pública)</h4>
                 <p className="text-xs text-primary-100">
                   Toque para visualizar
                 </p>
               </div>
            </div>
            <div className="flex items-center gap-3">
                 <button 
                    onClick={handleShareProfile}
                    className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                 >
                    <Share2 size={18} />
                 </button>
                 <ChevronRight size={16} className="text-primary-200" />
            </div>
          </div>
        </Card>
      </div>

      {/* Config Sections */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider ml-1">Configuração</h3>
        
        {/* Work Hours */}
        <Card 
          className="flex justify-between items-center active:scale-[0.99] transition-transform"
          onClick={() => setIsHoursModalOpen(true)}
        >
          <div className="flex items-center gap-3">
             <div className="p-2 bg-stone-100 rounded-lg text-stone-600">
               <Clock size={20} />
             </div>
             <div>
               <h4 className="font-semibold text-stone-800">Horário de Trabalho</h4>
               <p className="text-xs text-stone-500">
                 {userConfig.startHour}:00 às {userConfig.endHour}:00
               </p>
             </div>
          </div>
          <ChevronRight size={16} className="text-stone-300" />
        </Card>

        {/* Deposit / Sinal */}
        <Card 
          className="flex justify-between items-center active:scale-[0.99] transition-transform"
          onClick={() => setIsDepositModalOpen(true)}
        >
          <div className="flex items-center gap-3">
             <div className="p-2 bg-stone-100 rounded-lg text-stone-600">
               <Wallet size={20} />
             </div>
             <div>
               <h4 className="font-semibold text-stone-800">Sinal de Reserva</h4>
               <p className="text-xs text-stone-500">
                 {userConfig.depositConfig?.enabled ? `${userConfig.depositConfig.percentage}% (${userConfig.depositConfig.scope === 'ALL' ? 'Todas' : userConfig.depositConfig.scope === 'NEW' ? 'Novas' : 'Específicas'})` : 'Desativado'}
               </p>
             </div>
          </div>
          <ChevronRight size={16} className="text-stone-300" />
        </Card>
      </div>

      {/* Service Catalog */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider ml-1">Catálogo de Serviços</h3>
            <Button size="sm" variant="ghost" icon={Plus} onClick={() => setIsNewServiceModalOpen(true)}>Novo</Button>
        </div>
        
        <div className="space-y-3">
          {services.map(service => (
            <Card key={service.id} className="flex justify-between items-center active:scale-[0.99] transition-transform" onClick={() => openEditModal(service)}>
               <div>
                 <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${service.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
                    <h4 className="font-semibold text-stone-800">{service.name}</h4>
                 </div>
                 <p className="text-xs text-stone-500">
                   {service.durationMinutes} min • R$ {service.price.toFixed(2)}
                 </p>
               </div>
               <ChevronRight size={16} className="text-stone-300" />
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-wider ml-1">App</h3>
        <Card className="flex items-center gap-3 text-stone-600">
          <SettingsIcon size={20} />
          <span className="flex-1 font-medium">Preferências</span>
          <ChevronRight size={16} className="text-stone-300" />
        </Card>
        <Button 
          fullWidth 
          variant="danger" 
          icon={LogOut} 
          className="justify-start"
          onClick={logout}
        >
          Sair da conta
        </Button>
      </div>

      {/* Edit Profile Modal */}
      <Modal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        title="Editar Perfil"
      >
        <div className="space-y-4">
          <div className="flex justify-center mb-4">
             <Avatar src={editAvatarUrl || "https://picsum.photos/200/200"} alt="Preview" size="xl" />
          </div>
          <Input 
            label="Nome do Negócio" 
            value={editBusinessName}
            onChange={(e) => setEditBusinessName(e.target.value)}
          />
           <Input 
            label="WhatsApp do Negócio" 
            value={editBusinessPhone}
            onChange={(e) => setEditBusinessPhone(e.target.value)}
            placeholder="5511999999999"
          />
          <Input 
            label="Seu Nome" 
            value={editUserName}
            onChange={(e) => setEditUserName(e.target.value)}
          />
           <Input 
            label="URL da Foto (Avatar)" 
            value={editAvatarUrl}
            onChange={(e) => setEditAvatarUrl(e.target.value)}
            placeholder="https://..."
          />
          <div className="pt-2">
            <Button fullWidth onClick={handleSaveProfile}>Salvar Perfil</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Service Modal */}
      <Modal 
        isOpen={!!editingService} 
        onClose={() => setEditingService(null)} 
        title={`Editar ${editingService?.name}`}
      >
        <div className="space-y-4">
          <Input 
            label="Preço (R$)" 
            type="number" 
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
          />
          <Input 
            label="Duração (minutos)" 
            type="number" 
            value={editDuration}
            onChange={(e) => setEditDuration(e.target.value)}
          />
          <div className="pt-2 space-y-3">
            <Button fullWidth onClick={handleSaveService}>Salvar Alterações</Button>
            <Button fullWidth variant="danger" icon={Trash2} onClick={handleDeleteService}>Excluir Serviço</Button>
          </div>
        </div>
      </Modal>

      {/* New Service Modal */}
      <Modal 
        isOpen={isNewServiceModalOpen} 
        onClose={() => setIsNewServiceModalOpen(false)} 
        title="Novo Serviço"
      >
        <div className="space-y-4">
          <Input 
            label="Nome do Serviço" 
            placeholder="Ex: Spa dos Pés"
            value={newServiceName}
            onChange={(e) => setNewServiceName(e.target.value)}
          />
           <div className="flex gap-4">
            <Input 
                label="Preço (R$)" 
                type="number" 
                placeholder="0.00"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
            />
            <Input 
                label="Duração (min)" 
                type="number" 
                placeholder="60"
                value={newServiceDuration}
                onChange={(e) => setNewServiceDuration(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-500 mb-1 ml-1">Cor da Etiqueta</label>
            <Select value={newServiceColor} onChange={(e) => setNewServiceColor(e.target.value)}>
                {colorOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </Select>
          </div>
          <div className="pt-2">
            <Button fullWidth onClick={handleCreateService}>Criar Serviço</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Hours Modal */}
      <Modal 
        isOpen={isHoursModalOpen} 
        onClose={() => setIsHoursModalOpen(false)} 
        title="Horário de Atendimento"
      >
        <div className="space-y-4">
          <p className="text-sm text-stone-500">Defina o intervalo da sua agenda diária.</p>
          <div className="flex gap-4">
             <Input 
              label="Início (h)" 
              type="number" 
              min="0" max="23"
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
            />
            <Input 
              label="Fim (h)" 
              type="number" 
              min="0" max="23"
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
            />
          </div>
          <div className="pt-2">
            <Button fullWidth onClick={handleSaveHours}>Atualizar Horários</Button>
          </div>
        </div>
      </Modal>

      {/* Deposit Config Modal */}
      <Modal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        title="Configurar Sinal (Reserva)"
      >
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800">Habilitar Sinal</span>
                <button 
                  onClick={() => setDepositEnabled(!depositEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${depositEnabled ? 'bg-primary-500' : 'bg-stone-300'}`}
                >
                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${depositEnabled ? 'left-7' : 'left-1'}`} />
                </button>
            </div>

            {depositEnabled && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">
                            Porcentagem do Sinal: <span className="text-primary-600 font-bold">{depositPercentage}%</span>
                        </label>
                        <input 
                            type="range" 
                            min="10" 
                            max="100" 
                            step="5"
                            value={depositPercentage}
                            onChange={(e) => setDepositPercentage(parseInt(e.target.value))}
                            className="w-full accent-primary-500 h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                        />
                         <div className="flex justify-between text-xs text-stone-400 mt-1">
                            <span>10%</span>
                            <span>50%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-stone-700 mb-2">
                            Aplicar para:
                        </label>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-stone-50">
                                <input 
                                    type="radio" 
                                    name="scope" 
                                    checked={depositScope === 'ALL'} 
                                    onChange={() => setDepositScope('ALL')}
                                    className="accent-primary-500"
                                />
                                <span className="text-sm text-stone-700">Todas as Clientes</span>
                            </label>
                            <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-stone-50">
                                <input 
                                    type="radio" 
                                    name="scope" 
                                    checked={depositScope === 'NEW'} 
                                    onChange={() => setDepositScope('NEW')}
                                    className="accent-primary-500"
                                />
                                <span className="text-sm text-stone-700">Somente Novas Clientes (Primeira Vez)</span>
                            </label>
                            <label className="flex items-center gap-2 p-3 border rounded-xl cursor-pointer hover:bg-stone-50">
                                <input 
                                    type="radio" 
                                    name="scope" 
                                    checked={depositScope === 'SPECIFIC'} 
                                    onChange={() => setDepositScope('SPECIFIC')}
                                    className="accent-primary-500"
                                />
                                <div className="flex flex-col">
                                    <span className="text-sm text-stone-700">Clientes Específicas</span>
                                    <span className="text-[10px] text-stone-400">Gerencie no menu Clientes</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            )}
             <div className="pt-2">
                <Button fullWidth onClick={handleSaveDeposit}>Salvar Preferências</Button>
                {depositScope === 'SPECIFIC' && depositEnabled && (
                    <Button 
                        fullWidth 
                        variant="secondary" 
                        className="mt-2"
                        onClick={() => {
                            setIsDepositModalOpen(false);
                            onNavigate('CLIENTS');
                        }}
                    >
                        Gerenciar Clientes
                    </Button>
                )}
            </div>
        </div>
      </Modal>

      <div className="text-center text-xs text-stone-400 pt-8">
        Versão 1.3.0 • BeautyBoss
      </div>
    </div>
  );
};

export default Settings;
