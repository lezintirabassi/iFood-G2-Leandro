import React from 'react';

function SocialButton({ icon, provider, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ifood-red"
    >
      <img
        className="h-5 w-5 mr-2"
        src={icon}
        alt={`${provider} logo`}
      />
      Continuar com {provider}
    </button>
  );
}

export default SocialButton;