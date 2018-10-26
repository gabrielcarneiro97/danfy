import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Row, Col, Select } from 'antd';

import { pegarDominio, pegarPessoaId, pegarEmpresaImpostos, cnpjMask, teste } from '../services';

import './VisualizarForm.css';

const { Option } = Select;

class VisualizarForm extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
  }
  state = {
    num: '',
    mes: '',
    ano: '',
    submit: false,
    disableNum: true,
    pessoa: {
      nome: '',
      formaPagamento: '',
      cnpj: '',
      simples: false,
    },
    dominio: {},
  }
  componentDidMount() {
    pegarDominio().then(dominio => this.setState({ dominio, disableNum: false }));
    teste('02071955000165').then(a => console.log(a));
  }

  handleSubmit = () => {
    this.props.onSubmit({
      cnpj: this.state.pessoa.cnpj,
      mes: this.state.mes,
      ano: this.state.ano,
      nome: this.state.pessoa.nome,
      formaPagamento: this.state.pessoa.formaPagamento,
    });
  }

  handleMes = mes => this.setState({ mes }, () => this.checkSubmit());

  handleAno = ano => this.setState({ ano }, () => this.checkSubmit());

  checkSubmit = () => {
    if (this.state.mes && this.state.ano && this.state.pessoa.cnpj) {
      this.setState({ submit: true });
    } else {
      this.setState({ submit: false });
    }
  }

  handleNum = (e) => {
    const { empresas } = this.state.dominio;
    const num = e.target.value;
    const cnpj = empresas[num];

    if (cnpj) {
      pegarPessoaId(cnpj).then((empresa) => {
        pegarEmpresaImpostos(cnpj).then((impostos) => {
          const pessoa = {
            nome: empresa.nome,
            simples: impostos.tributacao === 'SN',
            cnpj,
          };

          if (impostos.formaPagamentoTrimestrais === 'adiantamento') {
            pessoa.formaPagamento = 'PAGAMENTO ANTECIPADO';
          } else if (impostos.formaPagamentoTrimestrais === 'cotas') {
            pessoa.formaPagamento = 'PAGAMENTO EM COTAS';
          } else if (impostos.formaPagamentoTrimestrais === 'acumulado') {
            pessoa.formaPagamento = 'PAGAMENTO ACUMULADO NO FINAL DO TRIMESTRE';
          }

          this.setState({ pessoa }, () => this.checkSubmit());
        }).catch(err => console.error(err));
      }).catch(err => console.error(err));
    } else {
      this.setState({
        pessoa: {
          nome: '',
          formaPagamento: '',
          cnpj: '',
          simples: false,
        },
      }, () => this.checkSubmit());
    }

    this.setState({ num: e.target.value });
  }
  render() {
    return (
      <Row
        gutter={10}
        justify="center"
        type="flex"
      >
        <Col span={8} className="form-input">
          <Input
            addonBefore="Número"
            onChange={this.handleNum}
            value={this.state.num}
            disabled={this.state.disableNum}
          />
        </Col>
        <Col span={8} className="form-input">
          <Select
            placeholder="Mês"
            style={{ width: '100%' }}
            onChange={this.handleMes}
          >
            <Option value="1">Janeiro</Option>
            <Option value="2">Fevereiro</Option>
            <Option value="3">Março</Option>
            <Option value="4">Abril</Option>
            <Option value="5">Maio</Option>
            <Option value="6">Junho</Option>
            <Option value="7">Julho</Option>
            <Option value="8">Agosto</Option>
            <Option value="9">Setembro</Option>
            <Option value="10">Outubro</Option>
            <Option value="11">Novembro</Option>
            <Option value="12">Dezembro</Option>
          </Select>
        </Col>
        <Col span={8} className="form-input">
          <Select
            placeholder="Ano"
            style={{ width: '100%' }}
            onChange={this.handleAno}
          >
            <Option value="2017">2017</Option>
            <Option value="2018">2018</Option>
            <Option value="2019">2019</Option>
          </Select>
        </Col>
        <Col span={15} className="form-input">
          <Input addonBefore="Nome" value={this.state.pessoa.nome} disabled />
        </Col>
        <Col span={9} className="form-input">
          <Input addonBefore="CNPJ" value={cnpjMask(this.state.pessoa.cnpj)} disabled />
        </Col>
        <Col span={24} className="form-input">
          <Input addonBefore="Forma de Pagamento Trimestrais" value={this.state.pessoa.formaPagamento} disabled />
        </Col>
        <Col
          span={24}
          className="form-input"
          style={{ textAlign: 'right' }}
        >
          <Button type="primary" onClick={this.handleSubmit} disabled={!this.state.submit}>Selecionar</Button>
        </Col>
      </Row>
    );
  }
}

export default VisualizarForm;
