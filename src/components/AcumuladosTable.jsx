import React from 'react';
import PropTypes from 'prop-types';
import { Table, Row, Col } from 'antd';

import { pegaMes, R$ } from '../services';

function defineDataSource(props) {
  const { trimestre } = props.dados;
  const dataSource = [];

  Object.keys(trimestre).forEach((key) => {
    if (key === 'totais') {
      const mes = <strong>Trimestre</strong>;
      const el = trimestre[key];

      dataSource.push({
        key: `acumulado-${key}`,
        mes,
        csll: <strong>{R$(el.impostos.csll - el.impostos.retencoes.csll)}</strong>,
        irpj: <strong>{R$(el.impostos.irpj - el.impostos.retencoes.irpj)}</strong>,
        faturamento: <strong>{R$(el.lucro + el.servicos)}</strong>,
      });
    } else {
      const mes = pegaMes(key);
      const el = trimestre[key];

      dataSource.push({
        key: `acumulado-${key}`,
        mes,
        csll: R$(el.totais.impostos.csll - el.totais.impostos.retencoes.csll),
        irpj: R$(el.totais.impostos.irpj - el.totais.impostos.retencoes.irpj),
        faturamento: R$(el.totais.lucro + el.totais.servicos),
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
