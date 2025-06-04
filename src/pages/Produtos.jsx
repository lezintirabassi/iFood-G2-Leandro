import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Store, Plus, Pencil, Trash2, ArrowLeft, ShoppingCart } from 'lucide-react';

function Produtos() {
  const { restauranteId } = useParams();
  const navegacao = useNavigate();
  const { usuario: user, estaAutenticado } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [restaurante, setRestaurante] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoAtual, setProdutoAtual] = useState({
    nome: '',
    descricao: '',
    preco: '',
    categoria: '',
    imagem_url: '',
    disponivel: true
  });

  const carregarRestaurante = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurantes')
        .select('*')
        .eq('id', restauranteId)
        .single();

      if (error) throw error;
      setRestaurante(data);
    } catch (erro) {
      console.error('Erro ao carregar restaurante:', erro);
      setErro('Não foi possível carregar as informações do restaurante');
    }
  };

  const carregarProdutos = async () => {
    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('restaurante_id', restauranteId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProdutos(data || []);
    } catch (erro) {
      console.error('Erro ao carregar produtos:', erro);
      setErro('Não foi possível carregar os produtos');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (estaAutenticado) {
      carregarRestaurante();
      carregarProdutos();
    }
  }, [estaAutenticado, restauranteId]);

  const podeEditarProdutos = () => {
    return restaurante?.user_id === user?.id;
  };

  const adicionarAoCarrinho = async (produto) => {
    try {
      // Primeiro verifica se o produto já está no carrinho
      const { data: carrinhoExistente, error: erroConsulta } = await supabase
        .from('carrinho')
        .select('*')
        .eq('user_id', user.id)
        .eq('produto_id', produto.id)
        .single();

      if (erroConsulta && erroConsulta.code !== 'PGRST116') { // PGRST116 significa que nenhum registro foi encontrado
        throw erroConsulta;
      }

      if (carrinhoExistente) {
        // Se o produto já existe, aumenta a quantidade
        const { error } = await supabase
          .from('carrinho')
          .update({ quantidade: carrinhoExistente.quantidade + 1 })
          .eq('id', carrinhoExistente.id);

        if (error) throw error;
      } else {
        // Se não existe, cria um novo item no carrinho
        const { error } = await supabase
          .from('carrinho')
          .insert([{
            user_id: user.id,
            produto_id: produto.id,
            quantidade: 1
          }]);

        if (error) throw error;
      }

      alert('Produto adicionado ao carrinho!');
    } catch (erro) {
      console.error('Erro ao adicionar ao carrinho:', erro);
      setErro('Erro ao adicionar produto ao carrinho');
    }
  };

  const salvarProduto = async (e) => {
    e.preventDefault();
    setErro(null);

    if (!podeEditarProdutos()) {
      setErro('Você não tem permissão para adicionar produtos a este restaurante');
      return;
    }

    try {
      const novoProduto = {
        ...produtoAtual,
        restaurante_id: restauranteId,
        preco: parseFloat(produtoAtual.preco)
      };

      const { error } = await supabase
        .from('produtos')
        .upsert([novoProduto]);

      if (error) throw error;

      setModalAberto(false);
      setProdutoAtual({
        nome: '',
        descricao: '',
        preco: '',
        categoria: '',
        imagem_url: '',
        disponivel: true
      });
      carregarProdutos();
    } catch (erro) {
      console.error('Erro ao salvar produto:', erro);
      setErro('Erro ao salvar produto');
    }
  };

  const editarProduto = (produto) => {
    if (!podeEditarProdutos()) {
      setErro('Você não tem permissão para editar produtos deste restaurante');
      return;
    }
    setProdutoAtual({
      ...produto,
      preco: produto.preco.toString()
    });
    setModalAberto(true);
  };

  const excluirProduto = async (id) => {
    if (!podeEditarProdutos()) {
      setErro('Você não tem permissão para excluir produtos deste restaurante');
      return;
    }

    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      carregarProdutos();
    } catch (erro) {
      console.error('Erro ao excluir produto:', erro);
      setErro('Erro ao excluir produto');
    }
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
              <button
                onClick={() => navegacao('/home')}
                className="ml-4 flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </button>
              <span className="ml-4 text-xl font-semibold text-gray-900">
                {restaurante?.nome} - Cardápio
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Produtos</h2>
            {podeEditarProdutos() && (
              <button
                onClick={() => {
                  setProdutoAtual({
                    nome: '',
                    descricao: '',
                    preco: '',
                    categoria: '',
                    imagem_url: '',
                    disponivel: true
                  });
                  setModalAberto(true);
                }}
                className="flex items-center px-4 py-2 bg-ifood-red text-white rounded-md hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Produto
              </button>
            )}
          </div>

          {erro && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {erro}
            </div>
          )}

          {carregando ? (
            <div className="text-center py-4">Carregando...</div>
          ) : produtos.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              Nenhum produto cadastrado
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {produtos.map((produto) => (
                <div
                  key={produto.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {produto.imagem_url && (
                        <img
                          src={produto.imagem_url}
                          alt={produto.nome}
                          className="w-full h-48 object-cover rounded-md mb-4"
                        />
                      )}
                      <div>
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">{produto.nome}</h3>
                          <span className="text-lg font-semibold text-ifood-red">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(produto.preco)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{produto.categoria}</p>
                        {produto.descricao && (
                          <p className="text-sm text-gray-600 mt-2">{produto.descricao}</p>
                        )}
                        <div className="mt-4 flex items-center justify-between">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${
                            produto.disponivel
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {produto.disponivel ? 'Disponível' : 'Indisponível'}
                          </span>
                          <div className="flex space-x-2">
                            {produto.disponivel && !podeEditarProdutos() && (
                              <button
                                onClick={() => adicionarAoCarrinho(produto)}
                                className="flex items-center px-3 py-1 bg-ifood-red text-white rounded-md hover:bg-red-700 text-sm"
                              >
                                <ShoppingCart className="w-4 h-4 mr-1" />
                                Adicionar
                              </button>
                            )}
                            {podeEditarProdutos() && (
                              <>
                                <button
                                  onClick={() => editarProduto(produto)}
                                  className="p-1 text-gray-400 hover:text-gray-500"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => excluirProduto(produto.id)}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
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
              {produtoAtual.id ? 'Editar Produto' : 'Novo Produto'}
            </h3>
            <form onSubmit={salvarProduto}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={produtoAtual.nome}
                    onChange={(e) => setProdutoAtual({ ...produtoAtual, nome: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Descrição
                  </label>
                  <textarea
                    value={produtoAtual.descricao}
                    onChange={(e) => setProdutoAtual({ ...produtoAtual, descricao: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Preço
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">R$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={produtoAtual.preco}
                      onChange={(e) => setProdutoAtual({ ...produtoAtual, preco: e.target.value })}
                      className="pl-8 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Categoria
                  </label>
                  <select
                    value={produtoAtual.categoria}
                    onChange={(e) => setProdutoAtual({ ...produtoAtual, categoria: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Entrada">Entrada</option>
                    <option value="Prato Principal">Prato Principal</option>
                    <option value="Sobremesa">Sobremesa</option>
                    <option value="Bebida">Bebida</option>
                    <option value="Acompanhamento">Acompanhamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    URL da Imagem
                  </label>
                  <input
                    type="url"
                    value={produtoAtual.imagem_url}
                    onChange={(e) => setProdutoAtual({ ...produtoAtual, imagem_url: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="disponivel"
                    checked={produtoAtual.disponivel}
                    onChange={(e) => setProdutoAtual({ ...produtoAtual, disponivel: e.target.checked })}
                    className="h-4 w-4 text-ifood-red focus:ring-ifood-red border-gray-300 rounded"
                  />
                  <label htmlFor="disponivel" className="ml-2 block text-sm text-gray-900">
                    Produto disponível
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

export default Produtos;