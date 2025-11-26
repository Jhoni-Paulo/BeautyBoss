
import React from 'react';
import { Sparkles } from 'lucide-react';

const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-stone-50 flex flex-col items-center justify-center z-[100]">
      <div className="relative">
        {/* Background Blob */}
        <div className="absolute inset-0 bg-primary-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
        
        {/* Logo Container */}
        <div className="relative w-24 h-24 bg-primary-500 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-primary-300 rotate-3 animate-bounce-subtle">
          <Sparkles size={48} strokeWidth={1.5} />
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-2">
        <h1 className="text-2xl font-bold text-stone-800 tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
          BeautyBoss
        </h1>
        <p className="text-stone-400 text-sm animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          Carregando seu espaço...
        </p>
      </div>

      {/* Loading Spinner */}
      <div className="absolute bottom-10 w-8 h-8 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin"></div>
    </div>
  );
};

export default SplashScreen;
