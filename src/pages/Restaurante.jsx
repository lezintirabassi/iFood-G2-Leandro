import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Store, Plus, Pencil, Trash2, MapPin, UtensilsCrossed } from 'lucide-react';

function Restaurante() {
  const navegacao = useNavigate();
  const { usuario: user, estaAutenticado, logout } = useAuth();
  const [restaurantes, setRestaurantes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [restauranteAtual, setRestauranteAtual] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    horario_abertura: '',
    horario_fechamento: ''
  });

  const carregarRestaurantes = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurantes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRestaurantes(data || []);
    } catch (erro) {
      console.error('Erro ao carregar restaurantes:', erro);
      setErro('Não foi possível carregar seus restaurantes');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (user) {
      carregarRestaurantes();
    }
  }, [user]);

  const salvarRestaurante = async (e) => {
    e.preventDefault();
    setErro(null);

    try {
      const novoRestaurante = {
        ...restauranteAtual,
        user_id: user.id
      };

      const { error } = await supabase
        .from('restaurantes')
        .upsert([novoRestaurante]);

      if (error) throw error;

      setModalAberto(false);
      setRestauranteAtual({
        nome: '',
        descricao: '',
        categoria: '',
        horario_abertura: '',
        horario_fechamento: ''
      });
      carregarRestaurantes();
    } catch (erro) {
      console.error('Erro ao salvar restaurante:', erro);
      setErro('Erro ao salvar restaurante');
    }
  };

  const editarRestaurante = (restaurante) => {
    setRestauranteAtual(restaurante);
    setModalAberto(true);
  };

  const excluirRestaurante = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este restaurante?')) return;

    try {
      const { error } = await supabase
        .from('restaurantes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      carregarRestaurantes();
    } catch (erro) {
      console.error('Erro ao excluir restaurante:', erro);
      setErro('Erro ao excluir restaurante');
    }
  };

  const irParaEnderecos = () => {
    navegacao('/endereco');
  };

  const irParaProdutos = (restauranteId) => {
    navegacao(`/restaurante/${restauranteId}/produtos`);
  };

  const fazerLogout = async () => {
    await logout();
    navegacao('/', { replace: true });
  };

  if (!estaAutenticado) {
    navegacao('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <img
                className="h-8 w-auto"
                src="https://logodownload.org/wp-content/uploads/2017/05/ifood-logo-0.png"
                alt="iFood"
              />
              <span className="ml-2 text-xl font-semibold text-gray-900">Meus Restaurantes</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={irParaEnderecos}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifood-red"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Endereços
              </button>
              <span className="text-sm text-gray-600">{user.email}</span>
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
            <h2 className="text-lg font-semibold text-gray-900">Restaurantes Cadastrados</h2>
            <button
              onClick={() => {
                setRestauranteAtual({
                  nome: '',
                  descricao: '',
                  categoria: '',
                  horario_abertura: '',
                  horario_fechamento: ''
                });
                setModalAberto(true);
              }}
              className="flex items-center px-4 py-2 bg-ifood-red text-white rounded-md hover:bg-red-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Restaurante
            </button>
          </div>

          {erro && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="text-center py-4">Carregando...</div>
          ) : restaurantes.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhum restaurante cadastrado
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {restaurantes.map((restaurante) => (
                <div
                  key={restaurante.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      <Store className="w-5 h-5 text-ifood-red mt-1" />
                      <div className="ml-2">
                        <p className="font-medium text-gray-900">{restaurante.nome}</p>
                        <p className="text-sm text-gray-500">{restaurante.categoria}</p>
                        {restaurante.descricao && (
                          <p className="text-sm text-gray-500">{restaurante.descricao}</p>
                        )}
                        <p className="text-sm text-gray-500">
                          Horário: {restaurante.horario_abertura} - {restaurante.horario_fechamento}
                        </p>
                        <button
                          onClick={() => irParaProdutos(restaurante.id)}
                          className="mt-2 flex items-center text-sm text-ifood-red hover:text-red-700"
                        >
                          <UtensilsCrossed className="w-4 h-4 mr-1" />
                          Gerenciar Produtos
                        </button>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => editarRestaurante(restaurante)}
                        className="p-1 text-gray-400 hover:text-gray-500"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => excluirRestaurante(restaurante.id)}
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
              {restauranteAtual.id ? 'Editar Restaurante' : 'Novo Restaurante'}
            </h3>
            <form onSubmit={salvarRestaurante}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={restauranteAtual.nome}
                    onChange={(e) => setRestauranteAtual({ ...restauranteAtual, nome: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    value={restauranteAtual.descricao}
                    onChange={(e) => setRestauranteAtual({ ...restauranteAtual, descricao: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Categoria
                  </label>
                  <select
                    value={restauranteAtual.categoria}
                    onChange={(e) => setRestauranteAtual({ ...restauranteAtual, categoria: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Brasileira">Brasileira</option>
                    <option value="Italiana">Italiana</option>
                    <option value="Japonesa">Japonesa</option>
                    <option value="Mexicana">Mexicana</option>
                    <option value="Vegetariana">Vegetariana</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Horário de Abertura
                    </label>
                    <input
                      type="time"
                      value={restauranteAtual.horario_abertura}
                      onChange={(e) => setRestauranteAtual({ ...restauranteAtual, horario_abertura: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Horário de Fechamento
                    </label>
                    <input
                      type="time"
                      value={restauranteAtual.horario_fechamento}
                      onChange={(e) => setRestauranteAtual({ ...restauranteAtual, horario_fechamento: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                      required
                    />
                  </div>
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
                  className="px-4  py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ifood-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifood-red"
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

export default Restaurante;