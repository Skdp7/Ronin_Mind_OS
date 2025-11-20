import { createClient } from '@supabase/supabase-js';

// Helper function to get env variables safely across different bundlers (Vite, Next.js, CRA)
const getEnv = (key: string) => {
  // Check Vite (import.meta.env)
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  // Check Node/Process (Next.js / CRA)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return undefined;
};

// Cerchiamo le chiavi con tutte le possibili combinazioni di prefissi standard
const supabaseUrl = 
  getEnv('VITE_SUPABASE_URL') || 
  getEnv('NEXT_PUBLIC_SUPABASE_URL') || 
  getEnv('REACT_APP_SUPABASE_URL');

const supabaseAnonKey = 
  getEnv('VITE_SUPABASE_ANON_KEY') || 
  getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || 
  getEnv('REACT_APP_SUPABASE_ANON_KEY');

console.log("Supabase Config Status:", supabaseUrl ? "URL Found" : "URL Missing");

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => {
    return !!supabase;
};