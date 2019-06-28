import React from 'react';
import PropTypes from 'prop-types';
import { Table, Row, Col } from 'antd';

import { pegaMes, R$ } from '../services';

function defineDataSource(props) {
  const stg = str => <strong>{str}</strong>;

  const { trimestreData } = props.dados;
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

  return dataSource;
}

function AcumuladosTable(props) {
  const dataSource = defineDataSource(props);

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
  dados: PropTypes.shape({ // eslint-disable-line
    trimestre: PropTypes.object,
  }).isRequired,
};

AcumuladosTable.columns = [{
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
}];

export default AcumuladosTable;
