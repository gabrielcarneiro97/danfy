import React from 'react';

import {
  VisualizarForm,
  VisualizarTables,
} from '.';

import './VisualizarMovimento.css';

import { MovimentoStore } from '../store/Store';

function VisualizarMovimento() {
  return (
    <MovimentoStore>
      <div>
        <VisualizarForm />
      </div>
      <div style={{ marginTop: '30px' }}>
        <VisualizarTables />
      </div>
    </MovimentoStore>
  );
}

export default VisualizarMovimento;
