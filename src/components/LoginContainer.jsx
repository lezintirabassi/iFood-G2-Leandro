import React from 'react';
import SocialButton from './SocialButton';
import LoginForm from './LoginForm';
import Divider from './Divider';

function LoginContainer({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  onSubmit, 
  onCreateAccount, 
  onSocialLogin, 
  socialProviders 
}) {
  return (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <div className="space-y-4">
          {socialProviders.map((provider) => (
            <SocialButton
              key={provider.name}
              icon={provider.icon}
              provider={provider.name}
              onClick={() => onSocialLogin(provider.name)}
            />
          ))}

          <Divider text="ou" />

          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            onSubmit={onSubmit}
          />
        </div>

        <div className="mt-6">
          <div className="relative">
            <p className="text-center text-sm text-gray-500">
              Não tem uma conta?{' '}
              <button 
                onClick={onCreateAccount}
                className="font-medium text-ifood-red hover:text-red-700"
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

export default LoginContainer;