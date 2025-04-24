import React from 'react';
import { X, Minus, Plus, ShoppingCart, CreditCard, QrCode as Qr } from 'lucide-react';
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

  if (!aberto) return null;

  const finalizarPedido = () => {
    fechar();
    navegacao('/pagamento', { 
      state: { 
        total,
        itens 
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
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(item.produto.preco * item.quantidade)}
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
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-medium mb-4">
                <span>Total</span>
                <span className="text-ifood-red">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(total)}
                </span>
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