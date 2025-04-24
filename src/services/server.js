import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import twilio from 'twilio';
import cors from 'cors';
const app = express();
app.use(cors()); // Permite requisições do frontend
app.use(express.json()); // Permite JSON no body das requisições

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const verificationCodes = {}; // Armazena códigos temporariamente

// Enviar código de verificação via SMS
app.post('/api/send-verification', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const code = Math.floor(100000 + Math.random() * 900000); // Gera código de 6 dígitos
    verificationCodes[phoneNumber] = code;

    await client.messages.create({
      body: `Seu código de verificação é: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    res.json({ success: true, message: 'Código enviado!' });
  } catch (error) {
    console.error('Erro ao enviar SMS:', error);
    res.status(500).json({ error: 'Erro ao enviar SMS' });
  }
});

// Verificar código digitado pelo usuário
app.post('/api/verify-code', (req, res) => {
  try {
    const { phoneNumber, code } = req.body;
    
    if (verificationCodes[phoneNumber] && verificationCodes[phoneNumber] == code) {
      delete verificationCodes[phoneNumber]; // Remove o código após o uso
      return res.json({ valid: true, message: 'Código válido!' });
    }

    res.json({ valid: false, error: 'Código inválido ou expirado' });
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    res.status(500).json({ error: 'Erro ao verificar código' });
  }
});

app.listen(3001, () => console.log('Servidor rodando na porta 3001'));