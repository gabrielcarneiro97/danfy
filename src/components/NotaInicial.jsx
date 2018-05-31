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
    }).isRequired,
    notaFinal: PropTypes.shape({}).isRequired,
    movimento: PropTypes.shape({}).isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      valorInput: props.notaInicial ? parseInt(props.notaInicial.geral.numero, 10) : '',
    };
  }

  onChangeInput = (e) => {
    this.setState({ valorInput: e.target.value });
  }

  render() {
    const { movimento, notaFinal } = this.props;

    const handleClick = () => {
      if (movimento.notaInicial) {
        axios
          .get(`${api}/valoresMovimento?notaFinal=${movimento.notaFinal}&cnpj=${notaFinal.emitente}`)
          .then((res) => {
            this.setState({ valorInput: '' });
            this.props.onChange({
              ...movimento,
              conferido: false,
              notaInicial: null,
              valores: res.data,
            });
          });
      } else if (!Number.isNaN(floating(this.state.valorInput))) {
        axios
          .get(`${api}/movimentoSlim?valorInicial=${this.state.valorInput}&notaFinal=${movimento.notaFinal}&cnpj=${notaFinal.emitente}`)
          .then((res) => {
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

    let textoPop;
    let icon;

    if (movimento.notaInicial) {
      textoPop = 'Deseja mesmo excluir essa nota?';
      icon = 'close';
    } else {
      textoPop = 'Deseja adicionar esse valor?';
      icon = 'plus';
    }

    return (
      <Input.Group
        style={{ width: 100 }}
      >
        <Input
          size="small"
          style={{ width: 68 }}
          placeholder="Valor"
          value={this.state.valorInput}
          onChange={this.onChangeInput}
          disabled={movimento.notaInicial !== null}
        />
        <Popconfirm
          title={textoPop}
          onConfirm={handleClick}
          okText="Sim"
          cancelText="Não"
        >
          <Button
            icon={icon}
            size="small"
          />
        </Popconfirm>
      </Input.Group >
    );
  }
}

export default NotaInicial;
