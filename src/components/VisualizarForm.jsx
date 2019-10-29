import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Row, Col, Icon, DatePicker } from 'antd';

import { pegarDominio, pegarPessoaId, pegarEmpresaImpostos, cnpjMask } from '../services';

import './VisualizarForm.css';

const { MonthPicker } = DatePicker;

class VisualizarForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    printer: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  }
  state = {
    num: '',
    mes: '',
    ano: '',
    submit: false,
    submitText: 'Selecionar',
    disableNum: true,
    pessoa: {
      numeroSistema: '',
      nome: '',
      formaPagamento: '',
      cnpj: '',
      simples: false,
    },
    dominio: [],
  }
  async componentDidMount() {
    const dominio = await pegarDominio();
    this.setState({ dominio, disableNum: false });
  }

  handleSubmit = () => {
    this.setState({
      submit: false,
      submitText: <Icon type="loading" theme="outlined" />,
    }, () => {
      this.props.onSubmit({
        cnpj: this.state.pessoa.cnpj,
        mes: this.state.mes,
        ano: this.state.ano,
        nome: this.state.pessoa.nome,
        formaPagamento: this.state.pessoa.formaPagamento,
        numeroSistema: this.state.num,
      }).then(() => this.setState({ submit: true, submitText: 'Selecionar' }));
    });
  }

  handleData = (e, mesAno) => {
    console.log(mesAno);
    if (!mesAno) this.setState({ ano: '', mes: '' }, this.checkSubmit);
    else {
      const [mes, ano] = mesAno.split('-');
      this.setState({ ano, mes: parseInt(mes, 10).toString() }, () => {
        console.log(this.state.mes, this.state.ano);
        this.checkSubmit();
      });
    }
  };

  handleMes = mes => this.setState({ mes }, () => this.checkSubmit());

  handleAno = ano => this.setState({ ano }, () => this.checkSubmit());

  checkSubmit = () => {
    if (this.state.mes && this.state.ano && this.state.pessoa.cnpj) {
      this.setState({ submit: true });
    } else {
      this.setState({ submit: false });
    }
  }

  handleNum = async (e) => {
    const { dominio } = this.state;
    const num = e.target.value;
    const empresa = dominio.find(o => o.numero === num);
    if (empresa) {
      const { cnpj } = empresa;
      try {
        const [pessoaPg, aliquota] = await Promise.all([
          pegarPessoaId(cnpj), pegarEmpresaImpostos(cnpj),
        ]);

        const pessoa = {
          nome: pessoaPg.nome,
          simples: aliquota.tributacao === 'SN',
          cnpj,
          numeroSistema: num,
        };

        if (aliquota.formaPagamento === 'adiantamento') {
          pessoa.formaPagamento = 'PAGAMENTO ANTECIPADO';
        } else if (aliquota.formaPagamento === 'cotas') {
          pessoa.formaPagamento = 'PAGAMENTO EM COTAS';
        } else if (aliquota.formaPagamento === 'acumulado') {
          pessoa.formaPagamento = 'PAGAMENTO ACUMULADO NO FINAL DO TRIMESTRE';
        }

        this.setState({ pessoa, num }, () => this.checkSubmit());
      } catch (err) {
        this.setState({
          pessoa: {
            numeroSistema: '',
            nome: '',
            formaPagamento: '',
            cnpj: '',
            simples: false,
          },
        }, () => this.checkSubmit());
        console.error(err);
      }
    } else {
      this.setState({
        pessoa: {
          numeroSistema: '',
          nome: '',
          formaPagamento: '',
          cnpj: '',
          simples: false,
        },
      }, () => this.checkSubmit());

      this.setState({ num });
    }
  }
  render() {
    return (
      <Fragment>
        <Row
          gutter={10}
          justify="center"
          type="flex"
        >
          <Col span={4} className="form-input">
            <Input
              addonBefore="Número"
              onChange={this.handleNum}
              value={this.state.num}
              disabled={this.state.disableNum}
            />
          </Col>
          <Col span={4} className="form-input">
            <MonthPicker onChange={this.handleData} placeholder="Selecione o Mês" format="MM-YYYY" />
          </Col>
          <Col span={16} className="form-input">
            <Input addonBefore="Nome" value={this.state.pessoa.nome} disabled />
          </Col>
          <Col span={8} className="form-input">
            <Input addonBefore="CNPJ" value={cnpjMask(this.state.pessoa.cnpj)} disabled />
          </Col>
          <Col span={16} className="form-input">
            <Input addonBefore="Forma de Pagamento Trimestrais" value={this.state.pessoa.formaPagamento} disabled />
          </Col>
        </Row>
        <Row
          type="flex"
          justify="end"
          gutter={16}
        >
          <Col
            className="form-input"
          >
            {this.props.printer}
          </Col>
          <Col
            className="form-input"
          >
            <Button type="primary" onClick={this.handleSubmit} disabled={!this.state.submit}>{this.state.submitText}</Button>
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default VisualizarForm;
