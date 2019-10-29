import React from 'react';

import { VisualizarEstoqueForm, EstoqueTable, PrintEstoque } from '.';

import './VisualizarMovimento.css';

function VisualizarEstoque() {
  return (
    <>
      <div>
        <VisualizarEstoqueForm />
      </div>
      <div style={{ marginTop: '30px' }}>
        {/* <PrintEstoque /> */}
        <EstoqueTable />
      </div>
    </>
  );
}

export default VisualizarEstoque;
