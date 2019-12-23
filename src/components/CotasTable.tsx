import React from 'react';
import PropTypes from 'prop-types';
import { Table, Col, Row } from 'antd';

import TableToPrint from './TableToPrint';
import { R$, calcularCotas, temTabelaCotas } from '../services';

import Connect from '../store/Connect';

function CotasTable(props) {
  const { store, printable } = props;
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
        columns={CotasTable.columns}
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
          columns={CotasTable.columns}
          dataSource={dataSource}
          pagination={{ position: 'none' }}
          style={{
            marginBottom: '20px',
          }}
        />
      </Col>
    </Row>
  );
}

CotasTable.propTypes = {
  printable: PropTypes.bool,
  store: PropTypes.shape({
    dominio: PropTypes.array,
    trimestreData: PropTypes.object,
    notasPool: PropTypes.array,
    notasServicoPool: PropTypes.array,
    empresa: PropTypes.shape({
      numeroSistema: PropTypes.string,
      nome: PropTypes.string,
      formaPagamento: PropTypes.string,
      cnpj: PropTypes.string,
      simples: PropTypes.bool,
    }),
    competencia: PropTypes.shape({
      mes: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      ano: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  }).isRequired,
};

CotasTable.defaultProps = {
  printable: false,
};

CotasTable.columns = [{
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

export default Connect(CotasTable);
