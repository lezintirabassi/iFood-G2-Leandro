import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ContextoAutenticacao = createContext({});

export function ProvedorAutenticacao({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // Verificar sessão inicial
    const verificarSessao = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUsuario(session?.user ?? null);
      } catch (erro) {
        console.error('Erro ao verificar sessão:', erro);
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    };

    verificarSessao();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Evento de autenticação:', event);
      setUsuario(session?.user ?? null);
      setCarregando(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
        throw error;
      }
      setUsuario(null);
      // Limpar o localStorage para garantir que todas as informações de sessão sejam removidas
      window.localStorage.removeItem('supabase.auth.token');
    } catch (erro) {
      console.error('Erro ao fazer logout:', erro);
      // Mesmo com erro, limpar o estado local
      setUsuario(null);
      window.localStorage.removeItem('supabase.auth.token');
    }
  };

  const valor = {
    usuario,
    carregando,
    estaAutenticado: !!usuario,
    logout
  };

  return (
    <ContextoAutenticacao.Provider value={valor}>
      {!carregando && children}
    </ContextoAutenticacao.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(ContextoAutenticacao);
  if (!contexto) {
    throw new Error('useAuth deve ser usado dentro de um ProvedorAutenticacao');
  }
  return contexto;
}