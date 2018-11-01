import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Table } from 'antd';

import { R$ } from '../services';

const temServicos = props => Object.keys(props.dados.servicos).length > 0;
const temMovimentos = props => Object.keys(props.dados.movimentos).length > 0;

function gerarTable(props) {
  const { complementares, trimestre } = props.dados;
  const columns = [];
  const dataSource = [];
  const data = {};

  if (temMovimentos(props)) {
    columns.push({
      title: 'ICMS',
      dataIndex: 'icms',
      key: 'icms',
    });
    data.icms = R$(trimestre[complementares.mes].totais.impostos.icms.proprio +
      trimestre[complementares.mes].totais.impostos.icms.difal.origem);
  }

  if (temServicos(props)) {
    columns.push({
      title: 'ISS',
      dataIndex: 'iss',
      key: 'iss',
    });
    data.iss = R$(trimestre[complementares.mes].totais.impostos.iss -
      trimestre[complementares.mes].totais.impostos.retencoes.iss);
  }

  columns.push({
    title: 'PIS',
    dataIndex: 'pis',
    key: 'pis',
  });

  data.pis = R$((trimestre[complementares.mes].totais.impostos.pis -
    trimestre[complementares.mes].totais.impostos.retencoes.pis) +
    trimestre[complementares.mes].totais.impostos.acumulado.pis);

  columns.push({
    title: 'COFINS',
    dataIndex: 'cofins',
    key: 'cofins',
  });

  data.cofins = R$((trimestre[complementares.mes].totais.impostos.cofins -
    trimestre[complementares.mes].totais.impostos.retencoes.cofins) +
    trimestre[complementares.mes].totais.impostos.acumulado.cofins);

  if (parseInt(complementares.mes, 10) % 3 === 0 &&
    complementares.formaPagamento !== 'PAGAMENTO ANTECIPADO') {
    columns.push({
      title: 'CSLL',
      dataIndex: 'csll',
      key: 'csll',
    });
    data.csll = R$(trimestre.totais.impostos.csll - trimestre.totais.impostos.retencoes.csll);

    columns.push({
      title: 'IRPJ + ADICIONAL',
      dataIndex: 'irpj',
      key: 'irpj',
    });
    data.irpj = R$((trimestre.totais.impostos.irpj -
      trimestre.totais.impostos.retencoes.irpj) +
      trimestre.totais.impostos.adicionalIr);
  } else if (parseInt(complementares.mes, 10) % 3 !== 0 &&
    complementares.formaPagamento === 'PAGAMENTO ANTECIPADO') {
    columns.push({
      title: 'CSLL',
      dataIndex: 'csll',
      key: 'csll',
    });
    data.csll = R$(trimestre[complementares.mes].totais.impostos.csll -
      trimestre[complementares.mes].totais.impostos.retencoes.csll);

    columns.push({
      title: 'IRPJ',
      dataIndex: 'irpj',
      key: 'irpj',
    });
    data.irpj = R$(trimestre[complementares.mes].totais.impostos.irpj -
      trimestre[complementares.mes].totais.impostos.retencoes.irpj);
  } else if (parseInt(complementares.mes, 10) % 3 === 0 &&
    complementares.formaPagamento === 'PAGAMENTO ANTECIPADO') {
    columns.push({
      title: 'CSLL',
      dataIndex: 'csll',
      key: 'csll',
    });
    data.csll = R$(trimestre[complementares.mes].totais.impostos.csll -
      trimestre[complementares.mes].totais.impostos.retencoes.csll);

    columns.push({
      title: 'IRPJ + ADICIONAL',
      dataIndex: 'irpj',
      key: 'irpj',
    });
    data.irpj = R$((trimestre[complementares.mes].totais.impostos.irpj -
      trimestre[complementares.mes].totais.impostos.retencoes.irpj) +
      trimestre.totais.impostos.adicionalIr);
  }

  data.key = 'guias';

  dataSource.push(data);

  return {
    dataSource,
    columns,
  };
}

function GuiasTable(props) {
  const { dataSource, columns } = gerarTable(props);

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
          pagination={{ position: 'none' }}
          style={{
            marginBottom: '20px',
          }}
        />
      </Col>
    </Row>
  );
}

GuiasTable.propTypes = {
  dados: PropTypes.shape({ // eslint-disable-line
    servicos: PropTypes.array,
    movimentos: PropTypes.array,
    complementares: PropTypes.object,
    trimestre: PropTypes.object,
  }).isRequired,
};

export default GuiasTable;
