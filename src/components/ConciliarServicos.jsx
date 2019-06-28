import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Table, Row, Col, Icon, Checkbox } from 'antd';

import { api, R$ } from '../services';

class ConciliarServicos extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    onLoadEnd: PropTypes.func.isRequired,
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
    servicosWithIndex: [],
  }

  async componentWillMount() {
    const { dados } = this.props;
    const { nfse } = dados;
    let { servicosWithIndex } = this.state;

    if (nfse.length === 0) {
      this.props.onChange(servicosWithIndex);
      this.props.onLoadEnd();
      this.setState({ servicosWithIndex, isLoading: false, dados });
    }

    servicosWithIndex = await Promise.all(nfse.map(async ({ notaServico }, index) => {
      try {
        const { data: servico } = await axios.get(`${api}/servicos/calcular`, {
          params: {
            notaServicoChave: notaServico.chave,
          },
        });
        return {
          ...servico,
          index,
        };
      } catch (err) {
        throw err;
      }
    }));

    this.props.onChange(servicosWithIndex);
    this.props.onLoadEnd();
    this.setState({ servicosWithIndex, isLoading: false, dados });
  }

  getNfse = chave => (
    this.state.dados.nfse ?
      this.state.dados.nfse.find(el => el.notaServico.chave === chave) :
      this.props.dados.nfse.find(el => el.notaServico.chave === chave)
  )

  alterarServico = (servico) => {
    const { servicosWithIndex } = this.state;
    const servicosNovo = servicosWithIndex.map((el) => {
      if (el.index === servico.index) {
        return servico;
      }
      return el;
    });
    this.props.onChange(servicosNovo);
    this.setState({ servicosWithIndex: servicosNovo });
  }

  render() {
    const dataSource = [];

    const { servicosWithIndex } = this.state;

    servicosWithIndex.forEach((servicoPoolWithIndex, id) => {
      const { servico } = servicoPoolWithIndex;
      const { notaServico } = this.getNfse(servico.notaChave);
      dataSource.push({
        key: `servico-${id}-${notaServico.emitenteCpfcnpj}`,
        numero: id + 1,
        nota: notaServico.numero,
        status: notaServico.status,
        valor: R$(notaServico.valor),
        confirmar: <Checkbox
          checked={servico.conferido}
          onChange={(e) => {
            const servicoPWINovo = {
              ...servicoPoolWithIndex,
            };
            servicoPWINovo.servico.conferido = e.target.checked;
            this.alterarServico(servicoPWINovo);
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
