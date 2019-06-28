import React from 'react';
import PropTypes from 'prop-types';
import { Table, Col, Row } from 'antd';

import { R$, calcularCotas, temTabelaCotas } from '../services';

function defineDataSource(props) {
  const { cotaCsll, cotaIr } = calcularCotas(props);

  const dataSource = [];
  if (temTabelaCotas(props.dados.complementares)) {
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
  return dataSource;
}

function CotasTable(props) {
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
  dados: PropTypes.shape({ // eslint-disable-line
    trimestre: PropTypes.object,
  }).isRequired,
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

export default CotasTable;
