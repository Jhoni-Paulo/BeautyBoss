
import React from 'react';
import { LucideIcon, X } from 'lucide-react';

// --- Card Component ---
export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ 
  children, 
  className = '', 
  onClick 
}) => (
  <div 
    onClick={onClick}
    className={`bg-white rounded-2xl p-4 shadow-sm border border-stone-100 ${onClick ? 'active:scale-98 transition-transform cursor-pointer' : ''} ${className}`}
  >
    {children}
  </div>
);

// --- Button Component ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon: Icon, 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  const sizes = {
    sm: "h-9 px-3 text-xs rounded-lg",
    md: "h-12 px-6 text-sm rounded-xl",
    lg: "h-14 px-8 text-base rounded-2xl"
  };

  const baseStyles = "font-medium transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary-500 text-white shadow-lg shadow-primary-200 hover:bg-primary-600",
    secondary: "bg-primary-50 text-primary-700 hover:bg-primary-100",
    outline: "border-2 border-stone-200 text-stone-600 hover:border-stone-300 bg-transparent",
    ghost: "bg-transparent text-stone-500 hover:bg-stone-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };

  return (
    <button 
      className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 18} />}
      {children}
    </button>
  );
};

// --- Avatar Component ---
export const Avatar: React.FC<{ src: string; alt: string; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ src, alt, size = 'md' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm`} 
    />
  );
};

// --- Badge Component ---
export const Badge: React.FC<{ children: React.ReactNode; color?: string }> = ({ children, color = 'bg-stone-100 text-stone-600' }) => (
  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${color}`}>
    {children}
  </span>
);

// --- Input Component ---
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-medium text-stone-500 mb-1 ml-1">{label}</label>}
    <input 
      className={`w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all ${className}`}
      {...props}
    />
  </div>
);

// --- Select Component ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select: React.FC<SelectProps> = ({ label, children, className = '', ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-medium text-stone-500 mb-1 ml-1">{label}</label>}
    <select 
      className={`w-full h-12 px-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:bg-white transition-all appearance-none ${className}`}
      {...props}
    >
      {children}
    </select>
  </div>
);

// --- Tabs Component ---
interface TabsProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (val: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ options, value, onChange }) => (
  <div className="flex bg-stone-100 p-1 rounded-xl mb-4">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
          value === opt.value
            ? 'bg-white text-stone-800 shadow-sm'
            : 'text-stone-400 hover:text-stone-600'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

// --- Modal Component ---
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative bg-white w-full sm:w-[400px] sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-stone-100">
          <h2 className="text-lg font-bold text-stone-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full text-stone-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto no-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
