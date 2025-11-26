import { createClient } from '@supabase/supabase-js';

// Credenciais fornecidas
const DEFAULT_SUPABASE_URL = "https://ektyriazekqmubtlyxcz.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrdHlyaWF6ZWtxbXVidGx5eGN6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTk4NjgsImV4cCI6MjA3OTczNTg2OH0.r0hxSHc3lLn0OHTJepVSdE7ziN7Y-7-c4RnCCGcUN3g";

// Função auxiliar para tentar pegar do .env (Vite ou React App), senão usa o padrão
const getEnvVar = (viteKey: string, reactKey: string, fallback: string) => {
  try {
    // Cast para 'any' para evitar erros de TS se import.meta não estiver definido
    const meta = import.meta as any;
    
    if (meta && meta.env) {
      if (meta.env[viteKey]) return meta.env[viteKey];
      if (meta.env[reactKey]) return meta.env[reactKey];
    }
  } catch (error) {
    // Silently fail if env is not accessible
  }
  return fallback;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'REACT_APP_SUPABASE_URL', DEFAULT_SUPABASE_URL);
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'REACT_APP_SUPABASE_ANON_KEY', DEFAULT_SUPABASE_ANON_KEY);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);