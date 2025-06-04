import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ContextoAutenticacao = createContext({});

export function ProvedorAutenticacao({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const verificarSessao = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Sessão atual:', session);
        if (session?.user) {
          setUsuario(session.user);
        } else {
          setUsuario(null);
        }
      } catch (erro) {
        console.error('Erro ao verificar sessão:', erro);
        setUsuario(null);
      } finally {
        setCarregando(false);
      }
    };

    verificarSessao();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Evento de autenticação:', event, session);
      if (session?.user) {
        setUsuario(session.user);
      } else {
        setUsuario(null);
      }
      setCarregando(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUsuario(null);
      window.localStorage.removeItem('supabase.auth.token');
    } catch (erro) {
      console.error('Erro ao fazer logout:', erro);
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