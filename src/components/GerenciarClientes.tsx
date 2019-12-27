import React from 'react';
import {
  Row,
  Col,
  Divider,
} from 'antd';

import { ClientesStore } from '../store/Store';

import AdicionarCliente from './AdicionarCliente';
import GerenciarGrupos from './GerenciarGrupos';

function GerenciarClientes() : JSX.Element {
  return (
    <ClientesStore>
      <Row type="flex" justify="center">
        <Divider>Adicionar Cliente</Divider>
        <Col>
          <AdicionarCliente />
        </Col>
        <Divider>Gerenciar Grupos</Divider>
        <Col>
          <GerenciarGrupos />
        </Col>
      </Row>
    </ClientesStore>
  );
}

export default GerenciarClientes;
