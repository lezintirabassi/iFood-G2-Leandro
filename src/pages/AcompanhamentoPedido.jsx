import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, Truck, ChefHat, Search, Store } from 'lucide-react';
import emailjs from 'emailjs-com';
import { useAuth } from '../contexts/AuthContext';

function AcompanhamentoPedido() {
  const { usuario: user, estaAutenticado, logout } = useAuth();
  const navegacao = useNavigate();
  const location = useLocation();
  const [statusAtual, setStatusAtual] = useState(0);
  const [pedidoConcluido, setPedidoConcluido] = useState(false);
  // alert('Produto adicionado ao carrinho!');

  const statusPedido = [
    {
      texto: "O restaurante aceitou o pedido",
      icone: <Store className="w-6 h-6" />,
      cor: "text-blue-500"
    },
    {
      texto: "Pedido sendo preparado",
      icone: <ChefHat className="w-6 h-6" />,
      cor: "text-yellow-500"
    },
    {
      texto: "Encontrando motorista parceiro",
      icone: <Search className="w-6 h-6" />,
      cor: "text-purple-500"
    },
    {
      texto: "Seu motorista está indo até você",
      icone: <Truck className="w-6 h-6" />,
      cor: "text-orange-500"
    },
    {
      texto: "Seu pedido chegou",
      icone: <Check className="w-6 h-6" />,
      cor: "text-green-500"
    }
  ];

  useEffect(() => {
    if (!location.state?.pedidoId) {
      navegacao('/home');
      return;
    }

    const atualizarStatus = () => {
      if (statusAtual < statusPedido.length - 1) {
        const novoStatus = statusPedido[statusAtual + 1].texto;

        emailjs.send('service_odnkte2', 'template_8jfbbxh', {
          status_message: `${novoStatus}`,
          pedido_id: location.state?.pedidoId,
          to_email: user?.email
        }, 'trUMBMErkFdAQ-Hfv')
        .then(() => console.log('E-mail enviado com sucesso!',user?.email, novoStatus ) )
        .catch((err) => console.error('Erro ao enviar e-mail:', err));
        
        setStatusAtual(prev => prev + 1);
      } else {
        setPedidoConcluido(true);
        setTimeout(() => {
          navegacao('/home');
        }, 3000);
      }
    };

    const intervalo = setInterval(atualizarStatus, 6000);
    return () => clearInterval(intervalo);
  }, [statusAtual, navegacao]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
              <span className="ml-4 text-xl font-semibold text-gray-900">
                Acompanhamento do Pedido
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="space-y-8">
            {statusPedido.map((status, index) => (
              <div key={index} className={`flex items-start space-x-4 ${
                index > statusAtual ? 'opacity-50' : ''
              }`}>
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  index <= statusAtual ? `${status.cor} bg-opacity-20` : 'bg-gray-200'
                }`}>
                  {status.icone}
                </div>
                <div className="flex-1">
                  <p className={`text-lg font-medium ${
                    index <= statusAtual ? status.cor : 'text-gray-500'
                  }`}>
                    {status.texto}
                  </p>
                  {index <= statusAtual && (
                    <p className="text-sm text-gray-500">
                      {new Date().toLocaleTimeString()}
                    </p>
                  )}
                </div>
                {index <= statusAtual && (
                  <div className="flex-shrink-0">
                    <Check className={`w-6 h-6 ${status.cor}`} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {pedidoConcluido && (
            <div className="mt-8 text-center">
              <p className="text-green-500 font-medium">
                Pedido entregue com sucesso!
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Redirecionando para a página inicial...
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AcompanhamentoPedido;