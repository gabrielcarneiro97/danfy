import React from 'react';

import { VisualizarForm } from '.';

class VisualizarMovimento extends React.Component {
  state = {};

  render() {
    return <VisualizarForm onSubmit={val => console.log(val)} />;
  }
}

export default VisualizarMovimento;
