import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function CarrinhoModal({ 
  aberto, 
  fechar, 
  itens, 
  aumentarQuantidade, 
  diminuirQuantidade, 
  removerItem,
  total
}) {
  const navegacao = useNavigate();
  const [tipoEntrega, setTipoEntrega] = useState('normal');

  if (!aberto) return null;

  const restaurante = itens[0]?.produto.restaurante;
  
  const taxaEntrega = tipoEntrega === 'normal' 
    ? Number(restaurante?.taxa_entrega_normal || 5)
    : Number(restaurante?.taxa_entrega_rapida || 8);

  const tempoEntrega = tipoEntrega === 'normal'
    ? Number(restaurante?.tempo_entrega_normal || 45)
    : Number(restaurante?.tempo_entrega_rapida || 25);

  const subtotal = Number(total || 0);
  const totalComEntrega = subtotal + taxaEntrega;

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(valor) || 0);
  };

  const finalizarPedido = () => {
    fechar();
    navegacao('/pagamento', { 
      state: { 
        subtotal,
        total: totalComEntrega,
        itens,
        tipoEntrega,
        taxaEntrega,
        tempoEntrega
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" />
            Carrinho
          </h3>
          <button
            onClick={fechar}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {itens.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            Seu carrinho está vazio
          </p>
        ) : (
          <>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {itens.map((item) => (
                <div key={item.id} className="flex items-center justify-between border-b pb-4">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{item.produto.nome}</h4>
                    <p className="text-sm text-gray-500">{item.produto.restaurante.nome}</p>
                    <p className="text-sm font-medium text-ifood-red">
                      {formatarMoeda(item.produto.preco * item.quantidade)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => diminuirQuantidade(item.id)}
                      className="p-1 text-gray-400 hover:text-gray-500"
                      disabled={item.quantidade <= 1}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-gray-600">{item.quantidade}</span>
                    <button
                      onClick={() => aumentarQuantidade(item.id)}
                      className="p-1 text-gray-400 hover:text-gray-500"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removerItem(item.id)}
                      className="p-1 text-red-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-4">
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Entrega
                  </label>
                  <div className="flex flex-col space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="normal"
                        checked={tipoEntrega === 'normal'}
                        onChange={(e) => setTipoEntrega(e.target.value)}
                        className="h-4 w-4 text-ifood-red focus:ring-ifood-red border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-900">
                        Normal ({restaurante?.tempo_entrega_normal || 45} min) - {formatarMoeda(restaurante?.taxa_entrega_normal || 5)}
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="rapida"
                        checked={tipoEntrega === 'rapida'}
                        onChange={(e) => setTipoEntrega(e.target.value)}
                        className="h-4 w-4 text-ifood-red focus:ring-ifood-red border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-900">
                        Rápida ({restaurante?.tempo_entrega_rapida || 25} min) - {formatarMoeda(restaurante?.taxa_entrega_rapida || 8)}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-gray-900">{formatarMoeda(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Taxa de entrega</span>
                  <span className="text-gray-900">{formatarMoeda(taxaEntrega)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-medium">
                  <span>Total</span>
                  <span className="text-ifood-red">{formatarMoeda(totalComEntrega)}</span>
                </div>
              </div>

              <button
                onClick={finalizarPedido}
                className="w-full bg-ifood-red text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Finalizar Pedido
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CarrinhoModal;
