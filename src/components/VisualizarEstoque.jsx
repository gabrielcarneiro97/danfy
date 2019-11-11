import React from 'react';

import VisualizarEstoqueForm from './VisualizarEstoqueForm';
import EstoqueTable from './EstoqueTable';
import PrintEstoque from './PrintEstoque';

import './VisualizarMovimento.css';

import { EstoqueStore } from '../store/Store';

function VisualizarEstoque() {
  return (
    <EstoqueStore>
      <div>
        <VisualizarEstoqueForm />
      </div>
      <div style={{ marginTop: '30px' }}>
        {/* <PrintEstoque /> */}
        <EstoqueTable />
      </div>
    </EstoqueStore>
  );
}

export default VisualizarEstoque;
