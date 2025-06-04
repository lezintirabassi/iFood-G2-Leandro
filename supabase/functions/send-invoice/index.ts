import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { pedido } = await req.json();
    
    const client = new SmtpClient();

    await client.connectTLS({
      hostname: "smtp.gmail.com",
      port: 465,
      username: Deno.env.get("tirabassileandro30@gmail.com"),
      password: Deno.env.get("zorc wkra hgyt uyuh"),
    });

    const itensFormatados = pedido.itens
      .map(item => `${item.quantidade}x ${item.nome} - R$ ${(item.preco * item.quantidade).toFixed(2)}`)
      .join('\n');

    const emailContent = `
NOTA FISCAL ELETRÔNICA SIMPLIFICADA
----------------------------------
Pedido #${pedido.id}
Data: ${new Date().toLocaleDateString('pt-BR')}

CLIENTE
Nome: ${pedido.nome}
Email: ${pedido.email}

ITENS DO PEDIDO
${itensFormatados}

TOTAL: R$ ${pedido.total.toFixed(2)}

FORMA DE PAGAMENTO
${pedido.formaPagamento.toUpperCase()}

ENDEREÇO DE ENTREGA
${pedido.endereco.logradouro}, ${pedido.endereco.numero}
${pedido.endereco.complemento ? pedido.endereco.complemento + '\n' : ''}
${pedido.endereco.bairro}
${pedido.endereco.cidade} - ${pedido.endereco.estado}
CEP: ${pedido.endereco.cep}

----------------------------------
iFood Clone - Nota Fiscal Eletrônica Simplificada
Este documento não possui valor fiscal
`;

    await client.send({
      from: Deno.env.get("tirabassileandro30@gmail.com"),
      to: pedido.email,
      subject: `NFe Simplificada - Pedido #${pedido.id}`,
      content: emailContent,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});