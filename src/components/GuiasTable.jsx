import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Table } from 'antd';

import { R$ } from '../services';

import Connect from '../store/Connect';

function GuiasTable(props) {
  const { store } = props;
  const { trimestreData, competencia, empresa } = store;
  const { movimentosPool, servicosPool } = trimestreData;
  const { mes } = competencia;

  const temMovimentos = movimentosPool.length > 0;
  const temServicos = servicosPool.length > 0;

  const gerarTable = () => {
    const columns = [];
    const data = {};

    if (!trimestreData[mes]) {
      return {
        dataSource: [],
        columns: [],
      };
    }

    const { acumulado, retencao, impostoPool } = trimestreData[mes].totalSomaPool;
    const { imposto, icms } = impostoPool;
    const trimestre = trimestreData.trim.totalSomaPool;

    if (temMovimentos) {
      columns.push({
        title: 'ICMS',
        dataIndex: 'icms',
        key: 'icms',
      });
      data.icms = R$(icms.proprio + icms.difalOrigem);
    }

    if (temServicos) {
      columns.push({
        title: 'ISS',
        dataIndex: 'iss',
        key: 'iss',
      });
      data.iss = R$(imposto.iss - retencao.iss);
    }

    columns.push({
      title: 'PIS',
      dataIndex: 'pis',
      key: 'pis',
    });

    data.pis = R$((imposto.pis - retencao.pis) + acumulado.pis);

    columns.push({
      title: 'COFINS',
      dataIndex: 'cofins',
      key: 'cofins',
    });

    data.cofins = R$((imposto.cofins - retencao.cofins) + acumulado.cofins);

    if (parseInt(mes, 10) % 3 === 0
    && empresa.formaPagamento !== 'PAGAMENTO ANTECIPADO') {
      columns.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
      });
      data.csll = R$(trimestre.impostoPool.imposto.csll - trimestre.retencao.csll);

      columns.push({
        title: 'IRPJ + ADICIONAL',
        dataIndex: 'irpj',
        key: 'irpj',
      });
      data.irpj = R$((trimestre.impostoPool.imposto.irpj - trimestre.retencao.irpj) +
        trimestre.impostoPool.imposto.adicionalIr);
    } else if (parseInt(mes, 10) % 3 !== 0
      && empresa.formaPagamento === 'PAGAMENTO ANTECIPADO') {
      columns.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
      });

      data.csll = R$(imposto.csll - retencao.csll);

      columns.push({
        title: 'IRPJ',
        dataIndex: 'irpj',
        key: 'irpj',
      });
      data.irpj = R$(imposto.irpj - retencao.irpj);
    } else if (parseInt(mes, 10) % 3 === 0
      && empresa.formaPagamento === 'PAGAMENTO ANTECIPADO') {
      columns.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
      });
      data.csll = R$(imposto.csll - retencao.csll);

      columns.push({
        title: 'IRPJ + ADICIONAL',
        dataIndex: 'irpj',
        key: 'irpj',
      });
      data.irpj = R$((imposto.irpj - retencao.irpj) +
        trimestre.impostoPool.imposto.adicionalIr);
    }

    data.key = 'guias';

    return {
      dataSource: [data],
      columns,
    };
  };


  const { dataSource, columns } = gerarTable();

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

export default Connect(GuiasTable);
