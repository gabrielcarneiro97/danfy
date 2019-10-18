import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Input, Button, Row, Col, DatePicker } from 'antd';

import { pegarDominio, pegarPessoaId, cnpjMask } from '../services';

import './VisualizarForm.css';

class VisualizarForm extends Component {
  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    printer: PropTypes.oneOfType([PropTypes.object, PropTypes.string]).isRequired,
  }
  state = {
    num: '',
    diaMesAno: '',
    submit: false,
    submitLoading: false,
    update: false,
    updateLoading: false,
    disableNum: true,
    pessoa: {
      numeroSistema: '',
      nome: '',
      cnpj: '',
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
      update: false,
      submitLoading: true,
    }, () => {
      this.props.onSubmit({
        cnpj: this.state.pessoa.cnpj,
        diaMesAno: this.state.diaMesAno,
        nome: this.state.pessoa.nome,
        numeroSistema: this.state.num,
      }).then(() => this.setState({ submit: true, update: true, submitLoading: false }));
    });
  }

  handleUpdate = () => {
    this.setState({
      update: false,
      submit: false,
      updateLoading: true,
    }, () => {
      this.props.onUpdate({
        cnpj: this.state.pessoa.cnpj,
        diaMesAno: this.state.diaMesAno,
        nome: this.state.pessoa.nome,
        numeroSistema: this.state.num,
      }).then(() => this.setState({ update: true, submit: true, updateLoading: false }));
    });
  }

  handleData = (e, diaMesAno) => this.setState({ diaMesAno }, this.checkSubmit);

  checkSubmit = () => {
    if (this.state.diaMesAno && this.state.pessoa.cnpj) {
      this.setState({ submit: true, update: true });
    } else {
      this.setState({ submit: false, update: false });
    }
  }

  handleNum = async (e) => {
    const { dominio } = this.state;
    const num = e.target.value;
    const empresa = dominio.find(o => o.numero === num);
    if (empresa) {
      const { cnpj } = empresa;
      try {
        const pessoaPg = await pegarPessoaId(cnpj);

        const pessoa = {
          nome: pessoaPg.nome,
          cnpj,
          numeroSistema: num,
        };

        this.setState({ pessoa, num }, () => this.checkSubmit);
      } catch (err) {
        this.setState({
          pessoa: {
            numeroSistema: '',
            nome: '',
            cnpj: '',
            simples: false,
          },
        }, this.checkSubmit);
        console.error(err);
      }
    } else {
      this.setState({
        pessoa: {
          numeroSistema: '',
          nome: '',
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
            <DatePicker onChange={this.handleData} placeholder="Data" format="DD-MM-YYYY" />
          </Col>
          <Col span={10} className="form-input">
            <Input addonBefore="Nome" value={this.state.pessoa.nome} disabled />
          </Col>
          <Col span={6} className="form-input">
            <Input addonBefore="CNPJ" value={cnpjMask(this.state.pessoa.cnpj)} disabled />
          </Col>
        </Row>
        <Row
          type="flex"
          justify="end"
          gutter={16}
        >
          <Col
            style={{
              marginTop: '5px',
            }}
          >
            {this.props.printer}
          </Col>
          <Col
            style={{
              marginTop: '5px',
            }}
          >
            <Button
              onClick={this.handleUpdate}
              disabled={!this.state.update}
              loading={this.state.updateLoading}
            >
                Atualizar
            </Button>
          </Col>
          <Col
            style={{
              marginTop: '5px',
            }}
          >
            <Button
              type="primary"
              onClick={this.handleSubmit}
              disabled={!this.state.submit}
              loading={this.state.submitLoading}
            >
              Selecionar
            </Button>
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default VisualizarForm;
