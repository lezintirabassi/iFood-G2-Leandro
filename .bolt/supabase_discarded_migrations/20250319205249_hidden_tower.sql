/*
  # Criar tabela de produtos

  1. Nova Tabela
    - `produtos`
      - `id` (uuid, chave primária)
      - `restaurante_id` (uuid, chave estrangeira para restaurantes)
      - `nome` (text)
      - `descricao` (text, opcional)
      - `preco` (decimal)
      - `categoria` (text)
      - `imagem_url` (text, opcional)
      - `disponivel` (boolean)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS na tabela
    - Adicionar políticas para usuários autenticados poderem gerenciar apenas produtos dos seus próprios restaurantes
*/

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

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

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