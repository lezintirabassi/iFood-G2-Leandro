/*
  # Criar tabela de produtos

  1. Nova Tabela
    - `produtos`
      - `id` (uuid, chave primária)
      - `restaurante_id` (uuid, chave estrangeira para restaurantes)
      - `nome` (text, nome do produto)
      - `descricao` (text, descrição do produto)
      - `preco` (decimal, preço do produto)
      - `categoria` (text, categoria do produto)
      - `imagem_url` (text, URL da imagem do produto)
      - `disponivel` (boolean, indica se o produto está disponível)
      - `created_at` (timestamp com timezone)

  2. Segurança
    - Habilitar RLS na tabela
    - Adicionar políticas para usuários autenticados
*/

DO $$ 
BEGIN
  -- Criar tabela se não existir
  CREATE TABLE IF NOT EXISTS produtos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurante_id uuid REFERENCES restaurantes(id) ON DELETE CASCADE NOT NULL,
    nome text NOT NULL,
    descricao text,
    preco decimal(10,2) NOT NULL,
    categoria text NOT NULL,
    imagem_url text,
    disponivel boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
  );

  -- Habilitar RLS
  ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

  -- Criar políticas apenas se não existirem
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'produtos' 
    AND policyname = 'Usuários podem ver produtos dos seus restaurantes'
  ) THEN
    CREATE POLICY "Usuários podem ver produtos dos seus restaurantes"
      ON produtos
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM restaurantes
          WHERE restaurantes.id = produtos.restaurante_id
          AND restaurantes.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'produtos' 
    AND policyname = 'Usuários podem inserir produtos nos seus restaurantes'
  ) THEN
    CREATE POLICY "Usuários podem inserir produtos nos seus restaurantes"
      ON produtos
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM restaurantes
          WHERE restaurantes.id = restaurante_id
          AND restaurantes.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'produtos' 
    AND policyname = 'Usuários podem atualizar produtos dos seus restaurantes'
  ) THEN
    CREATE POLICY "Usuários podem atualizar produtos dos seus restaurantes"
      ON produtos
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM restaurantes
          WHERE restaurantes.id = produtos.restaurante_id
          AND restaurantes.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM restaurantes
          WHERE restaurantes.id = restaurante_id
          AND restaurantes.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'produtos' 
    AND policyname = 'Usuários podem deletar produtos dos seus restaurantes'
  ) THEN
    CREATE POLICY "Usuários podem deletar produtos dos seus restaurantes"
      ON produtos
      FOR DELETE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM restaurantes
          WHERE restaurantes.id = produtos.restaurante_id
          AND restaurantes.user_id = auth.uid()
        )
      );
  END IF;
END $$;