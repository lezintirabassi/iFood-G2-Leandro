import React from 'react';
import { Facebook, Chrome } from 'lucide-react';

function BotaoSocial({ provedor, aoClicar, desabilitado }) {
  const getIcone = () => {
    switch (provedor.toLowerCase()) {
      case 'google':
        return <Chrome className="h-5 w-5 text-gray-600" />;
      case 'facebook':
        return <Facebook className="h-5 w-5 text-[#1877F2]" />;
      default:
        return null;
    }
  };

  const getBotaoClasses = () => {
    const classesBase = "w-full flex justify-center items-center py-3 px-4 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    if (provedor.toLowerCase() === 'facebook') {
      return `${classesBase} border-[#1877F2] text-[#1877F2] hover:bg-blue-50 focus:ring-[#1877F2]`;
    }
    
    return `${classesBase} border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-ifood-red`;
  };

  return (
    <button 
      onClick={aoClicar}
      disabled={desabilitado}
      className={getBotaoClasses()}
    >
      <span className="mr-2">
        {getIcone()}
      </span>
      Continuar com {provedor}
    </button>
  );
}

export default BotaoSocial;