import React from 'react';
import PropTypes from 'prop-types';
import { Table, Row, Col } from 'antd';

import TableToPrint from './TableToPrint';
import { pegaMes, R$ } from '../services';

import Connect from '../store/Connect';

function AcumuladosTable(props) {
  const { store, printable } = props;
  const { trimestreData } = store;

  const stg = (str) => <strong>{str}</strong>;

  const dataSource = [];

  Object.keys(trimestreData).forEach((key) => {
    if (key !== 'movimentosPool' && key !== 'servicosPool') {
      const mes = key === 'trim' ? <strong>Trimestre</strong> : pegaMes(key);

      const { totalSomaPool } = trimestreData[key];
      const { retencao, totalSoma } = totalSomaPool;
      const { imposto } = totalSomaPool.impostoPool;

      dataSource.push({
        key: `acumulado-${key}`,
        mes,
        csll: key === 'trim' ? stg(R$(imposto.csll - retencao.csll)) : R$(imposto.csll - retencao.csll),
        irpj: key === 'trim' ? stg(R$(imposto.irpj - retencao.irpj)) : R$(imposto.irpj - retencao.irpj),
        faturamento: key === 'trim' ? stg(R$(totalSoma.valorMovimento + totalSoma.valorServico)) : R$(totalSoma.valorMovimento + totalSoma.valorServico),
      });
    }
  });

  if (printable) {
    return (
      <TableToPrint
        dataSource={dataSource}
        columns={AcumuladosTable.columns}
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
          columns={AcumuladosTable.columns}
          dataSource={dataSource}
          pagination={{ position: 'none' }}
          style={{ marginBottom: '20px' }}
        />
      </Col>
    </Row>
  );
}

AcumuladosTable.propTypes = {
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

AcumuladosTable.defaultProps = {
  printable: false,
};

AcumuladosTable.columns = [
  {
    title: 'Mês',
    dataIndex: 'mes',
    key: 'mes',
  }, {
    title: 'CSLL',
    dataIndex: 'csll',
    key: 'csll',
  }, {
    title: 'IRPJ',
    dataIndex: 'irpj',
    key: 'irpj',
  }, {
    title: 'Faturamento',
    dataIndex: 'faturamento',
    key: 'faturamento',
  },
];

export default Connect(AcumuladosTable);
