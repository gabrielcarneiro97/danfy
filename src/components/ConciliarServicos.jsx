import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Table, Row, Col, Icon, Checkbox } from 'antd';

import { api, pegarDominioId, auth } from '../services';

class ConciliarServicos extends Component {
  static propTypes = {
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
    title: 'Nota',
    dataIndex: 'nota',
    key: 'nota',
  }, {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  }, {
    title: 'Valor',
    dataIndex: 'valor',
    key: 'valor',
  }, {
    title: 'Confirmar',
    dataIndex: 'confirmar',
    key: 'confirmar',
    align: 'center',
  }]

  state = {
    isLoading: true,
    dados: {},
    servicos: [],
  }

  componentDidMount() {
    const { dados } = this.props;
    const { nfse } = dados;
    const { servicos } = this.state;
    const dominioCnpjs = Object.values(this.props.dominio());

    pegarDominioId().then((dominioId) => {
      if (nfse.length === 0) {
        this.props.onChange(servicos);
        this.props.onLoadEnd();
        this.setState({ servicos, isLoading: false, dados });
      }

      nfse.forEach((nota, id) => {
        if (dominioCnpjs.includes(nota.emitente)) {
          axios.get(`${api}/servicos/calcular`, {
            params: {
              notaServico: nota.chave,
              dominioId,
              email: auth.currentUser.email,
            },
          }).then((res) => {
            const servico = res.data;
            servicos.push({
              ...servico,
              id,
            });

            if (servicos.length === nfse.length) {
              this.props.onChange(servicos);
              this.props.onLoadEnd();
              this.setState({ servicos, isLoading: false, dados });
            }
          });
        }
      });
    });
  }

  getNfse = chave => (
    this.state.dados.nfse ?
      this.state.dados.nfse.find(el => el.chave === chave) :
      this.props.dados.nfse.find(el => el.chave === chave)
  )

  alterarServico = (servico) => {
    const { servicos } = this.state;
    const servicosNovo = [];

    servicos.forEach((el) => {
      if (el.id === servico.id) {
        servicosNovo.push(servico);
      } else {
        servicosNovo.push(el);
      }
    });
    this.props.onChange(servicosNovo);
    this.setState({ servicos: servicosNovo });
  }

  render() {
    const dataSource = [];

    const { servicos } = this.state;

    servicos.forEach((servico, id) => {
      const nota = this.getNfse(servico.nota);
      dataSource.push({
        key: `servico-${id}-${nota.emitente}`,
        numero: id + 1,
        nota: nota.geral.numero,
        status: nota.geral.status,
        valor: nota.valor.servico,
        confirmar: <Checkbox
          checked={servico.conferido}
          onChange={(e) => {
            const servicoNovo = {
              ...servico,
              conferido: e.target.checked,
            };
            this.alterarServico(servicoNovo);
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
            <Table dataSource={dataSource} columns={ConciliarServicos.columns} />
          }
        </Col>
      </Row>
    );
  }
}

export default ConciliarServicos;
