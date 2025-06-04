-- Remover tabelas existentes
DROP TABLE IF EXISTS carrinho CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS restaurantes CASCADE;
DROP TABLE IF EXISTS enderecos CASCADE;

-- Criar tabela de endereços
CREATE TABLE enderecos (
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

-- Criar tabela de restaurantes
CREATE TABLE restaurantes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome text NOT NULL,
  descricao text,
  categoria text NOT NULL,
  horario_abertura time NOT NULL,
  horario_fechamento time NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Criar tabela de produtos
CREATE TABLE produtos (
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

-- Criar tabela do carrinho
CREATE TABLE carrinho (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  produto_id uuid REFERENCES produtos(id) ON DELETE CASCADE NOT NULL,
  quantidade integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrinho ENABLE ROW LEVEL SECURITY;

-- Políticas para enderecos
CREATE POLICY "enderecos_select" ON enderecos 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "enderecos_insert" ON enderecos 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enderecos_update" ON enderecos 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "enderecos_delete" ON enderecos 
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

-- Políticas para restaurantes
CREATE POLICY "restaurantes_select" ON restaurantes 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "restaurantes_insert" ON restaurantes 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "restaurantes_update" ON restaurantes 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "restaurantes_delete" ON restaurantes 
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);

-- Políticas para produtos
CREATE POLICY "produtos_select" ON produtos 
  FOR SELECT TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM restaurantes
    WHERE restaurantes.id = produtos.restaurante_id
    AND restaurantes.user_id = auth.uid()
  ));

CREATE POLICY "produtos_insert" ON produtos 
  FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (
    SELECT 1 FROM restaurantes
    WHERE restaurantes.id = restaurante_id
    AND restaurantes.user_id = auth.uid()
  ));

CREATE POLICY "produtos_update" ON produtos 
  FOR UPDATE TO authenticated 
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

CREATE POLICY "produtos_delete" ON produtos 
  FOR DELETE TO authenticated 
  USING (EXISTS (
    SELECT 1 FROM restaurantes
    WHERE restaurantes.id = produtos.restaurante_id
    AND restaurantes.user_id = auth.uid()
  ));

-- Políticas para carrinho
CREATE POLICY "carrinho_select" ON carrinho 
  FOR SELECT TO authenticated 
  USING (auth.uid() = user_id);

CREATE POLICY "carrinho_insert" ON carrinho 
  FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "carrinho_update" ON carrinho 
  FOR UPDATE TO authenticated 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "carrinho_delete" ON carrinho 
  FOR DELETE TO authenticated 
  USING (auth.uid() = user_id);