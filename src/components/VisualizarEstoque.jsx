import React from 'react';

import { VisualizarEstoqueForm, EstoqueTable } from '.';

import './VisualizarMovimento.css';

function VisualizarEstoque() {
  return (
    <>
      <div>
        <VisualizarEstoqueForm />
      </div>
      <div style={{ marginTop: '30px' }}>
        <EstoqueTable />
      </div>
    </>
  );
}

export default VisualizarEstoque;
