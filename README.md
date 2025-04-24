# iFood Clone - Sistema de Gerenciamento de Endereços e Restaurantes

Este projeto é um clone simplificado do iFood, permitindo que usuários gerenciem seus endereços e restaurantes.

## Pré-requisitos

- Node.js (versão 16 ou superior)
- NPM (Node Package Manager)
- Conta no Supabase (https://supabase.com)

## Configuração do Supabase

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. No seu projeto Supabase, vá para SQL Editor
4. Execute as seguintes migrações na ordem:

### Migração 1: Criar tabela de endereços

```sql
CREATE TABLE IF NOT EXISTS enderecos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cep text NOT NULL,
  logradouro text NOT NULL,
  numero text NOT NULL,
  complemento text,
  bairro text NOT NULL,
  cidade text NOT NULL,
  estado text NOT NULL,
  principal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE enderecos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios endereços"
  ON enderecos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios endereços"
  ON enderecos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios endereços"
  ON enderecos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios endereços"
  ON enderecos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

### Migração 2: Criar tabela de restaurantes

```sql
CREATE TABLE IF NOT EXISTS restaurantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  descricao text,
  categoria text NOT NULL,
  horario_abertura time NOT NULL,
  horario_fechamento time NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE restaurantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios restaurantes"
  ON restaurantes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios restaurantes"
  ON restaurantes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios restaurantes"
  ON restaurantes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios restaurantes"
  ON restaurantes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
```

## Configuração do Projeto

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd [NOME_DO_PROJETO]
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - No Supabase, vá para Project Settings > API
   - Copie o "Project URL" e "anon public" key
   - Adicione ao arquivo `.env`:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Funcionalidades

- Autenticação de usuários
- Gerenciamento de endereços
  - Adicionar, editar e remover endereços
  - Definir endereço principal
  - Busca automática de endereço por CEP
- Gerenciamento de restaurantes
  - Adicionar, editar e remover restaurantes
  - Categorização de restaurantes
  - Definição de horários de funcionamento

## Tecnologias Utilizadas

- React
- Vite
- Tailwind CSS
- Supabase (Autenticação e Banco de Dados)
- React Router DOM
- Lucide React (Ícones)

## Estrutura do Banco de Dados

### Tabela: enderecos
- id (uuid, primary key)
- user_id (uuid, foreign key)
- cep (text)
- logradouro (text)
- numero (text)
- complemento (text, opcional)
- bairro (text)
- cidade (text)
- estado (text)
- principal (boolean)
- created_at (timestamp)

### Tabela: restaurantes
- id (uuid, primary key)
- user_id (uuid, foreign key)
- nome (text)
- descricao (text, opcional)
- categoria (text)
- horario_abertura (time)
- horario_fechamento (time)
- created_at (timestamp)

## Segurança

O projeto utiliza Row Level Security (RLS) do Supabase para garantir que:
- Usuários só podem ver seus próprios dados
- Usuários só podem modificar seus próprios dados
- Todas as operações requerem autenticação