import React from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Icon, Col, Row, Table, Checkbox } from 'antd';

import { NotaInicial } from '.';
import { auth, pegarDominioId, api } from '../services';

class ConciliarMovimentos extends React.Component {
  static propTypes = {
    novaNota: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onLoadEnd: PropTypes.func.isRequired,
    dominio: PropTypes.func.isRequired,
    dados: PropTypes.shape({
      nfe: PropTypes.array,
      nfse: PropTypes.array,
      pessoas: PropTypes.object,
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
    movimentos: [],
  }

  componentDidMount() {
    const { dados } = this.props;
    const dominioCnpjs = Object.values(this.props.dominio());

    const notasFinais = [];

    dados.nfe.forEach((nota) => {
      if ((nota.geral.tipo === '1' || nota.geral.cfop === '1113' || nota.geral.cfop === '1202' || nota.geral.cfop === '2202') && dominioCnpjs.includes(nota.emitente) && nota.geral.status !== 'CANCELADA') {
        notasFinais.push(nota.chave);
      }
    });

    pegarDominioId().then((dominioId) => {
      const { email } = auth.currentUser;

      const usuario = {
        dominioId,
        email,
      };

      axios.post(`${api}/movimentos`, { notasFinais, usuario })
        .then((res) => {
          const { movimentos, notasIniciais } = res.data;
          dados.nfe = dados.nfe.concat(notasIniciais);

          const movimentosId = [];

          movimentos.forEach((el, id) => movimentosId.push({ ...el, id }));
          this.props.onChange(movimentos);
          this.props.onLoadEnd();
          this.setState({ isLoading: false, dados, movimentos: movimentosId });
        });
    });
  }

  getNfe = chave => (
    this.state.dados.nfe ?
      this.state.dados.nfe.find(el => el.chave === chave) :
      this.props.dados.nfe.find(el => el.chave === chave)
  )

  alterarMovimento = (movimento, nota) => {
    const { movimentos } = this.state;
    const movimentosNovo = [];

    movimentos.forEach((el) => {
      if (el.id === movimento.id) {
        movimentosNovo.push(movimento);
      } else {
        movimentosNovo.push(el);
      }
    });
    this.props.onChange(movimentosNovo);
    this.setState({ movimentos: movimentosNovo });

    if (nota) {
      this.props.novaNota(nota);
      const { dados } = this.state;
      dados.nfe.push(nota);
      this.setState({ dados });
    }
  }

  render() {
    const dataSource = [];

    const { movimentos } = this.state;

    movimentos.forEach((movimento) => {
      const notaFinal = this.getNfe(movimento.notaFinal);
      const tipoOperacao =
        notaFinal.informacoesEstaduais.estadoDestino
        === notaFinal.informacoesEstaduais.estadoGerador ?
          'INTERNO' :
          `INTERESTADUAL ${notaFinal.informacoesEstaduais.estadoGerador} -> ${notaFinal.informacoesEstaduais.estadoDestino}`;

      const notaInicial = movimento.notaInicial ? this.getNfe(movimento.notaInicial) : null;

      dataSource.push({
        key: `${movimento.id}-${notaFinal.geral.numero}`,
        numero: movimento.id + 1,
        notaInicial: <NotaInicial
          movimento={movimento}
          notaFinal={notaFinal}
          notaInicial={notaInicial}
          onChange={this.alterarMovimento}
        />,
        notaFinal: notaFinal.geral.numero,
        baseImpostos: movimento.valores.lucro,
        tipoOperacao,
        confirmar: <Checkbox
          checked={movimento.conferido}
          onChange={(e) => {
            const movimentoNovo = {
              ...movimento,
              conferido: e.target.checked,
            };
            this.alterarMovimento(movimentoNovo);
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
