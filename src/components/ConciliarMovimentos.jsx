import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Icon, Col, Row, Table, Checkbox } from 'antd';

import { NotaInicial } from '.';
import { auth, pegarDominioId, api } from '../services';

function eSaida(nota) {
  return nota.tipo === '1' || nota.cfop === '1113' || nota.cfop === '1202' || nota.cfop === '2202';
}

function cancelada(nota) {
  return nota.status === 'CANCELADA';
}

function interestadual(notaPool) {
  return notaPool.nota.estadoDestinoId === notaPool.nota.estadoGeradorId ?
    'INTERNO' :
    `INTERESTADUAL ${notaPool.nota.estadoGeradorId} -> ${notaPool.nota.estadoDestinoId}`;
}

class ConciliarMovimentos extends Component {
  static propTypes = {
    novaNota: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onLoadEnd: PropTypes.func.isRequired,
    dominio: PropTypes.func.isRequired,
    dados: PropTypes.shape({
      nfe: PropTypes.array,
      nfse: PropTypes.array,
      pessoas: PropTypes.array,
    }).isRequired,
  }

  static columns = [{
    title: 'Número',
    dataIndex: 'numero',
    key: 'numero',
  }, {
    title: 'Nota Inicial',
    dataIndex: 'notaInicial',
    key: 'notaInicial',
  }, {
    title: 'Nota Final',
    dataIndex: 'notaFinal',
    key: 'notaFinal',
    defaultSortOrder: 'ascend',
    sorter: (a, b) => {
      if (!a.notaFinal) {
        return 1;
      } else if (!b.notaFinal) {
        return -1;
      }
      if (a.notaFinal > b.notaFinal) {
        return 1;
      }
      return -1;
    },
  }, {
    title: 'Base Impostos',
    dataIndex: 'baseImpostos',
    key: 'baseImpostos',
  }, {
    title: 'Tipo Operação',
    dataIndex: 'tipoOperacao',
    key: 'tipoOperacao',
  }, {
    title: 'Confirmar',
    dataIndex: 'confirmar',
    key: 'confirmar',
    align: 'center',
  }];

  state = {
    isLoading: true,
    dados: {},
    movimentosWithIndex: [],
  }

  async componentDidMount() {
    const { dados } = this.props;
    const dominioCnpjs = this.props.dominio().map(o => o.cnpj);

    const notasFinaisChave = [];

    dados.nfe.forEach(({ nota }) => {
      if (eSaida(nota) && !cancelada(nota) && dominioCnpjs.includes(nota.emitenteCpfcnpj)) {
        notasFinaisChave.push(nota.chave);
      }
    });

    try {
      const dominioCodigo = await pegarDominioId();
      const { email } = auth.currentUser;

      const usuario = {
        dominioCodigo,
        email,
      };

      const { data } = await axios.post(`${api}/movimentos/calcular`, { notasFinaisChave, usuario });
      const { movimentos, notasIniciais } = data;
      dados.nfe = dados.nfe.concat(notasIniciais);

      const movimentosWithIndex = movimentos.map((el, index) => ({ ...el, index }));

      this.props.onChange(movimentos);
      this.props.onLoadEnd();
      this.setState({ isLoading: false, dados, movimentosWithIndex });
    } catch (err) {
      console.error(err);
    }
  }

  getNfe = chave => (
    this.state.dados.nfe ?
      this.state.dados.nfe.find(el => el.nota.chave === chave) :
      this.props.dados.nfe.find(el => el.nota.chave === chave)
  )

  alterarMovimento = (movimentoPoolWithIndex, notaPool) => {
    const { movimentosWithIndex } = this.state;
    const movimentosWithIndexNovo = [];

    movimentosWithIndex.forEach((el) => {
      if (el.index === movimentoPoolWithIndex.index) {
        movimentosWithIndexNovo.push(movimentoPoolWithIndex);
      } else {
        movimentosWithIndexNovo.push(el);
      }
    });
    if (notaPool) {
      this.props.novaNota(notaPool);
      const { dados } = this.state;
      dados.nfe.push(notaPool);
      this.setState({ dados, movimentosWithIndex: movimentosWithIndexNovo });
    } else {
      this.setState({ movimentosWithIndex: movimentosWithIndexNovo });
    }
    this.props.onChange(movimentosWithIndexNovo);
  }

  render() {
    const dataSource = [];

    const { movimentosWithIndex } = this.state;

    movimentosWithIndex.forEach((movimentoPoolWithIndex) => {
      const { movimento } = movimentoPoolWithIndex;
      const notaFinalPool = this.getNfe(movimento.notaFinalChave);
      const tipoOperacao = interestadual(notaFinalPool);
      const notaFinal = notaFinalPool.nota;

      const notaInicial = movimento.notaInicialChave ?
        this.getNfe(movimento.notaInicialChave).nota :
        null;

      dataSource.push({
        key: `${movimentoPoolWithIndex.index}-${notaFinal.numero}`,
        numero: movimentoPoolWithIndex.index + 1,
        notaInicial: <NotaInicial
          movimentoPoolWithIndex={movimentoPoolWithIndex}
          notaFinal={notaFinal}
          notaInicial={notaInicial}
          onChange={this.alterarMovimento}
        />,
        notaFinal: notaFinal.numero,
        baseImpostos: movimento.lucro,
        tipoOperacao,
        confirmar: <Checkbox
          checked={movimento.conferido}
          onChange={(e) => {
            const movimentoPWINovo = {
              ...movimentoPoolWithIndex,
            };
            movimentoPWINovo.movimento.conferido = e.target.checked;
            this.alterarMovimento(movimentoPWINovo);
          }}
        />,
      });
    });

    return (
      <Row
        type="flex"
        justify="center"
        align="top"
      >
        <Col span={23} style={{ textAlign: 'center' }}>
          {
            this.state.isLoading
            &&
            <Icon type="loading" style={{ fontSize: '90px', color: '#1890ff' }} />
        }
          {
            !this.state.isLoading
            &&
            <div>
              <Table dataSource={dataSource} columns={ConciliarMovimentos.columns} />
            </div>
          }
        </Col>
      </Row>
    );
  }
}

export default ConciliarMovimentos;
