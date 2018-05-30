import React from 'react';
import { Table, Row, Col, Button, Popconfirm } from 'antd';

import { MovimentoValorInput } from '.';
import { R$, retornarTipo, cancelarMovimento } from '../services';

class MovimentosTable extends React.Component {
  static columns = [{
    title: 'Editar',
    dataIndex: 'editar',
    key: 'editar',
    fixed: true,
  }, {
    title: 'Número',
    dataIndex: 'numero',
    key: 'numero',
    fixed: true,
  }, {
    title: 'Valor Nota Inicial',
    dataIndex: 'valorInicial',
    key: 'valorInicial',
  }, {
    title: 'Valor Nota Final',
    dataIndex: 'valorFinal',
    key: 'valorFinal',
  }, {
    title: 'Tipo de Movimento',
    dataIndex: 'tipoMovimento',
    key: 'tipoMovimento',
  }, {
    title: 'Lucro',
    dataIndex: 'lucro',
    key: 'lucro',
  }, {
    title: 'Base ICMS',
    dataIndex: 'baseIcms',
    key: 'baseIcms',
  }, {
    title: 'ICMS',
    dataIndex: 'icms',
    key: 'icms',
  }, {
    title: 'DIFAL',
    children: [{
      title: 'Originário',
      dataIndex: 'difalOrigem',
      key: 'difalOrigem',
    }, {
      title: 'Destinatário (GNRE)',
      dataIndex: 'difalDestino',
      key: 'difalDestino',
    }],
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
    title: 'TOTAL',
    dataIndex: 'total',
    key: 'total',
  }];

  constructor(props) {
    super(props);
    this.state = {
      movimentos: props.movimentos,
      notas: props.notas,
    };
  }

  handleChange = (v, n, m) => console.log(v, n, m);

  cancelarMovimento = (movimentoId, cnpj) => {
    cancelarMovimento(cnpj, movimentoId).then(() => {
      const { movimentos } = this.state;
      delete movimentos[movimentoId];

      this.setState({ movimentos });
    });
  }

  render() {
    const { movimentos, notas } = this.state;

    const dataSource = [];

    Object.keys(movimentos).forEach((key) => {
      const movimento = movimentos[key];
      const notaFinal = notas[movimento.notaFinal];
      const notaInicial = notas[movimento.notaInicial];

      dataSource.push({
        key,
        editar: '',
        numero: (
          <Popconfirm
            title="Deseja mesmo excluir esse movimento?"
            okText="Sim"
            cancelText="Não"
            onConfirm={() => this.cancelarMovimento(key, notaFinal.emitente)}
          >
            <Button type="ghost">{notaFinal.geral.numero}</Button>
          </Popconfirm>
        ),
        valorInicial: <MovimentoValorInput
          movimento={{ ...movimento, key }}
          onChange={this.handleChange}
          value={R$(notaInicial.valor.total)}
          name="valorInicial"
        />,
        valorFinal: <MovimentoValorInput
          movimento={{ ...movimento, key }}
          onChange={this.handleChange}
          value={R$(notaFinal.valor.total)}
          name="valorFinal"
        />,
        tipoMovimento: retornarTipo(notaFinal.geral.cfop),
        lucro: <MovimentoValorInput
          movimento={{ ...movimento, key }}
          onChange={this.handleChange}
          value={R$(movimento.valores.lucro)}
          name="lucro"
        />,
        baseIcms: <MovimentoValorInput
          movimento={{ ...movimento, key }}
          onChange={this.handleChange}
          value={R$(movimento.valores.impostos.icms.baseDeCalculo)}
          name="baseIcms"
        />,
        icms: <MovimentoValorInput
          movimento={{ ...movimento, key }}
          onChange={this.handleChange}
          value={R$(movimento.valores.impostos.icms.proprio)}
          name="icms"
        />,
        difalOrigem: movimento.valores.impostos.icms.difal ? <MovimentoValorInput
          movimento={{ ...movimento, key }}
          onChange={this.handleChange}
          value={R$(movimento.valores.impostos.icms.difal.origem)}
          name="difalOrigem"
        /> : '0,00',
        difalDestino: movimento.valores.impostos.icms.difal ? <MovimentoValorInput
          movimento={{ ...movimento, key }}
          onChange={this.handleChange}
          value={R$(movimento.valores.impostos.icms.difal.destino)}
          name="difalDestino"
        /> : '0,00',
        pis: <MovimentoValorInput
          movimento={{ ...movimento, key }}
          onChange={this.handleChange}
          value={R$(movimento.valores.impostos.pis)}
          name="pis"
        />,
        cofins: <MovimentoValorInput
          movimento={{ ...movimento, key }}
          onChange={this.handleChange}
          value={R$(movimento.valores.impostos.cofins)}
          name="cofins"
        />,
        csll: <MovimentoValorInput
          movimento={{ ...movimento, key }}
          onChange={this.handleChange}
          value={R$(movimento.valores.impostos.csll)}
          name="csll"
        />,
        irpj: <MovimentoValorInput
          movimento={{ ...movimento, key }}
          onChange={this.handleChange}
          value={R$(movimento.valores.impostos.irpj)}
          name="irpj"
        />,
        total: R$(movimento.valores.impostos.total),
      });
    });

    return (
      <Row
        type="flex"
        justify="center"
      >
        <Col span={23}>
          <Table
            bordered
            size="small"
            columns={MovimentosTable.columns}
            dataSource={dataSource}
            scroll={{ x: '250%' }}
            pagination={{ position: 'top' }}
        />
        </Col>
      </Row>
    );
  }
}

export default MovimentosTable;
