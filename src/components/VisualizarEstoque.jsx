import React, { Component, Fragment } from 'react';

import { VisualizarEstoqueForm, EstoqueTable } from '.';

import Connect from '../store/Connect';


import './VisualizarMovimento.css';

class VisualizarEstoque extends Component {
  render() {
    return (
      <Fragment>
        <div>
          <VisualizarEstoqueForm />
        </div>
        <div style={{ marginTop: '30px' }}>
          <EstoqueTable />
        </div>
      </Fragment>
    );
  }
}

export default Connect(VisualizarEstoque);
