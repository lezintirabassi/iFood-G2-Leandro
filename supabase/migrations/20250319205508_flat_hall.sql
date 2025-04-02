/*
  # Criação da tabela de endereços

  1. Nova Tabela
    - `enderecos`
      - `id` (uuid, chave primária)
      - `user_id` (uuid, referência ao usuário)
      - `cep` (texto)
      - `logradouro` (texto)
      - `numero` (texto)
      - `complemento` (texto, opcional)
      - `bairro` (texto)
      - `cidade` (texto)
      - `estado` (texto)
      - `principal` (booleano)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela
    - Adicionar políticas para CRUD apenas para o próprio usuário
*/

DO $$ 
BEGIN
  -- Criar tabela se não existir
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

  -- Habilitar RLS
  ALTER TABLE enderecos ENABLE ROW LEVEL SECURITY;

  -- Criar políticas apenas se não existirem
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'enderecos' 
    AND policyname = 'Usuários podem ver seus próprios endereços'
  ) THEN
    CREATE POLICY "Usuários podem ver seus próprios endereços"
      ON enderecos
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'enderecos' 
    AND policyname = 'Usuários podem inserir seus próprios endereços'
  ) THEN
    CREATE POLICY "Usuários podem inserir seus próprios endereços"
      ON enderecos
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'enderecos' 
    AND policyname = 'Usuários podem atualizar seus próprios endereços'
  ) THEN
    CREATE POLICY "Usuários podem atualizar seus próprios endereços"
      ON enderecos
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'enderecos' 
    AND policyname = 'Usuários podem deletar seus próprios endereços'
  ) THEN
    CREATE POLICY "Usuários podem deletar seus próprios endereços"
      ON enderecos
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;