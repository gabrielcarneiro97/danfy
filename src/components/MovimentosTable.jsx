import React from 'react';
import PropTypes from 'prop-types';
import { Table, Row, Col, Button, Popconfirm } from 'antd';

import { MovimentoValorInput } from '.';
import { R$, retornarTipo, somaTotalMovimento, cancelarMovimento, floating, editarMovimento, auth } from '../services';

class MovimentosTable extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    notas: PropTypes.object, // eslint-disable-line
    movimentos: PropTypes.array, // eslint-disable-line
  }

  static defaultProps = {
    notas: {},
    movimentos: [],
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
    width: '6.67%',
  }, {
    title: 'Valor Nota Final',
    dataIndex: 'valorFinal',
    key: 'valorFinal',
    width: '6.67%',
  }, {
    title: 'Tipo de Movimento',
    dataIndex: 'tipoMovimento',
    key: 'tipoMovimento',
    width: '10%',
  }, {
    title: 'Lucro',
    dataIndex: 'lucro',
    key: 'lucro',
    width: '6.67%',
  }, {
    title: 'Base ICMS',
    dataIndex: 'baseIcms',
    key: 'baseIcms',
    width: '6.67%',
  }, {
    title: 'ICMS',
    dataIndex: 'icms',
    key: 'icms',
    width: '6.67%',
  }, {
    title: 'DIFAL',
    children: [{
      title: 'Originário',
      dataIndex: 'difalOrigem',
      key: 'difalOrigem',
      width: '6.67%',
    }, {
      title: 'Destinatário (GNRE)',
      dataIndex: 'difalDestino',
      key: 'difalDestino',
      width: '6.67%',
    }],
  }, {
    title: 'PIS',
    dataIndex: 'pis',
    key: 'pis',
    width: '6.67%',
  }, {
    title: 'COFINS',
    dataIndex: 'cofins',
    key: 'cofins',
    width: '6.67%',
  }, {
    title: 'CSLL',
    dataIndex: 'csll',
    key: 'csll',
    width: '6.67%',
  }, {
    title: 'IRPJ',
    dataIndex: 'irpj',
    key: 'irpj',
    width: '6.67%',
  }, {
    title: 'TOTAL',
    dataIndex: 'total',
    key: 'total',
    width: '6.67%',
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
    cancelarMovimento(cnpj, movimentoId).then((dados) => {
      this.props.onChange(dados);
    });
  }

  editarMovimento = (key) => {
    const movimentoEditado = { ...this.state.movimentosAlterados[key] };
    delete movimentoEditado._id;
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
      .then((dados) => {
        this.props.onChange(dados);
      });
  }

  defineDataSource = () => {
    const { movimentos, notas } = this.props;
    const dataSource = [];
    let totais;
    movimentos.forEach((movimento) => {
      const notaFinal = notas[movimento.notaFinal];
      const notaInicial = notas[movimento.notaInicial];

      const key = movimento._id;

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
            scroll={{ x: '150%' }}
            style={{
              marginBottom: '20px',
            }}
            pagination={{ position: 'top', simple: true }}
          />
        </Col>
      </Row>
    );
  }
}

export default MovimentosTable;
