import React from 'react';
import { Table, Col, Row } from 'antd';

import TableToPrint from './TableToPrint';
import { R$, calcularCotas, temTabelaCotas } from '../services/calculador.service';

import Connect from '../store/Connect';
import { MovimentoStore } from '../types';

type propTypes = {
  printable: boolean;
  store: MovimentoStore;
}

const columns = [{
  title: 'Nº',
  dataIndex: 'numero',
  key: 'numero',
}, {
  title: 'CSLL',
  dataIndex: 'csll',
  key: 'csll',
}, {
  title: 'IRPJ',
  dataIndex: 'irpj',
  key: 'irpj',
}];

function CotasTable(props : propTypes) : JSX.Element {
  const { store, printable = false } = props;
  const { competencia, empresa, trimestreData } = store;
  const { cotaCsll, cotaIr } = calcularCotas(trimestreData);

  const dataSource = [];
  if (temTabelaCotas(empresa, competencia)) {
    for (let num = 1; num <= 3; num += 1) {
      const row = {
        key: `${num}-cotas-table`,
        numero: num,
        csll: '0,00',
        irpj: '0,00',
      };

      if (cotaCsll.numero >= num) {
        row.csll = R$(cotaCsll.valor);
      }

      if (cotaIr.numero >= num) {
        row.irpj = R$(cotaIr.valor);
      }

      dataSource.push(row);
    }
  }

  if (printable) {
    return (
      <TableToPrint
        dataSource={dataSource}
        columns={columns}
      />
    );
  }

  return (
    <Row
      type="flex"
      justify="center"
    >
      <Col span={23}>
        <Table
          bordered
          size="small"
          columns={columns}
          dataSource={dataSource}
          pagination={{ position: undefined }}
          style={{
            marginBottom: '20px',
          }}
        />
      </Col>
    </Row>
  );
}

export default Connect(CotasTable);
