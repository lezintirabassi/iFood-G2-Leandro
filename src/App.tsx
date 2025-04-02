import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PaginaLogin from './pages/PaginaLogin';
import Endereco from './pages/Endereco';
import Restaurante from './pages/Restaurante';
import Produtos from './pages/Produtos';
import { ProvedorAutenticacao } from './contexts/AuthContext';

function App() {
  return (
    <ProvedorAutenticacao>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PaginaLogin />} />
          <Route path="/endereco" element={<Endereco />} />
          <Route path="/restaurante" element={<Restaurante />} />
          <Route path="/restaurante/:restauranteId/produtos" element={<Produtos />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProvedorAutenticacao>
  );
}

export default App;