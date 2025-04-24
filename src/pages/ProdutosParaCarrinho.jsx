import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Store, ArrowLeft, ShoppingCart, Plus, Minus, CreditCard, QrCode as Qr } from 'lucide-react';
import CarrinhoModal from '../components/CarrinhoModal';

function ProdutosParaCarrinho() {
  const { restauranteId } = useParams();
  const navegacao = useNavigate();
  const { usuario: user } = useAuth();
  const [produtos, setProdutos] = useState([]);
  const [restaurante, setRestaurante] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);
  const [itensCarrinho, setItensCarrinho] = useState([]);
  const [totalCarrinho, setTotalCarrinho] = useState(0);
  const [quantidades, setQuantidades] = useState({});
  const [modalPagamentoAberto, setModalPagamentoAberto] = useState(false);
  const [formaPagamento, setFormaPagamento] = useState('');
  const [dadosPagamento, setDadosPagamento] = useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: ''
  });

  useEffect(() => {
    carregarRestaurante();
    carregarProdutos();
    carregarCarrinho();
  }, [restauranteId]);

  const carregarCarrinho = async () => {
    try {
      const { data, error } = await supabase
        .from('carrinho')
        .select(`
          *,
          produto: produtos (
            *,
            restaurante: restaurantes (
              id,
              nome
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      setItensCarrinho(data || []);
      calcularTotal(data);
    } catch (erro) {
      console.error('Erro ao carregar carrinho:', erro);
    }
  };

  const calcularTotal = (itens) => {
    const total = itens.reduce((acc, item) => {
      return acc + (item.produto.preco * item.quantidade);
    }, 0);
    setTotalCarrinho(total);
  };

  const aumentarQuantidade = async (itemId) => {
    try {
      const item = itensCarrinho.find(i => i.id === itemId);
      const novaQuantidade = item.quantidade + 1;

      const { error } = await supabase
        .from('carrinho')
        .update({ quantidade: novaQuantidade })
        .eq('id', itemId);

      if (error) throw error;
      await carregarCarrinho();
    } catch (erro) {
      console.error('Erro ao aumentar quantidade:', erro);
    }
  };

  const diminuirQuantidade = async (itemId) => {
    try {
      const item = itensCarrinho.find(i => i.id === itemId);
      if (item.quantidade <= 1) {
        await removerItem(itemId);
        return;
      }

      const novaQuantidade = item.quantidade - 1;
      const { error } = await supabase
        .from('carrinho')
        .update({ quantidade: novaQuantidade })
        .eq('id', itemId);

      if (error) throw error;
      await carregarCarrinho();
    } catch (erro) {
      console.error('Erro ao diminuir quantidade:', erro);
    }
  };

  const removerItem = async (itemId) => {
    try {
      const { error } = await supabase
        .from('carrinho')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      await carregarCarrinho();
    } catch (erro) {
      console.error('Erro ao remover item:', erro);
    }
  };

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
        .eq('disponivel', true)
        .order('categoria', { ascending: true });

      if (error) throw error;
      setProdutos(data || []);
      
      const quantidadesIniciais = {};
      data?.forEach(produto => {
        quantidadesIniciais[produto.id] = 1;
      });
      setQuantidades(quantidadesIniciais);
    } catch (erro) {
      console.error('Erro ao carregar produtos:', erro);
      setErro('Não foi possível carregar os produtos');
    } finally {
      setCarregando(false);
    }
  };

  const ajustarQuantidade = (produtoId, delta) => {
    setQuantidades(prev => ({
      ...prev,
      [produtoId]: Math.max(1, (prev[produtoId] || 1) + delta)
    }));
  };

  const adicionarAoCarrinho = async (produto) => {
    try {
      // Verifica se já existem itens no carrinho
      if (itensCarrinho.length > 0) {
        const primeiroItem = itensCarrinho[0];
        if (primeiroItem.produto.restaurante.id !== restauranteId) {
          alert('Você já possui itens de outro restaurante no carrinho. Finalize ou remova esses itens antes de adicionar produtos de um novo restaurante.');
          return;
        }
      }

      const quantidade = quantidades[produto.id] || 1;
      
      const { data: carrinhoExistente, error: erroConsulta } = await supabase
        .from('carrinho')
        .select('*')
        .eq('user_id', user.id)
        .eq('produto_id', produto.id)
        .single();

      if (erroConsulta && erroConsulta.code !== 'PGRST116') {
        throw erroConsulta;
      }

      if (carrinhoExistente) {
        const { error } = await supabase
          .from('carrinho')
          .update({ quantidade: carrinhoExistente.quantidade + quantidade })
          .eq('id', carrinhoExistente.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('carrinho')
          .insert([{
            user_id: user.id,
            produto_id: produto.id,
            quantidade: quantidade
          }]);

        if (error) throw error;
      }

      setQuantidades(prev => ({
        ...prev,
        [produto.id]: 1
      }));

      await carregarCarrinho();
      alert('Produto adicionado ao carrinho!');
    } catch (erro) {
      console.error('Erro ao adicionar ao carrinho:', erro);
      setErro('Erro ao adicionar produto ao carrinho');
    }
  };

  const finalizarPedido = () => {
    setCarrinhoAberto(false);
    setModalPagamentoAberto(true);
  };

  const processarPagamento = async () => {
    try {
      // Aqui você implementaria a lógica real de processamento do pagamento
      // Por enquanto, vamos apenas simular um sucesso
      
      // Limpa o carrinho
      const { error } = await supabase
        .from('carrinho')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      alert('Pedido realizado com sucesso!');
      setModalPagamentoAberto(false);
      setFormaPagamento('');
      setDadosPagamento({
        numero: '',
        nome: '',
        validade: '',
        cvv: ''
      });
      await carregarCarrinho();
      navegacao('/home');
    } catch (erro) {
      console.error('Erro ao processar pagamento:', erro);
      alert('Erro ao processar pagamento. Tente novamente.');
    }
  };

  const categorias = [...new Set(produtos.map(p => p.categoria))];

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
                onClick={() => navegacao('/home')}
              />
              <button
                onClick={() => navegacao('/home')}
                className="ml-4 flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </button>
              <span className="ml-4 text-xl font-semibold text-gray-900">
                {restaurante?.nome}
              </span>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => setCarrinhoAberto(true)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                <span>Carrinho ({itensCarrinho.length})</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {erro && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {erro}
          </div>
        )}

        {carregando ? (
          <div className="text-center py-4">Carregando produtos...</div>
        ) : produtos.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            Nenhum produto disponível
          </div>
        ) : (
          <div className="space-y-8">
            {categorias.map(categoria => (
              <div key={categoria}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{categoria}</h2>
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {produtos
                    .filter(produto => produto.categoria === categoria)
                    .map(produto => (
                      <div
                        key={produto.id}
                        className="bg-white rounded-lg shadow-sm overflow-hidden"
                      >
                        {produto.imagem_url ? (
                          <img
                            src={produto.imagem_url}
                            alt={produto.nome}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                            <Store className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <div className="p-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            {produto.nome}
                          </h3>
                          {produto.descricao && (
                            <p className="mt-1 text-sm text-gray-500">
                              {produto.descricao}
                            </p>
                          )}
                          <p className="mt-2 text-lg font-semibold text-ifood-red">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL'
                            }).format(produto.preco)}
                          </p>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => ajustarQuantidade(produto.id, -1)}
                                className="p-1 text-gray-400 hover:text-gray-500"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-gray-600">
                                {quantidades[produto.id] || 1}
                              </span>
                              <button
                                onClick={() => ajustarQuantidade(produto.id, 1)}
                                className="p-1 text-gray-400 hover:text-gray-500"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => adicionarAoCarrinho(produto)}
                              className="flex items-center px-4 py-2 bg-ifood-red text-white rounded-md hover:bg-red-700"
                            >
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Adicionar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <CarrinhoModal
        aberto={carrinhoAberto}
        fechar={() => setCarrinhoAberto(false)}
        itens={itensCarrinho}
        aumentarQuantidade={aumentarQuantidade}
        diminuirQuantidade={diminuirQuantidade}
        removerItem={removerItem}
        total={totalCarrinho}
        finalizarPedido={finalizarPedido}
      />

      {modalPagamentoAberto && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pagamento</h3>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setFormaPagamento('cartao')}
                  className={`flex-1 flex items-center justify-center p-4 rounded-lg border ${
                    formaPagamento === 'cartao'
                      ? 'border-ifood-red bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CreditCard className="w-6 h-6 mr-2" />
                  <span>Cartão</span>
                </button>
                <button
                  onClick={() => setFormaPagamento('pix')}
                  className={`flex-1 flex items-center justify-center p-4 rounded-lg border ${
                    formaPagamento === 'pix'
                      ? 'border-ifood-red bg-red-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <Qr className="w-6 h-6 mr-2" />
                  <span>PIX</span>
                </button>
              </div>

              {formaPagamento === 'cartao' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Número do Cartão
                    </label>
                    <input
                      type="text"
                      value={dadosPagamento.numero}
                      onChange={(e) => setDadosPagamento({ ...dadosPagamento, numero: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nome no Cartão
                    </label>
                    <input
                      type="text"
                      value={dadosPagamento.nome}
                      onChange={(e) => setDadosPagamento({ ...dadosPagamento, nome: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                      placeholder="NOME COMO ESTÁ NO CARTÃO"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Validade
                      </label>
                      <input
                        type="text"
                        value={dadosPagamento.validade}
                        onChange={(e) => setDadosPagamento({ ...dadosPagamento, validade: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                        placeholder="MM/AA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={dadosPagamento.cvv}
                        onChange={(e) => setDadosPagamento({ ...dadosPagamento, cvv: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-ifood-red focus:ring-ifood-red sm:text-sm"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formaPagamento === 'pix' && (
                <div className="text-center py-4">
                  <Qr className="w-32 h-32 mx-auto mb-4" />
                  <p className="text-sm text-gray-600">
                    Escaneie o código QR com seu aplicativo de pagamento
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center text-lg font-medium mb-4">
                <span>Total</span>
                <span className="text-ifood-red">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(totalCarrinho)}
                </span>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setModalPagamentoAberto(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={processarPagamento}
                  disabled={!formaPagamento || (formaPagamento === 'cartao' && (!dadosPagamento.numero || !dadosPagamento.nome || !dadosPagamento.validade || !dadosPagamento.cvv))}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ifood-red hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Finalizar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProdutosParaCarrinho;