import React from 'react';

import VisualizarEstoqueForm from './VisualizarEstoqueForm';
import EstoqueTable from './EstoqueTable';

import './VisualizarMovimento.css';

import { EstoqueStore } from '../store/Store';

function VisualizarEstoque() : JSX.Element {
  return (
    <EstoqueStore>
      <div>
        <VisualizarEstoqueForm />
      </div>
      <div style={{ marginTop: '30px' }}>
        <EstoqueTable />
      </div>
    </EstoqueStore>
  );
}

export default VisualizarEstoque;
