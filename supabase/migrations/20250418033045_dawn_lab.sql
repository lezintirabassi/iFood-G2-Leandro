/*
  # Initial Schema Setup
  
  1. Tables
    - enderecos (addresses)
    - restaurantes (restaurants)
    - produtos (products)
    - carrinho (cart)
  
  2. Security
    - Enable RLS on all tables
    - Set up policies for authenticated users
*/

-- Create tables
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

CREATE TABLE IF NOT EXISTS carrinho (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  produto_id uuid REFERENCES produtos(id) ON DELETE CASCADE NOT NULL,
  quantidade integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrinho ENABLE ROW LEVEL SECURITY;

-- Policies for enderecos
CREATE POLICY "Users can view their own addresses"
  ON enderecos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own addresses"
  ON enderecos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses"
  ON enderecos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses"
  ON enderecos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for restaurantes
CREATE POLICY "Users can view their own restaurants"
  ON restaurantes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own restaurants"
  ON restaurantes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own restaurants"
  ON restaurantes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own restaurants"
  ON restaurantes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for produtos
CREATE POLICY "Users can view products of their restaurants"
  ON produtos FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM restaurantes
    WHERE restaurantes.id = produtos.restaurante_id
    AND restaurantes.user_id = auth.uid()
  ));

CREATE POLICY "Users can create products for their restaurants"
  ON produtos FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM restaurantes
    WHERE restaurantes.id = restaurante_id
    AND restaurantes.user_id = auth.uid()
  ));

CREATE POLICY "Users can update products of their restaurants"
  ON produtos FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM restaurantes
    WHERE restaurantes.id = produtos.restaurante_id
    AND restaurantes.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM restaurantes
    WHERE restaurantes.id = restaurante_id
    AND restaurantes.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete products of their restaurants"
  ON produtos FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM restaurantes
    WHERE restaurantes.id = produtos.restaurante_id
    AND restaurantes.user_id = auth.uid()
  ));

-- Policies for carrinho
CREATE POLICY "Users can view their own cart"
  ON carrinho FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add items to their cart"
  ON carrinho FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their cart items"
  ON carrinho FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove items from their cart"
  ON carrinho FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);