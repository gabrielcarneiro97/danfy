import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Table, Row, Col, Popconfirm, Button } from 'antd';

import { R$, excluirServico, somaTotalServico } from '../services';

class ServicosTable extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    servicos: PropTypes.array, // eslint-disable-line
  }

  static defaultProps = {
    servicos: [],
  }

  static columns = [{
    title: 'Nota',
    dataIndex: 'nota',
    key: 'nota',
    fixed: true,
    defaultSortOrder: 'ascend',
    sorter: (a, b) => {
      if (!a.nota.numero) {
        return 1;
      } else if (!b.nota.numero) {
        return -1;
      }
      if (a.nota.numero > b.nota.numero) {
        return 1;
      }
      return -1;
    },
    render: (data) => {
      if (data.$$typeof) {
        return data;
      }

      if (!data.numero) {
        return '';
      }

      return (
        <Popconfirm
          title="Deseja mesmo excluir esse serviço?"
          okText="Sim"
          cancelText="Não"
          onConfirm={() => data.excluir(data.servico, data.key)}
        >
          <Button type="ghost">{data.numero}</Button>
        </Popconfirm>
      );
    },
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
    const emitente = servico.nota.substring(0, 14);
    excluirServico(emitente, key).then((data) => {
      this.props.onChange(data);
    });
  }

  defineDataSource = () => {
    const dataSource = [];
    const { servicos } = this.props;
    let totais;

    servicos.forEach((servico) => {
      const key = servico._id;
      const numero = parseInt(servico.nota.substring(18), 10);
      const valores = {
        key: servico.nota,
        nota: numero,
        status: servico.notaStatus,
        data: moment(servico.data).format('DD[/]MMM'),
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
        nota: {
          numero,
          servico,
          key,
          excluir: this.excluirServico,
        },
        status: servico.notaStatus,
        data: moment(servico.data).format('DD[/]MMM'),
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
            scroll={{ x: '110%' }}
            pagination={{ position: 'top', simple: true }}
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
