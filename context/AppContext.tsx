
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appointment, Client, Service, Transaction, AppointmentStatus, UserConfig, User } from '../types';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AppContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ error: any }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ error: any }>;
  logout: () => void;
  userConfig: UserConfig;
  updateUserConfig: (config: Partial<UserConfig>) => void;
  updateUserProfile: (name: string, avatarUrl: string) => void;
  appointments: Appointment[];
  clients: Client[];
  services: Service[];
  transactions: Transaction[];
  addAppointment: (apt: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;
  addClient: (client: Omit<Client, 'id' | 'totalVisits' | 'lastVisit'>) => void;
  updateClient: (client: Client) => void;
  addClientPhoto: (clientId: string) => void;
  updateService: (service: Service) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  deleteService: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Data States
  const [userConfig, setUserConfig] = useState<UserConfig>({
    businessName: '',
    businessPhone: '',
    startHour: 8,
    endHour: 19,
    depositConfig: {
      enabled: false,
      percentage: 30,
      scope: 'ALL'
    }
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // --- 1. Auth & Initial Load ---
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      else setLoading(false);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchUserData(session.user.id);
      else {
        setCurrentUser(null);
        setAppointments([]);
        setClients([]);
        setServices([]);
        setTransactions([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 2. Data Fetching ---
  const fetchUserData = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch Profile/Config
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (profile) {
        setCurrentUser({
          id: userId,
          name: profile.full_name || 'Usuária',
          email: session?.user.email || '',
          avatarUrl: profile.avatar_url || ''
        });
        setUserConfig({
          businessName: profile.business_name || 'Meu Negócio',
          businessPhone: profile.phone || '',
          startHour: profile.start_hour || 8,
          endHour: profile.end_hour || 19,
          depositConfig: {
            enabled: profile.deposit_enabled || false,
            percentage: profile.deposit_percentage || 30,
            scope: profile.deposit_scope || 'ALL'
          }
        });
      }

      // Fetch Services
      const { data: servicesData } = await supabase.from('services').select('*');
      if (servicesData) {
        setServices(servicesData.map(s => ({
          ...s,
          durationMinutes: s.duration_minutes // map snake_case to camelCase
        })));
      }

      // Fetch Clients
      const { data: clientsData } = await supabase.from('clients').select('*');
      if (clientsData) {
        setClients(clientsData.map(c => ({
          ...c,
          avatarUrl: c.avatar_url,
          requiresDeposit: c.requires_deposit
        })));
      }

      // Fetch Appointments
      const { data: apptData } = await supabase.from('appointments').select('*');
      if (apptData) {
        setAppointments(apptData.map(a => ({
          ...a,
          clientId: a.client_id,
          serviceId: a.service_id,
          customDuration: a.custom_duration
        })));
      }

      // Fetch Transactions
      const { data: transData } = await supabase.from('transactions').select('*');
      if (transData) {
        setTransactions(transData);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- 3. Auth Actions ---
  const login = async (email: string, pass: string) => {
    return await supabase.auth.signInWithPassword({ email, password: pass });
  };

  const signUp = async (email: string, pass: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: { full_name: name } // Trigger will use this to create profile
      }
    });
    return { data, error };
  };

  const logout = () => {
    supabase.auth.signOut();
  };

  // --- 4. CRUD Operations (Optimistic Updates + Supabase Call) ---

  const updateUserConfig = async (config: Partial<UserConfig>) => {
    setUserConfig(prev => ({ ...prev, ...config }));
    
    // Map back to DB columns
    const dbUpdate: any = {};
    if (config.businessName) dbUpdate.business_name = config.businessName;
    if (config.businessPhone !== undefined) dbUpdate.phone = config.businessPhone;
    if (config.startHour) dbUpdate.start_hour = config.startHour;
    if (config.endHour) dbUpdate.end_hour = config.endHour;
    
    if (config.depositConfig) {
      dbUpdate.deposit_enabled = config.depositConfig.enabled;
      dbUpdate.deposit_percentage = config.depositConfig.percentage;
      dbUpdate.deposit_scope = config.depositConfig.scope;
    }

    if (currentUser?.id) {
       await supabase.from('profiles').update(dbUpdate).eq('id', currentUser.id);
    }
  };

  const updateUserProfile = async (name: string, avatarUrl: string) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, name, avatarUrl });
      await supabase.from('profiles').update({ full_name: name, avatar_url: avatarUrl }).eq('id', currentUser.id);
    }
  };

  // Services
  const addService = async (serviceData: Omit<Service, 'id'>) => {
    const tempId = Math.random().toString();
    const optimisticService = { ...serviceData, id: tempId, user_id: currentUser?.id };
    
    setServices([...services, optimisticService as Service]);

    const { data, error } = await supabase.from('services').insert([{
      name: serviceData.name,
      price: serviceData.price,
      duration_minutes: serviceData.durationMinutes,
      color: serviceData.color,
      user_id: currentUser?.id
    }]).select().single();

    if (data) {
      // Replace temp ID with real ID
      setServices(prev => prev.map(s => s.id === tempId ? { ...s, id: data.id } : s));
    } else if (error) {
      console.error(error);
      setServices(prev => prev.filter(s => s.id !== tempId)); // Revert
    }
  };

  const updateService = async (service: Service) => {
    setServices(prev => prev.map(s => s.id === service.id ? service : s));
    await supabase.from('services').update({
      name: service.name,
      price: service.price,
      duration_minutes: service.durationMinutes,
      color: service.color
    }).eq('id', service.id);
  };

  const deleteService = async (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    await supabase.from('services').delete().eq('id', id);
  };

  // Clients
  const addClient = async (clientData: Omit<Client, 'id' | 'totalVisits' | 'lastVisit'>) => {
    const tempId = Math.random().toString();
    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(clientData.name)}&background=random`;
    const optimisticClient = { ...clientData, id: tempId, avatarUrl: avatar, user_id: currentUser?.id };

    setClients([...clients, optimisticClient as Client]);

    const { data } = await supabase.from('clients').insert([{
      name: clientData.name,
      phone: clientData.phone,
      notes: clientData.notes,
      avatar_url: avatar,
      user_id: currentUser?.id,
      requires_deposit: clientData.requiresDeposit || false
    }]).select().single();

    if (data) {
      setClients(prev => prev.map(c => c.id === tempId ? { ...c, id: data.id } : c));
    }
  };

  const updateClient = async (client: Client) => {
    setClients(prev => prev.map(c => c.id === client.id ? client : c));
    await supabase.from('clients').update({
      name: client.name,
      phone: client.phone,
      notes: client.notes,
      requires_deposit: client.requiresDeposit
    }).eq('id', client.id);
  };

  const addClientPhoto = (clientId: string) => {
    // Placeholder: Real implementation would allow storage upload
    console.log('Upload photo logic needed for Supabase Storage');
  };

  // Appointments
  const addAppointment = async (aptData: Omit<Appointment, 'id'>) => {
    const tempId = Math.random().toString();
    const optimisticApt = { ...aptData, id: tempId, user_id: currentUser?.id };
    
    // 1. Optimistic Update
    setAppointments([...appointments, optimisticApt as Appointment]);

    // 2. Construct Payload allowing nulls
    const payload: any = {
      date: aptData.date,
      status: aptData.status,
      user_id: currentUser?.id,
      notes: aptData.notes,
      // Default to null if not provided
      client_id: aptData.clientId || null,
      service_id: aptData.serviceId || null,
      custom_duration: aptData.customDuration || null
    };

    // 3. Send to DB
    const { data, error } = await supabase.from('appointments').insert([payload]).select().single();

    // 4. Handle Result
    if (data) {
      // Success: Swap temp ID with real DB ID
      setAppointments(prev => prev.map(a => a.id === tempId ? { ...a, id: data.id } : a));
    } else {
      // Error: Revert optimistic update and log error
      console.error("Error saving appointment:", error);
      // Remove the optimistically added appointment
      setAppointments(prev => prev.filter(a => a.id !== tempId));
    }
  };

  const updateAppointmentStatus = async (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(apt => apt.id === id ? { ...apt, status } : apt));
    await supabase.from('appointments').update({ status }).eq('id', id);
  };

  const deleteAppointment = async (id: string) => {
    setAppointments(prev => prev.filter(apt => apt.id !== id));
    await supabase.from('appointments').delete().eq('id', id);
  };

  // Transactions
  const addTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    const tempId = Math.random().toString();
    const optimisticTrans = { ...transactionData, id: tempId, user_id: currentUser?.id };
    setTransactions(prev => [optimisticTrans as Transaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

    const { data } = await supabase.from('transactions').insert([{
      type: transactionData.type,
      amount: transactionData.amount,
      description: transactionData.description,
      category: transactionData.category,
      date: transactionData.date,
      user_id: currentUser?.id
    }]).select().single();

    if (data) {
      setTransactions(prev => prev.map(t => t.id === tempId ? { ...t, id: data.id } : t));
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    await supabase.from('transactions').delete().eq('id', id);
  };

  return (
    <AppContext.Provider value={{ 
      isAuthenticated: !!session,
      currentUser,
      loading,
      login,
      signUp,
      logout,
      userConfig,
      updateUserConfig,
      updateUserProfile,
      appointments, 
      clients, 
      services, 
      transactions,
      addAppointment,
      updateAppointmentStatus,
      deleteAppointment,
      addClient,
      updateClient,
      addClientPhoto,
      updateService,
      addService,
      deleteService,
      addTransaction,
      deleteTransaction
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};