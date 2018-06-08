import React from 'react';
import PropTypes from 'prop-types';
import { Table, Col, Row } from 'antd';

import { R$ } from '../services';

function calcularCotas(props) {
  const { totais } = props.dados.trimestre;
  const valorIr = totais.impostos.irpj +
    (totais.impostos.adicionalIr - totais.impostos.retencoes.irpj);
  const valorCsll = totais.impostos.csll - totais.impostos.retencoes.csll;

  let cotaIr = { valor: 0, numero: 0 };
  let cotaCsll = { valor: 0, numero: 0 };

  if (valorIr / 3 > 1000) {
    cotaIr = { valor: valorIr / 3, numero: 3 };
  } else if (valorIr / 2 > 1000) {
    cotaIr = { valor: valorIr / 2, numero: 2 };
  } else {
    cotaIr = { valor: valorIr, numero: 1 };
  }
  if (valorCsll / 3 > 1000) {
    cotaCsll = { valor: valorCsll / 3, numero: 3 };
  } else if (valorCsll / 2 > 1000) {
    cotaCsll = { valor: valorCsll / 2, numero: 2 };
  } else {
    cotaCsll = { valor: valorCsll, numero: 1 };
  }

  return { cotaCsll, cotaIr };
}

function defineDataSource(props) {
  const { cotaCsll, cotaIr } = calcularCotas(props);

  const dataSource = [];

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
