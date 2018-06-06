import React from 'react';
import PropTypes from 'prop-types';
import { Table, Row, Col, Popconfirm, Button } from 'antd';

import { R$, excluirServico, somaTotalServico } from '../services';

class ServicosTable extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    servicos: PropTypes.object.isRequired, // eslint-disable-line
  }

  static columns = [{
    title: 'Nota',
    dataIndex: 'nota',
    key: 'nota',
    fixed: true,
  }, {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  }, {
    title: 'Data',
    dataIndex: 'data',
    key: 'data',
  }, {
    title: 'Valor do Serviço',
    dataIndex: 'valorServico',
    key: 'valorServico',
  }, {
    title: 'Retenções',
    children: [{
      title: 'ISS',
      dataIndex: 'issRetido',
      key: 'issRetido',
    }, {
      title: 'PIS',
      dataIndex: 'pisRetido',
      key: 'pisRetido',
    }, {
      title: 'COFINS',
      dataIndex: 'cofinsRetido',
      key: 'cofinsRetido',
    }, {
      title: 'CSLL',
      dataIndex: 'csllRetido',
      key: 'csllRetido',
    }, {
      title: 'IRPJ',
      dataIndex: 'irpjRetido',
      key: 'irpjRetido',
    }, {
      title: 'Total',
      dataIndex: 'totalRetido',
      key: 'totalRetido',
    }],
  }, {
    title: 'ISS',
    dataIndex: 'iss',
    key: 'iss',
  }, {
    title: 'PIS',
    dataIndex: 'pis',
    key: 'pis',
  }, {
    title: 'COFINS',
    dataIndex: 'cofins',
    key: 'cofins',
  }, {
    title: 'CSLL',
    dataIndex: 'csll',
    key: 'csll',
  }, {
    title: 'IRPJ',
    dataIndex: 'irpj',
    key: 'irpj',
  }, {
    title: 'Total',
    dataIndex: 'total',
    key: 'total',
  }];

  state = {}

  excluirServico = (servico, key) => {
    const { servicos } = this.props;
    const emitente = servico.nota.substring(0, 14);
    excluirServico(emitente, key).then(() => {
      delete servicos[key];
      this.props.onChange(servicos);
    });
  }

  defineDataSource = () => {
    const dataSource = [];
    const { servicos } = this.props;
    let totais;

    Object.keys(servicos).forEach((key) => {
      const servico = servicos[key];
      const numero = parseInt(servico.nota.substring(18), 10);
      const valores = {
        key: servico.nota,
        nota: numero,
        status: servico.notaStatus,
        data: servico.data.toLocaleString('pt-br'),
        valorServico: R$(servico.valores.impostos.baseDeCalculo),
        issRetido: R$(servico.valores.impostos.retencoes.iss),
        pisRetido: R$(servico.valores.impostos.retencoes.pis),
        cofinsRetido: R$(servico.valores.impostos.retencoes.cofins),
        csllRetido: R$(servico.valores.impostos.retencoes.csll),
        irpjRetido: R$(servico.valores.impostos.retencoes.irpj),
        totalRetido: R$(servico.valores.impostos.retencoes.total),
        iss: R$(servico.valores.impostos.iss),
        pis: R$(servico.valores.impostos.pis),
        cofins: R$(servico.valores.impostos.cofins),
        csll: R$(servico.valores.impostos.csll),
        irpj: R$(servico.valores.impostos.irpj),
        total: R$(servico.valores.impostos.total),
      };

      totais = somaTotalServico(valores, totais);

      dataSource.push({
        key: servico.nota,
        nota: (
          <Popconfirm
            title="Deseja mesmo excluir esse serviço?"
            okText="Sim"
            cancelText="Não"
            onConfirm={() => this.excluirServico(servico, key)}
          >
            <Button type="ghost">{numero}</Button>
          </Popconfirm>
        ),
        status: servico.notaStatus,
        data: servico.data.toLocaleString('pt-br'),
        valorServico: R$(servico.valores.impostos.baseDeCalculo),
        issRetido: R$(servico.valores.impostos.retencoes.iss),
        pisRetido: R$(servico.valores.impostos.retencoes.pis),
        cofinsRetido: R$(servico.valores.impostos.retencoes.cofins),
        csllRetido: R$(servico.valores.impostos.retencoes.csll),
        irpjRetido: R$(servico.valores.impostos.retencoes.irpj),
        totalRetido: R$(servico.valores.impostos.retencoes.total),
        iss: R$(servico.valores.impostos.iss),
        pis: R$(servico.valores.impostos.pis),
        cofins: R$(servico.valores.impostos.cofins),
        csll: R$(servico.valores.impostos.csll),
        irpj: R$(servico.valores.impostos.irpj),
        total: R$(servico.valores.impostos.total),
      });
    });
    if (totais) {
      dataSource.push(totais);
    }
    return dataSource;
  }

  render() {
    const dataSource = this.defineDataSource();

    return (
      <Row
        type="flex"
        justify="center"
      >
        <Col span={23}>
          <Table
            bordered
            size="small"
            columns={ServicosTable.columns}
            dataSource={dataSource}
            scroll={{ x: '250%' }}
            pagination={{ position: 'top' }}
            style={{
              marginBottom: '20px',
            }}
          />
        </Col>
      </Row>
    );
  }
}

export default ServicosTable;
