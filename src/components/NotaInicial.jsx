import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Input, Button, Popconfirm } from 'antd';

import { api, floating } from '../services';

class NotaInicial extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    notaInicial: PropTypes.shape({
      geral: PropTypes.object,
    }),
    notaFinal: PropTypes.shape({
      emitente: PropTypes.string,
    }).isRequired,
    movimento: PropTypes.shape({
      notaFinal: PropTypes.string,
      notaInicial: PropTypes.string,
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

  handleClick = () => {
    const { movimento, notaFinal } = this.props;
    if (movimento.notaInicial) {
      axios.get(`${api}/movimentos/valor`, {
        params: {
          notaFinal: movimento.notaFinal,
          cnpj: notaFinal.emitente,
        },
      }).then((res) => {
        this.setState({ valorInput: '' });
        this.props.onChange({
          ...movimento,
          conferido: false,
          notaInicial: null,
          valores: res.data,
        });
      });
    } else if (!Number.isNaN(floating(this.state.valorInput))) {
      axios.get(`${api}/movimentos/slim`, {
        params: {
          valorInicial: floating(this.state.valorInput),
          notaFinal: movimento.notaFinal,
          cnpj: notaFinal.emitente,
        },
      }).then((res) => {
        this.setState({ valorInput: 'INTERNO' });
        this.props.onChange({
          ...movimento,
          conferido: false,
          notaInicial: res.data.notaInicial.chave,
          valores: res.data.valores,
        }, res.data.notaInicial);
      });
    }
  };

  defineTextoPop = () => (this.props.movimento.notaInicial ? 'Deseja mesmo excluir essa nota?' : 'Deseja adicionar esse valor?');

  defineIcon = () => (this.props.movimento.notaInicial ? 'close' : 'plus');

  inputRender = () => (
    <Input
      size="small"
      style={{ width: 68 }}
      placeholder="Valor"
      value={this.state.valorInput}
      onChange={this.onChangeInput}
      disabled={this.props.movimento.notaInicial !== null}
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
      <Input.Group
        style={{ width: 100 }}
      >
        {this.inputRender()}
        {this.buttonRender()}
      </Input.Group >
    );
  }
}

export default NotaInicial;
