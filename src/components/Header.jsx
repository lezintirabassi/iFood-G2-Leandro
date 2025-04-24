import React from 'react';

function Header() {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <img
        className="mx-auto h-12 w-auto"
        src="https://images.unsplash.com/photo-1594385299067-8ccaa1c7d0b9?q=80&w=100&auto=format&fit=crop"
        alt="iFood"
      />
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Falta pouco para matar sua fome!
      </h2>
      <p className="mt-2 text-center text-sm text-ifood-gray">
        Como deseja continuar?
      </p>
    </div>
  );
}

export default Header;