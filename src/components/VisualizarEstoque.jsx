import React, { Component, Fragment } from 'react';
import axios from 'axios';

import { VisualizarEstoqueForm, EstoqueTable } from '.';
import { api } from '../services';

import Connect from '../store/Connect';

import { carregarEstoque } from '../store/estoque';

import './VisualizarMovimento.css';

class VisualizarEstoque extends Component {
  state = {
    dados: [],
    printer: '',
  };

  pegarEstoque = async (dados) => {
    const { data } = await axios.get(`${api}/estoque/${dados.cnpj}`, {
      params: {
        data: dados.diaMesAno,
      },
    });

    this.props.dispatch(carregarEstoque(data));

    return true;
  }

  atualizarEstoque = async (dados) => {
    const { data } = await axios.put(
      `${api}/estoque/${dados.cnpj}`,
      {}, {
        params: {
          data: dados.diaMesAno,
        },
      },
    );

    this.props.dispatch(carregarEstoque(data.estoqueAtualizado));

    return true;
  }

  tableChange = async (modificado) => {
    const { dados } = this.state;

    const i = dados.findIndex(el => el.id === modificado.id);

    dados[i] = {
      ...dados[i],
      ...modificado,
    };

    try {
      await axios.put(
        `${api}/estoque/${dados.cnpj}/${dados[i].id}`,
        dados[i],
      );

      this.setState({ dados });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  render() {
    return (
      <Fragment>
        <div>
          <VisualizarEstoqueForm
            onSubmit={this.pegarEstoque}
            onUpdate={this.atualizarEstoque}
            printer={this.state.printer}
          />
        </div>
        <div style={{ marginTop: '30px' }}>
          <EstoqueTable onChange={this.tableChange} />
        </div>
      </Fragment>
    );
  }
}

export default Connect(VisualizarEstoque);
