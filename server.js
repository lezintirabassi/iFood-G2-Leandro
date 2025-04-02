import express from 'express';
import cors from 'cors';
import twilio from 'twilio';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Configure CORS to allow requests from the Vite dev server
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

app.use(express.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

if (!accountSid || !authToken || !verifyServiceSid) {
  console.error('Erro: Todas as variáveis de ambiente do Twilio são necessárias:');
  if (!accountSid) console.error('- TWILIO_ACCOUNT_SID não está definido');
  if (!authToken) console.error('- TWILIO_AUTH_TOKEN não está definido');
  if (!verifyServiceSid) console.error('- TWILIO_VERIFY_SERVICE_SID não está definido');
  process.exit(1);
}

const client = twilio(accountSid, authToken);

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

app.post('/api/send-verification', async (req, res) => {
  try {
    let { phoneNumber } = req.body;
    phoneNumber = formatPhoneNumber(phoneNumber);
    
    console.log('Enviando verificação para:', phoneNumber);
    
    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications
      .create({
        to: phoneNumber,
        channel: 'sms'
      });
    
    console.log('Verificação enviada:', verification.sid);
    res.json({ success: true, sid: verification.sid });
  } catch (error) {
    console.error('Erro Twilio:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Falha ao enviar código de verificação'
    });
  }
});

app.post('/api/verify-code', async (req, res) => {
  try {
    let { phoneNumber, code } = req.body;
    phoneNumber = formatPhoneNumber(phoneNumber);
    
    console.log('Verificando código para:', phoneNumber);
    
    if (!phoneNumber || !code) {
      return res.status(400).json({
        success: false,
        error: 'Número de telefone e código são obrigatórios'
      });
    }

    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks
      .create({
        to: phoneNumber,
        code: code
      });
    
    console.log('Resultado da verificação:', verificationCheck.status);
    
    res.json({
      success: true,
      valid: verificationCheck.status === 'approved',
      status: verificationCheck.status
    });
  } catch (error) {
    console.error('Erro de verificação:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Falha ao verificar código'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});