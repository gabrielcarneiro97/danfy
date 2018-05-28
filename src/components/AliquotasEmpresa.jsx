import React from 'react';
import { Modal, Button, Input, Row, Col, Select, Checkbox, Divider } from 'antd';
import PropTypes from 'prop-types';

import './AliquotasEmpresa.css';

const { Option } = Select;

class AliquotasEmpresa extends React.Component {
  static aliquotasPadrao = {
    icms: {
      aliquota: 0.18,
      reducao: 0.2778,
    },
    pis: 0.0065,
    cofins: 0.03,
    csll: 0.0288,
    irpj: 0.048,
    iss: 0.03,
  };

  static aliquotasLiminar = {
    icms: {
      aliquota: 0.18,
      reducao: 0.2778,
    },
    pis: 0.0065,
    cofins: 0.03,
    csll: 0.0108,
    irpj: 0.012,
    iss: 0.03,
  };

  state = {
    visible: false,
    tributacao: 'LP',
    formaPagamento: 'adiantamento',

    impostosEmpresa: { ...AliquotasEmpresa.aliquotasPadrao },
  }

  setTributacao = (tributacao) => {
    this.setState({ tributacao });
  }

  setFormaPagamento = (formaPagamento) => {
    this.setState({ formaPagamento });
  }

  setLiminar = (e) => {
    const liminar = e.target.checked;

    if (liminar) {
      this.setState({ impostosEmpresa: { ...AliquotasEmpresa.aliquotasLiminar } });
    } else {
      this.setState({ impostosEmpresa: { ...AliquotasEmpresa.aliquotasPadrao } });
    }
  }

  setIss = (e) => {
    this.setState((prevState) => { // eslint-disable-line
      return {
        impostosEmpresa: { ...this.state.impostosEmpresa, iss: e.target.value },
      };
    });
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  }
  handleOk = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  }
  handleCancel = (e) => {
    console.log(e);
    this.setState({
      visible: false,
    });
  }
  render() {
    const { dados } = this.props;
    const { impostosEmpresa } = this.state;

    return (
      <div>
        <Button onClick={this.showModal} size="small">Adicionar</Button>
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
          <Divider>Informações Gerais</Divider>
          <Row className="row">
            <Col span={12}>
              <Input addonBefore="Número" />
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
          {
            this.state.tributacao === 'LP'
            &&
            <div>
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
            </div>
          }
        </Modal>
      </div>
    );
  }
}

AliquotasEmpresa.propTypes = {
  dados: PropTypes.shape({
    nome: PropTypes.string,
    cnpj: PropTypes.string,
  }).isRequired,
};

export default AliquotasEmpresa;
