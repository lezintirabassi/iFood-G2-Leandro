const API_URL = '/api';

const formatPhoneNumber = (phoneNumber) => {
  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // If it already has the country code, return as is
  if (phoneNumber.startsWith('+')) {
    return phoneNumber;
  }
  
  // Add Brazilian country code if not present
  return `+55${cleaned}`;
};

export const sendVerificationCode = async (phoneNumber) => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    console.log('Sending verification to:', formattedNumber);
    
    const response = await fetch(`${API_URL}/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber: formattedNumber }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Falha ao enviar código de verificação');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao enviar código de verificação:', error);
    throw error;
  }
};

export const verifyCode = async (phoneNumber, code) => {
  try {
    const formattedNumber = formatPhoneNumber(phoneNumber);
    console.log('Verificando código para:', formattedNumber);
    
    const response = await fetch(`${API_URL}/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        phoneNumber: formattedNumber, 
        code 
      }),
      credentials: 'include'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Falha ao verificar código');
    }
    
    const data = await response.json();
    console.log('Resposta da verificação:', data);
    
    if (!data.valid) {
      throw new Error('Código de verificação inválido');
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    throw error;
  }
};