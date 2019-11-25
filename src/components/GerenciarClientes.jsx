import React from 'react';
import {
  Row,
  Col,
  Divider,
} from 'antd';

import { ClientesStore } from '../store/Store';

import AdicionarCliente from './AdicionarCliente';

function GerenciarClientes() {
  return (
    <ClientesStore>
      <Row type="flex" justify="center">
        <Divider>Adicionar Cliente</Divider>
        <Col>
          <AdicionarCliente />
        </Col>
      </Row>
    </ClientesStore>
  );
}

export default GerenciarClientes;
