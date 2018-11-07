import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal, Input } from 'antd';

import { floating, R$ } from '../services';

class AdicionalDeducaoBtn extends Component {
  static propTypes = {
    complementares: PropTypes.object.isRequired, // eslint-disable-line
    imposto: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired,
    totais: PropTypes.object.isRequired, // eslint-disable-line
  };

  constructor(props) {
    super(props);

    const { totais, imposto } = props;
    const { adicionais, deducoes } = totais;

    let adicional = 0;
    if (adicionais) adicional = adicionais[imposto];

    let deducao = 0;
    if (deducoes) deducao = deducoes[imposto];

    this.state = {
      adicional,
      deducao,
      disable: false,
      modal: {
        tipo: '',
        input: '',
        show: false,
      },
    };
  }

  onImpostoChange = () => {
    this.setState({
      disable: false,
    });
  }

  modalOk = () => {
    const { tipo, input } = this.state.modal;
    const valAnterior = this.state[tipo];

    if ((valAnterior !== floating(input)) || floating(input) === 0) {
      this.props.onChange(floating(input), tipo, this.props.imposto)
        .then(() => {
          this.onImpostoChange();
        });
      this.setState({
        disable: true,
        modal: {
          tipo: '',
          input: '',
          show: false,
        },
      });
    } else {
      this.setState({
        modal: {
          tipo: '',
          input: '',
          show: false,
        },
      });
    }
  }

  modalCancel = () => {
    this.setState({
      modal: {
        tipo: '',
        input: '',
        show: false,
      },
    });
  }

  dedAbrirModal = () => {
    this.setState(prevState => ({
      modal: {
        tipo: 'deducao',
        input: R$(prevState.deducao),
        show: true,
      },
    }));
  }

  adAbrirModal = () => {
    this.setState(prevState => ({
      modal: {
        tipo: 'adicional',
        input: R$(prevState.adicional),
        show: true,
      },
    }));
  }

  handleModalInput = (e) => {
    const { value } = e.target;

    this.setState(prevState => ({
      modal: {
        ...prevState.modal,
        input: value,
      },
    }));
  }

  render() {
    return (
      <Fragment>
        <Button
          icon="plus"
          size="small"
          shape="circle"
          type="ghost"
          disabled={this.state.disable}
          onClick={this.adAbrirModal}
        />
        <Button
          icon="minus"
          size="small"
          shape="circle"
          type="ghost"
          disabled={this.state.disable}
          onClick={this.dedAbrirModal}
        />
        <Modal
          visible={this.state.modal.show}
          onOk={this.modalOk}
          onCancel={this.modalCancel}
        >
          <Input onChange={this.handleModalInput} value={this.state.modal.input} />
        </Modal>
      </Fragment>
    );
  }
}

export default AdicionalDeducaoBtn;
