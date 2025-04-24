import React from 'react';
import BotaoSocial from './BotaoSocial';
import FormularioLogin from './FormularioLogin';
import Divisor from './Divisor';

function ContainerLogin({ 
  email, 
  setEmail, 
  senha, 
  setSenha, 
  aoSubmeter, 
  aoCriarConta, 
  aoLoginSocial, 
  provedoresSociais,
  carregando,
  erro 
}) {
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        {erro && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {erro}
          </div>
        )}
        
        <div className="space-y-4">
          {provedoresSociais.map((provedor) => (
            <BotaoSocial
              key={provedor.nome}
              provedor={provedor.nome}
              aoClicar={() => aoLoginSocial(provedor.nome)}
              desabilitado={carregando}
            />
          ))}

          <Divisor texto="ou" />

          <FormularioLogin
            email={email}
            setEmail={setEmail}
            senha={senha}
            setSenha={setSenha}
            aoSubmeter={aoSubmeter}
            carregando={carregando}
          />
        </div>

        <div className="mt-6">
          <div className="relative">
            <p className="text-center text-sm text-gray-500">
              Não tem uma conta?{' '}
              <button 
                onClick={aoCriarConta}
                disabled={carregando}
                className="font-medium text-ifood-red hover:text-red-700 disabled:opacity-50"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContainerLogin;