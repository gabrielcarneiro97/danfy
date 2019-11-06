import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Table } from 'antd';

import { R$ } from '../services';

import Connect from '../store/Connect';
import { carregarMovimento } from '../store/movimento';

function GuiasTable(props) {

}

class GuiasTableClass extends Component {
  static propTypes = {
    dados: PropTypes.shape({ // eslint-disable-line
      servicos: PropTypes.array,
      movimentos: PropTypes.array,
      complementares: PropTypes.object,
      trimestre: PropTypes.object,
      trimestreData: PropTypes.object,
    }).isRequired,
  };

  temServicos = () => this.props.dados.trimestreData.servicosPool.length > 0;
  temMovimentos = () => this.props.dados.trimestreData.movimentosPool.length > 0;

  gerarTable() {
    const columns = [];
    const dataSource = [];
    const data = {};

    const { complementares, trimestreData } = this.props.dados;

    const { acumulado, retencao, impostoPool } = trimestreData[complementares.mes].totalSomaPool;
    const { imposto, icms } = impostoPool;
    const trimestre = trimestreData.trim.totalSomaPool;

    if (this.temMovimentos()) {
      columns.push({
        title: 'ICMS',
        dataIndex: 'icms',
        key: 'icms',
      });
      data.icms = R$(icms.proprio + icms.difalOrigem);
    }

    if (this.temServicos()) {
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

    if (parseInt(complementares.mes, 10) % 3 === 0 &&
      complementares.formaPagamento !== 'PAGAMENTO ANTECIPADO') {
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
    } else if (parseInt(complementares.mes, 10) % 3 !== 0 &&
      complementares.formaPagamento === 'PAGAMENTO ANTECIPADO') {
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
    } else if (parseInt(complementares.mes, 10) % 3 === 0 &&
      complementares.formaPagamento === 'PAGAMENTO ANTECIPADO') {
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

    dataSource.push(data);

    return {
      dataSource,
      columns,
    };
  }

  render() {
    const { dataSource, columns } = this.gerarTable();

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
}

export default GuiasTable;
