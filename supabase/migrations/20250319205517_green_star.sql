/*
  # Criar tabela de restaurantes

  1. Nova Tabela
    - `restaurantes`
      - `id` (uuid, chave primária)
      - `user_id` (uuid, chave estrangeira para users)
      - `nome` (text, nome do restaurante)
      - `descricao` (text, descrição do restaurante)
      - `categoria` (text, categoria do restaurante)
      - `horario_abertura` (time, horário de abertura)
      - `horario_fechamento` (time, horário de fechamento)
      - `created_at` (timestamp com timezone)

  2. Segurança
    - Habilitar RLS na tabela
    - Adicionar políticas para usuários autenticados
*/

DO $$ 
BEGIN
  -- Criar tabela se não existir
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

  -- Habilitar RLS
  ALTER TABLE restaurantes ENABLE ROW LEVEL SECURITY;

  -- Criar políticas apenas se não existirem
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'restaurantes' 
    AND policyname = 'Usuários podem ver seus próprios restaurantes'
  ) THEN
    CREATE POLICY "Usuários podem ver seus próprios restaurantes"
      ON restaurantes
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'restaurantes' 
    AND policyname = 'Usuários podem inserir seus próprios restaurantes'
  ) THEN
    CREATE POLICY "Usuários podem inserir seus próprios restaurantes"
      ON restaurantes
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'restaurantes' 
    AND policyname = 'Usuários podem atualizar seus próprios restaurantes'
  ) THEN
    CREATE POLICY "Usuários podem atualizar seus próprios restaurantes"
      ON restaurantes
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'restaurantes' 
    AND policyname = 'Usuários podem deletar seus próprios restaurantes'
  ) THEN
    CREATE POLICY "Usuários podem deletar seus próprios restaurantes"
      ON restaurantes
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;