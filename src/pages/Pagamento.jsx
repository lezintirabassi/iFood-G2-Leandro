import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CreditCard, QrCode, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import emailjs from 'emailjs-com';
function Pagamento() {
  const navegacao = useNavigate();
  const location = useLocation();
  const { usuario } = useAuth();
  const [formaPagamento, setFormaPagamento] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [dadosPagamento, setDadosPagamento] = useState({
    numero: '',
    nome: '',
    validade: '',
    cvv: ''
  });
  const [enderecoEntrega, setEnderecoEntrega] = useState(null);
  const [total, setTotal] = useState(0);
  const [itensCarrinho, setItensCarrinho] = useState([]);

  useEffect(() => {
    if (!location.state?.total || !location.state?.itens) {
      navegacao('/home');
      return;
    }
    setTotal(location.state.total);
    setItensCarrinho(location.state.itens);
    carregarEnderecoEntrega();
  }, [location.state]);

  const carregarEnderecoEntrega = async () => {
    try {
      const { data, error } = await supabase
        .from('enderecos')
        .select('*')
        .eq('principal', true)
        .single();

      if (error) throw error;
      setEnderecoEntrega(data);
    } catch (erro) {
      console.error('Erro ao carregar endereço:', erro);
      setErro('Erro ao carregar endereço de entrega');
    }
  };

  const enviarNFe = async () => {
    const pedidoId = location.state?.pedidoId || Math.random().toString(36).substr(2, 9);
  
    // Monta o array de pedidos
    const orders = itensCarrinho.map(item => ({
      name: `${item.quantidade}x ${item.produto.nome} (${item.produto.restaurante.nome})`,
      units: item.quantidade,
      price: (item.produto.preco * item.quantidade).toFixed(2),
      image_url: item.produto.imagem || 'https://via.placeholder.com/64' // Imagem de fallback
    }));
  
    const shipping = 0.00; // Substitua se você tiver taxa de entrega
    const tax = 0.00;      // Substitua se você tiver cálculo de imposto
  
    emailjs.send('service_odnkte2', 'template_en9q65a', {
      status_message: 'teste',
      order_id: pedidoId,
      orders: orders, // <-- Isso pode ficar como está, EmailJS v2 suporta loop
      cost_shipping: shipping.toFixed(2),
      cost_tax: tax.toFixed(2),
      cost_total: (total + shipping + tax).toFixed(2),
      to_email: usuario?.email
    }, 'trUMBMErkFdAQ-Hfv')
    
    .then(() => console.log('E-mail enviado com sucesso!', usuario?.email))
    .catch((err) => console.error('Erro ao enviar e-mail:', err));
  };
  

  const processarPagamento = async () => {
    if (!formaPagamento) {
      setErro('Selecione uma forma de pagamento');
      return;
    }

    if (formaPagamento === 'cartao') {
      if (!dadosPagamento.numero || !dadosPagamento.nome || !dadosPagamento.validade || !dadosPagamento.cvv) {
        setErro('Preencha todos os dados do cartão');
        return;
      }
    }

    setCarregando(true);
    setErro(null);

    try {
      // Simula o processamento do pagamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Envia a NFe por email
      await enviarNFe();

      // Limpa o carrinho
      const { error } = await supabase
        .from('carrinho')
        .delete()
        .eq('id', itensCarrinho.map(item => item.id));

      if (error) throw error;

      // Redireciona para a página de acompanhamento
      navegacao('/acompanhamento', { 
        state: { 
          pedidoId: Math.random().toString(36).substr(2, 9)
        }
      });
    } catch (erro) {
      console.error('Erro ao processar pagamento:', erro);
      setErro('Erro ao processar pagamento. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

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
                onClick={() => navegacao(-1)}
                className="ml-4 flex items-center text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Voltar
              </button>
              <span className="ml-4 text-xl font-semibold text-gray-900">
                Pagamento
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Resumo do pedido */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumo do Pedido</h2>
            <div className="space-y-4">
              {itensCarrinho.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.quantidade}x {item.produto.nome}
                    </p>
                    <p className="text-sm text-gray-500">{item.produto.restaurante.nome}</p>
                  </div>
                  <p className="text-gray-900">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(item.produto.preco * item.quantidade)}
                  </p>
                </div>
              ))}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-ifood-red">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    }).format(total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Endereço de entrega */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Endereço de Entrega</h2>
            {enderecoEntrega ? (
              <div>
                <p className="text-gray-900">{enderecoEntrega.logradouro}, {enderecoEntrega.numero}</p>
                {enderecoEntrega.complemento && (
                  <p className="text-gray-700">{enderecoEntrega.complemento}</p>
                )}
                <p className="text-gray-700">
                  {enderecoEntrega.bairro}, {enderecoEntrega.cidade} - {enderecoEntrega.estado}
                </p>
                <p className="text-gray-700">CEP: {enderecoEntrega.cep}</p>
              </div>
            ) : (
              <p className="text-gray-500">Nenhum endereço principal definido</p>
            )}
          </div>

          {/* Formas de pagamento */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Forma de Pagamento</h2>
            
            {erro && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {erro}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => setFormaPagamento('cartao')}
                className={`flex items-center justify-center p-4 rounded-lg border ${
                  formaPagamento === 'cartao'
                    ? 'border-ifood-red bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <CreditCard className="w-6 h-6 mr-2" />
                <span>Cartão de Crédito</span>
              </button>
              <button
                onClick={() => setFormaPagamento('pix')}
                className={`flex items-center justify-center p-4 rounded-lg border ${
                  formaPagamento === 'pix'
                    ? 'border-ifood-red bg-red-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <QrCode className="w-6 h-6 mr-2" />
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
                    />
                  </div>
                </div>
              </div>
            )}

            {formaPagamento === 'pix' && (
              <div className="text-center py-8">
                <QrCode className="w-48 h-48 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Escaneie o QR Code com seu aplicativo de pagamento
                </p>
                <p className="text-xs text-gray-500">
                  O pedido será confirmado automaticamente após o pagamento
                </p>
              </div>
            )}

            <div className="mt-6">
              <button
                onClick={processarPagamento}
                disabled={carregando || !formaPagamento || (formaPagamento === 'cartao' && (!dadosPagamento.numero || !dadosPagamento.nome || !dadosPagamento.validade || !dadosPagamento.cvv))}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-ifood-red hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifood-red disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {carregando ? 'Processando...' : 'Finalizar Pedido'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Pagamento;