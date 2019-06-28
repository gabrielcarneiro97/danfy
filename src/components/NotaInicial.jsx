import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Input, Button, Popconfirm } from 'antd';

import { api, floating } from '../services';

const InputGroup = Input.Group;

class NotaInicial extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    notaInicial: PropTypes.shape({
      geral: PropTypes.object,
    }),
    notaFinal: PropTypes.shape({
      emitente: PropTypes.string,
    }).isRequired,
    movimentoPoolWithIndex: PropTypes.shape({
      movimento: PropTypes.shape({
        notaFinalChave: PropTypes.string,
        notaInicialChave: PropTypes.string,
      }),
    }).isRequired,
  }

  static defaultProps = {
    notaInicial: {},
  }

  state = {
    valorInput: this.props.notaInicial ? parseInt(this.props.notaInicial.geral.numero, 10) : '',
  }

  onChangeInput = (e) => {
    this.setState({ valorInput: e.target.value });
  }

  handleClick = async () => {
    const { movimentoPoolWithIndex, notaFinal } = this.props;
    const { movimento } = movimentoPoolWithIndex;

    if (movimento.notaInicialChave) {
      const { data } = await axios.get(`${api}/movimentos/slim`, {
        params: {
          valorInicial: 0,
          notaFinalChave: movimento.notaFinalChave,
          cnpj: notaFinal.emitenteCpfcnpj,
        },
      });
      const { movimentoPool } = data;
      this.setState({ valorInput: '' });
      movimentoPool.movimento.conferido = false;
      movimentoPool.movimento.notaInicialChave = null;

      console.log({
        ...movimentoPool,
        index: movimentoPoolWithIndex.index,
      });

      this.props.onChange({
        ...movimentoPool,
        index: movimentoPoolWithIndex.index,
      });
    } else if (!Number.isNaN(floating(this.state.valorInput))) {
      const { data } = await axios.get(`${api}/movimentos/slim`, {
        params: {
          valorInicial: floating(this.state.valorInput),
          notaFinalChave: movimento.notaFinalChave,
          cnpj: notaFinal.emitenteCpfcnpj,
        },
      });

      const { movimentoPool, notaInicialPool } = data;
      this.setState({ valorInput: 'INTERNO' });
      movimentoPool.movimento.conferido = false;

      this.props.onChange({
        ...movimentoPool,
        index: movimentoPoolWithIndex.index,
      }, notaInicialPool);
    }
  };

  defineTextoPop = () => (this.props.movimentoPoolWithIndex.movimento.notaInicialChave ? 'Deseja mesmo excluir essa nota?' : 'Deseja adicionar esse valor?');

  defineIcon = () => (this.props.movimentoPoolWithIndex.movimento.notaInicialChave ? 'close' : 'plus');

  inputRender = () => (
    <Input
      size="small"
      style={{ width: 68 }}
      placeholder="Valor"
      value={this.state.valorInput}
      onChange={this.onChangeInput}
      disabled={this.props.movimentoPoolWithIndex.movimento.notaInicialChave !== null}
    />
  );

  buttonRender = () => (
    <Popconfirm
      title={this.defineTextoPop()}
      onConfirm={this.handleClick}
      okText="Sim"
      cancelText="Não"
    >
      <Button
        icon={this.defineIcon()}
        size="small"
      />
    </Popconfirm>
  );

  render() {
    return (
      <InputGroup
        style={{ width: 100 }}
      >
        {this.inputRender()}
        {this.buttonRender()}
      </InputGroup>
    );
  }
}

export default NotaInicial;
