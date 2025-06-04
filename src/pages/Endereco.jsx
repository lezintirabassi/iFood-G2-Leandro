import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Plus, Pencil, Trash2, Store, ShoppingCart } from 'lucide-react';

function Endereco() {
  const navegacao = useNavigate();
  const { usuario: user, estaAutenticado, logout } = useAuth();
  const [enderecos, setEnderecos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [enderecoAtual, setEnderecoAtual] = useState({
    id: null,
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    principal: false
  });

  useEffect(() => {
    if (!estaAutenticado) {
      navegacao('/', { replace: true });
    }
  }, [estaAutenticado, navegacao]);

  const carregarEnderecos = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('enderecos')
        .select('*')
        .eq('user_id', user.id)
        .order('principal', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEnderecos(data || []);
    } catch (erro) {
      console.error('Erro ao carregar endereços:', erro);
      setErro('Não foi possível carregar seus endereços');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      carregarEnderecos();
    }
  }, [user]);

  const buscarCep = async (cep) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      setEnderecoAtual(prev => ({
        ...prev,
        logradouro: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      }));
    } catch (erro) {
      setErro('CEP não encontrado');
    }
  };

  const salvarEndereco = async (e) => {
    e.preventDefault();
    setErro(null);

    if (!user?.id) {
      setErro('Usuário não autenticado. Por favor, faça login novamente.');
      return;
    }

    try {
      const novoEndereco = {
        ...enderecoAtual,
        user_id: user.id
      };

      // Remove o id se for um novo endereço
      if (!enderecoAtual.id) {
        delete novoEndereco.id;
      }

      if (enderecoAtual.principal) {
        await supabase
          .from('enderecos')
          .update({ principal: false })
          .eq('user_id', user.id);
      }

      const { error } = await supabase
        .from('enderecos')
        .upsert([novoEndereco]);

      if (error) throw error;

      setModalAberto(false);
      setEnderecoAtual({
        id: null,
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        principal: false
      });
      carregarEnderecos();
    } catch (erro) {
      console.error('Erro ao salvar endereço:', erro);
      setErro('Erro ao salvar endereço');
    }
  };

  const editarEndereco = (endereco) => {
    setEnderecoAtual({
      ...endereco,
      id: endereco.id
    });
    setModalAberto(true);
  };

  const excluirEndereco = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este endereço?')) return;

    try {
      const { error } = await supabase
        .from('enderecos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      carregarEnderecos();
    } catch (erro) {
      console.error('Erro ao excluir endereço:', erro);
      setErro('Erro ao excluir endereço');
    }
  };

  const irParaRestaurantes = () => {
    navegacao('/restaurante');
  };

  const irParaHome = () => {
    navegacao('/home');
  };

  const fazerLogout = async () => {
    await logout();
    navegacao('/', { replace: true });
  };

  if (!estaAutenticado) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img
                className="h-8 w-auto cursor-pointer"
                src="https://logodownload.org/wp-content/uploads/2017/05/ifood-logo-0.png"
                alt="iFood"
                onClick={irParaHome}
              />
              <span className="ml-2 text-xl font-semibold text-gray-900">Meus Endereços</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={irParaRestaurantes}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifood-red"
              >
                <Store className="w-4 h-4 mr-2" />
                Restaurantes
              </button>
              <button
                onClick={() => {}}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifood-red"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Carrinho
              </button>
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={fazerLogout}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ifood-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifood-red"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Endereços Cadastrados</h2>
            <button
              onClick={() => {
                setEnderecoAtual({
                  id: null,
                  cep: '',
                  logradouro: '',
                  numero: '',
                  complemento: '',
                  bairro: '',
                  cidade: '',
                  estado: '',
                  principal: false
                });
                setModalAberto(true);
              }}
              className="flex items-center px-4 py-2 bg-ifood-red text-white rounded-md hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Endereço
            </button>
          </div>

          {erro && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="text-center py-4">Carregando...</div>
          ) : enderecos.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhum endereço cadastrado
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {enderecos.map((endereco) => (
                <div
                  key={endereco.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-ifood-red mt-1" />
                      <div className="ml-2">
                        <p className="font-medium text-gray-900">
                          {endereco.logradouro}, {endereco.numero}
                          {endereco.complemento && ` - ${endereco.complemento}`}
                        </p>
                        <p className="text-sm text-gray-500">
                          {endereco.bairro}
                        </p>
                        <p className="text-sm text-gray-500">
                          {endereco.cidade} - {endereco.estado}
                        </p>
                        <p className="text-sm text-gray-500">
                          CEP: {endereco.cep}
                        </p>
                        {endereco.principal && (
                          <span className="mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Principal
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editarEndereco(endereco)}
                        className="p-1 text-gray-400 hover:text-gray-500"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => excluirEndereco(endereco.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {modalAberto && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {enderecoAtual.id ? 'Editar Endereço' : 'Novo Endereço'}
            </h3>
            <form onSubmit={salvarEndereco}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    CEP
                  </label>
                  <div className="mt-1 flex">
                    <input
                      type="text"
                      value={enderecoAtual.cep}
                      onChange={(e) => setEnderecoAtual({ ...enderecoAtual, cep: e.target.value })}
                      onBlur={(e) => {
                        const cep = e.target.value.replace(/\D/g, '');
                        if (cep.length === 8) {
                          buscarCep(cep);
                        }
                      }}
                      className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Logradouro
                  </label>
                  <input
                    type="text"
                    value={enderecoAtual.logradouro}
                    onChange={(e) => setEnderecoAtual({ ...enderecoAtual, logradouro: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Número
                    </label>
                    <input
                      type="text"
                      value={enderecoAtual.numero}
                      onChange={(e) => setEnderecoAtual({ ...enderecoAtual, numero: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Complemento
                    </label>
                    <input
                      type="text"
                      value={enderecoAtual.complemento}
                      onChange={(e) => setEnderecoAtual({ ...enderecoAtual, complemento: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={enderecoAtual.bairro}
                    onChange={(e) => setEnderecoAtual({ ...enderecoAtual, bairro: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={enderecoAtual.cidade}
                      onChange={(e) => setEnderecoAtual({ ...enderecoAtual, cidade: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={enderecoAtual.estado}
                      onChange={(e) => setEnderecoAtual({ ...enderecoAtual, estado: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="principal"
                    checked={enderecoAtual.principal}
                    onChange={(e) => setEnderecoAtual({ ...enderecoAtual, principal: e.target.checked })}
                    className="h-4 w-4 text-ifood-red focus:ring-ifood-red border-gray-300 rounded"
                  />
                  <label htmlFor="principal" className="ml-2 block text-sm text-gray-900">
                    Definir como endereço principal
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifood-red"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ifood-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifood-red"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Endereco;