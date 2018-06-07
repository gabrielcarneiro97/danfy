import React from 'react';
import PropTypes from 'prop-types';
import { Table, Row, Col, Button, Popconfirm } from 'antd';

import { MovimentoValorInput } from '.';
import { R$, retornarTipo, somaTotalMovimento, cancelarMovimento, floating, editarMovimento, auth } from '../services';

class MovimentosTable extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    notas: PropTypes.object.isRequired, // eslint-disable-line
    movimentos: PropTypes.object.isRequired, // eslint-disable-line
  }

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
    defaultSortOrder: 'ascend',
    sorter: (a, b) => {
      if (!a.numero.numero) {
        return 1;
      } else if (!b.numero.numero) {
        return -1;
      }
      if (a.numero.numero > b.numero.numero) {
        return 1;
      }
      return -1;
    },
    render: (data) => {
      if (data.$$typeof) {
        return data;
      }

      return (
        <Popconfirm
          title="Deseja mesmo excluir esse movimento?"
          okText="Sim"
          cancelText="Não"
          onConfirm={() => data.cancelarMovimento(data.key, data.emitente)}
        >
          <Button
            type="ghost"
          >
            {data.numero}
          </Button>
        </Popconfirm>
      );
    },
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

  state = {
    movimentosAlterados: {},
  }

  handleChange = (valor, nome, movimento) => {
    const movimentoNovo = {
      ...movimento,
      ...this.state.movimentosAlterados[movimento.key],
    };

    if (this.state.movimentosAlterados[movimento.key]) {
      if (!this.state.movimentosAlterados[movimento.key].mudou.includes(nome)) {
        movimentoNovo.mudou = this.state.movimentosAlterados[movimento.key].mudou.concat(nome);
      }
    } else {
      movimentoNovo.mudou = [nome];
    }

    if (nome === 'icms') {
      movimentoNovo.valores.impostos.icms.proprio = floating(valor);
    } else if (nome === 'baseIcms') {
      movimentoNovo.valores.impostos.icms.baseDeCalculo = floating(valor);
    } else if (nome === 'difalDestino' || nome === 'difalOrigem') {
      if (!movimentoNovo.valores.impostos.icms.difal) {
        movimentoNovo.valores.impostos.icms.difal = {
          origem: 0,
          destino: 0,
        };
      }
      if (nome === 'difalDestino') {
        movimentoNovo.valores.impostos.icms.difal.destino = floating(valor);
      } else {
        movimentoNovo.valores.impostos.icms.difal.origem = floating(valor);
      }
    } else if (nome === 'lucro') {
      movimentoNovo.valores.lucro = floating(valor);
    } else {
      movimentoNovo.valores.impostos[nome] = floating(valor);
    }

    const { impostos } = movimentoNovo.valores;

    movimentoNovo.valores.impostos.total =
      parseFloat(impostos.pis) +
      parseFloat(impostos.cofins) +
      parseFloat(impostos.irpj) +
      parseFloat(impostos.csll) +
      parseFloat(impostos.icms.proprio);

    if (movimentoNovo.valores.impostos.icms.difal) {
      impostos.total +=
        parseFloat(impostos.icms.difal.origem) +
        parseFloat(impostos.icms.difal.destino);
    }

    this.setState({
      movimentosAlterados: {
        ...this.state.movimentosAlterados,
        [movimento.key]: {
          ...movimentoNovo,
        },
      },
    });
  }

  cancelarMovimento = (movimentoId, cnpj) => {
    cancelarMovimento(cnpj, movimentoId).then(() => {
      const { movimentos } = this.props;
      delete movimentos[movimentoId];

      this.props.onChange(movimentos);
    });
  }

  editarMovimento = (key) => {
    const movimentoEditado = this.state.movimentosAlterados[key];
    delete movimentoEditado.mudou;
    delete movimentoEditado.key;

    movimentoEditado.metaDados = {
      criadoPor: auth.currentUser.email,
      dataCriacao: new Date().toISOString(),
      tipo: 'SUB',
      status: 'ATIVO',
      movimentoRef: key,
    };

    editarMovimento(movimentoEditado, this.props.notas[movimentoEditado.notaFinal].emitente)
      .then((keyNovo) => {
        const { movimentos } = this.props;
        delete movimentos[key];
        movimentos[keyNovo] = movimentoEditado;
        this.props.onChange(movimentos);
      });
  }

  defineDataSource = () => {
    const { movimentos, notas } = this.props;
    const dataSource = [];
    let totais;
    Object.keys(movimentos).forEach((key) => {
      const movimento = movimentos[key];
      const notaFinal = notas[movimento.notaFinal];
      const notaInicial = notas[movimento.notaInicial];

      const valores = {
        key,
        numero: notaFinal.geral.numero,
        valorInicial: R$(notaInicial.valor.total),
        valorFinal: R$(notaFinal.valor.total),
        tipoMovimento: retornarTipo(notaFinal.geral.cfop),
        lucro: R$(movimento.valores.lucro),
        baseIcms: R$(movimento.valores.impostos.icms.baseDeCalculo),
        icms: R$(movimento.valores.impostos.icms.proprio),
        difalOrigem: movimento.valores.impostos.icms.difal ?
          R$(movimento.valores.impostos.icms.difal.origem) :
          '0,00',
        difalDestino: movimento.valores.impostos.icms.difal ?
          R$(movimento.valores.impostos.icms.difal.destino) :
          '0,00',
        pis: R$(movimento.valores.impostos.pis),
        cofins: R$(movimento.valores.impostos.cofins),
        csll: R$(movimento.valores.impostos.csll),
        irpj: R$(movimento.valores.impostos.irpj),
        total: R$(movimento.valores.impostos.total),
      };

      totais = somaTotalMovimento(valores, totais);

      dataSource.push({
        key,
        editar: (
          <Popconfirm
            title="Deseja mesmo editar esse movimento?"
            okText="Sim"
            cancelText="Não"
            onConfirm={() => this.editarMovimento(key)}
          >
            <Button
              type="ghost"
              disabled={!Object.keys(this.state.movimentosAlterados).includes(key)}
              icon="edit"
            />
          </Popconfirm>
        ),
        numero: {
          key,
          numero: notaFinal.geral.numero,
          emitente: notaFinal.emitente,
          cancelarMovimento: this.cancelarMovimento,
        },
        valorInicial: R$(notaInicial.valor.total),
        valorFinal: R$(notaFinal.valor.total),
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
        difalOrigem: movimento.valores.impostos.icms.difal ?
          <MovimentoValorInput
            movimento={{ ...movimento, key }}
            onChange={this.handleChange}
            value={R$(movimento.valores.impostos.icms.difal.origem)}
            name="difalOrigem"
          /> :
          <MovimentoValorInput
            movimento={{ ...movimento, key }}
            onChange={this.handleChange}
            value="0,00"
            name="difalOrigem"
          />,
        difalDestino: movimento.valores.impostos.icms.difal ?
          <MovimentoValorInput
            movimento={{ ...movimento, key }}
            onChange={this.handleChange}
            value={R$(movimento.valores.impostos.icms.difal.destino)}
            name="difalDestino"
          /> :
          <MovimentoValorInput
            movimento={{ ...movimento, key }}
            onChange={this.handleChange}
            value="0,00"
            name="difalDestino"
          />,
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
            columns={MovimentosTable.columns}
            dataSource={dataSource}
            scroll={{ x: '250%' }}
            style={{
              marginBottom: '20px',
            }}
            pagination={{ position: 'top' }}
          />
        </Col>
      </Row>
    );
  }
}

export default MovimentosTable;
