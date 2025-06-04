import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Cadastro() {
  const navegacao = useNavigate();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const { error } = await supabase
        .from('usuarios')
        .insert([{ 
          nome, 
          email, 
          cpf: cpf.replace(/\D/g, '') 
        }]);

      if (error) {
        if (error.code === '23505') {
          if (error.message.includes('email')) {
            throw new Error('Este email já está cadastrado');
          }
          if (error.message.includes('cpf')) {
            throw new Error('Este CPF já está cadastrado');
          }
        }
        throw error;
      }

      alert('Cadastro realizado com sucesso!');
      navegacao('/login');
    } catch (erro) {
      console.error('Erro ao cadastrar:', erro);
      setErro(erro.message || 'Erro ao realizar cadastro. Por favor, tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-12 w-auto"
          src="https://logodownload.org/wp-content/uploads/2017/05/ifood-logo-0.png"
          alt="iFood"
        />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Criar sua conta
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {erro && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {erro}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                Nome completo
              </label>
              <div className="mt-1">
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-ifood-red focus:border-ifood-red sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-mail
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-ifood-red focus:border-ifood-red sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                CPF
              </label>
              <div className="mt-1">
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  required
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value.replace(/\D/g, ''))}
                  maxLength={11}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-ifood-red focus:border-ifood-red sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={carregando}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ifood-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifood-red disabled:opacity-50"
              >
                {carregando ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <p className="text-center text-sm text-gray-500">
                Já tem uma conta?{' '}
                <button
                  onClick={() => navegacao('/login')}
                  className="font-medium text-ifood-red hover:text-red-700"
                >
                  Fazer login
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;