import React from 'react';

import { VisualizarEstoqueForm, EstoqueTable, PrintEstoque } from '.';

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
