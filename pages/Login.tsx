
import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle, User as UserIcon } from 'lucide-react';
import { Button, Input } from '../components/ui';
import { useApp } from '../context/AppContext';

const Login: React.FC = () => {
  const { login, signUp } = useApp();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (isLoginMode) {
      const { error } = await login(email, password);
      if (error) {
        setError('Erro ao entrar. Verifique email e senha.');
        setIsLoading(false);
      }
    } else {
      if (!name) {
        setError('Por favor, informe seu nome.');
        setIsLoading(false);
        return;
      }
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error.message);
      } else {
        setMessage('Conta criada! Verifique seu email para confirmar ou entre direto (se o modo teste estiver ativo).');
        // In local development often auto-confirms, but standard requires email check
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Logo / Brand */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 bg-primary-100 rounded-3xl flex items-center justify-center text-primary-500 shadow-xl shadow-primary-100/50 rotate-3">
            <Sparkles size={40} strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-800 tracking-tight">BeautyBoss</h1>
            <p className="text-stone-500 mt-2">Gerencie seu negócio de beleza<br/>com elegância e simplicidade.</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg border border-stone-100 space-y-6">
          
          <div className="text-center pb-2 border-b border-stone-100">
             <h2 className="text-lg font-bold text-stone-800">
               {isLoginMode ? 'Acessar Conta' : 'Criar Nova Conta'}
             </h2>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {message && (
             <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs flex items-center gap-2">
               <Sparkles size={16} />
               {message}
             </div>
          )}

          <div className="space-y-4">
            {!isLoginMode && (
              <div>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 text-stone-400" size={20} />
                  <input 
                    type="text" 
                    placeholder="Seu Nome Completo" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300"
                    required={!isLoginMode}
                  />
                </div>
              </div>
            )}
            <div>
               <div className="relative">
                 <Mail className="absolute left-4 top-3.5 text-stone-400" size={20} />
                 <input 
                   type="email" 
                   placeholder="Seu email" 
                   value={email}
                   onChange={(e) => setEmail(e.target.value)}
                   className="w-full h-12 pl-12 pr-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300"
                   required
                 />
               </div>
            </div>
            <div>
               <div className="relative">
                 <Lock className="absolute left-4 top-3.5 text-stone-400" size={20} />
                 <input 
                   type="password" 
                   placeholder="Sua senha" 
                   value={password}
                   onChange={(e) => setPassword(e.target.value)}
                   className="w-full h-12 pl-12 pr-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300"
                   required
                   minLength={6}
                 />
               </div>
            </div>
          </div>

          <Button 
            fullWidth 
            size="lg" 
            type="submit" 
            disabled={isLoading}
            className="group"
          >
            {isLoading ? 'Processando...' : (
              <span className="flex items-center gap-2">
                {isLoginMode ? 'Entrar agora' : 'Cadastrar'} 
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>

          <div className="flex items-center justify-center gap-4 text-sm text-stone-500 pt-2">
            <button 
              type="button" 
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              {isLoginMode ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Fazer Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
