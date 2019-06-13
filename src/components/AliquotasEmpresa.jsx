import React, { Component, Fragment } from 'react';
import { Modal, Button, Input, Row, Col, Select, Checkbox, Divider, message } from 'antd';
import PropTypes from 'prop-types';

import { adicionarEmpresaImpostos, adicionarEmpresaDominio } from '../services';

import './AliquotasEmpresa.css';

const { Option } = Select;
const { confirm } = Modal;

class AliquotasEmpresa extends Component {
  static propTypes = {
    dados: PropTypes.shape({
      nome: PropTypes.string,
      cnpj: PropTypes.string,
    }).isRequired,
    onEnd: PropTypes.func.isRequired,
  }

  static aliquotasPadrao = {
    icmsAliquota: 0.18,
    icmsReducao: 0.2778,
    pis: 0.0065,
    cofins: 0.03,
    csll: 0.0288,
    irpj: 0.048,
    iss: 0.03,
  }

  static aliquotasLiminar = {
    icmsAliquota: 0.18,
    icmsReducao: 0.2778,
    pis: 0.0065,
    cofins: 0.03,
    csll: 0.0108,
    irpj: 0.012,
    iss: 0.03,
  }

  state = {
    visible: false,
    tributacao: 'LP',
    formaPagamento: 'adiantamento',
    numero: '',
    impostosEmpresa: { ...AliquotasEmpresa.aliquotasPadrao },
  }

  setTributacao = tributacao => this.setState({ tributacao })

  setFormaPagamento = formaPagamento => this.setState({
    formaPagamento,
  });

  setLiminar = (e) => {
    const liminar = e.target.checked;

    if (liminar) {
      this.setState({ impostosEmpresa: { ...AliquotasEmpresa.aliquotasLiminar } });
    } else {
      this.setState({ impostosEmpresa: { ...AliquotasEmpresa.aliquotasPadrao } });
    }
  }

  setIss = e => this.setState(prevState => ({
    impostosEmpresa: { ...prevState.impostosEmpresa, iss: e.target.value },
  }));

  setNumero = e => this.setState({ numero: e.target.value });

  showModal = () => this.setState({ visible: true });

  handleOk = () => {
    if (parseInt(this.state.numero, 10) > 0 && parseFloat(this.state.impostosEmpresa.iss) >= 0) {
      confirm({
        title: 'Confirmação',
        content: `Deseja adicionar a empresa ${this.props.dados.nome} ao número ${this.state.numero}`,
        onOk: () => {
          this.props.onEnd(this.props.dados.cnpj);
          adicionarEmpresaDominio(this.props.dados.cnpj, this.state.numero)
            .catch(err => console.error(err));

          const { formaPagamento, tributacao } = this.state;

          const aliquotas = {
            ...this.state.impostosEmpresa,
            formaPagamento,
            tributacao,
          };

          adicionarEmpresaImpostos(this.props.dados.cnpj, aliquotas)
            .catch(err => console.error(err));

          this.setState({
            visible: false,
          });
        },
        onCancel: () => {
          this.setState({
            visible: false,
          });
        },
      });
    } else {
      message.error('Número e ISS devem ser preenchidos!');
    }
  }

  handleCancel = () => this.setState({ visible: false });

  informacoesGeraisForm = () => (
    <Fragment>
      <Divider>Informações Gerais</Divider>
      <Row className="row">
        <Col span={12}>
          <Input addonBefore="Número" defaultValue={this.state.numero} onChange={this.setNumero} />
        </Col>
        <Col span={12}>
          <Select onChange={this.setTributacao} defaultValue={this.state.tributacao} style={{ width: '100%' }}>
            <Option value="LP">Lucro Presumido</Option>
            <Option value="SN">Simples Nacional</Option>
          </Select>
        </Col>
      </Row>
      <Row className="row">
        <Col span={12} style={{ marginTop: '5px', marginBottom: '5px' }}>
          <Checkbox onChange={this.setLiminar}>Liminar de Redução</Checkbox>
        </Col>
        <Col span={12}>
          <Select onChange={this.setFormaPagamento} defaultValue={this.state.formaPagamento} style={{ width: '100%' }}>
            <Option value="adiantamento">Adiantamento</Option>
            <Option value="acumulado">Acumulado por Trimestre</Option>
            <Option value="cotas">Pagamento em Cotas</Option>
          </Select>
        </Col>
      </Row>
    </Fragment>
  )

  impostosForm = impostosEmpresa => (
    <Fragment>
      <Divider dashed>Impostos Federais</Divider>
      <Row className="row">
        <Col span={12}>
          <Input addonBefore="IRPJ" value={impostosEmpresa.irpj} disabled />
        </Col>
        <Col span={12}>
          <Input addonBefore="CSLL" value={impostosEmpresa.csll} disabled />
        </Col>
      </Row>
      <Row className="row">
        <Col span={12}>
          <Input addonBefore="PIS" value={impostosEmpresa.pis} disabled />
        </Col>
        <Col span={12}>
          <Input addonBefore="COFINS" value={impostosEmpresa.cofins} disabled />
        </Col>
      </Row>
      <Divider dashed>Impostos Estaduais (ICMS)</Divider>
      <Row className="row">
        <Col span={12}>
          <Input addonBefore="Aliquota" value={impostosEmpresa.icms.aliquota} disabled />
        </Col>
        <Col span={12}>
          <Input addonBefore="Redução" value={impostosEmpresa.icms.reducao} disabled />
        </Col>
      </Row>
      <Divider dashed>Impostos Municipais</Divider>
      <Row className="row">
        <Col span={24}>
          <Input addonBefore="ISS" defaultValue={impostosEmpresa.iss} onChange={this.setIss} />
        </Col>
      </Row>
    </Fragment>
  )

  modalRender = (dados, impostosEmpresa) => (
    <Modal
      title={dados.nome}
      visible={this.state.visible}
      onOk={this.handleOk}
      onCancel={this.handleCancel}
      style={{
        marginTop: '40px',
        position: 'static',
      }}
    >
      {this.informacoesGeraisForm()}
      {
        this.state.tributacao === 'LP'
        &&
        this.impostosForm(impostosEmpresa)
      }
    </Modal>
  );

  render() {
    const { dados } = this.props;
    const { impostosEmpresa } = this.state;

    return (
      <div>
        <Button onClick={this.showModal} size="small">Adicionar</Button>
        {this.modalRender(dados, impostosEmpresa)}
      </div>
    );
  }
}

export default AliquotasEmpresa;
