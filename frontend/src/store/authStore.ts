import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { supabase } from '../services/supabase';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, learning_language: 'english' | 'french') => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const user: User = {
            id: data.user.id,
            email: data.user.email!,
            name: profile?.name || '',
            learning_language: profile?.learning_language || 'english',
          };

          set({ user, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string, learning_language: 'english' | 'french') => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

          if (data.user) {
            await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                name,
                learning_language,
              });
          }

          set({ isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await supabase.auth.signOut();
          set({ user: null });
        } catch (error) {
          console.error('Logout error:', error);
          set({ user: null });
        }
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      initializeAuth: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || '',
            learning_language: profile?.learning_language || 'english',
          };

          set({ user });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);