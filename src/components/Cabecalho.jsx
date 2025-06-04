import React from 'react';

export default function Cabecalho() {
  return (
    <div className="sm:mx-auto sm:w-full sm:max-w-md">
      <img
        className="mx-auto h-12 w-auto"
        src="https://logodownload.org/wp-content/uploads/2017/05/ifood-logo-0.png"
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