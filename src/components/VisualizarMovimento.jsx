import React, { Component } from 'react';
import axios from 'axios';

import {
  VisualizarForm,
  VisualizarTables,
  Printer,
  Loader,
} from '.';
import { api } from '../services';

import './VisualizarMovimento.css';

import { MovimentoStore } from '../store/Store';

class VisualizarMovimento extends Component {
  state = {
    tables: '',
    printer: '',
    dados: {},
  };

  handleTableChange = (dados) => {
    this.setState({
      dados,
    }, () => {
      this.setState({
        printer: <Printer dados={this.state.dados} />,
        tables: (<VisualizarTables
          show
        />),
      });
    });
  }

  handleSubmit = dados => new Promise((resolve) => {
    const {
      cnpj,
      mes,
      ano,
    } = dados;

    this.setState({
      printer: '',
      tables: <Loader />,
    }, () => {
      axios.get(`${api}/trimestre`, {
        params: {
          cnpj,
          mes,
          ano,
        },
      }).then((res) => {
        this.setState({
          dados: {
            ...res.data,
            complementares: dados,
          },
        }, () => {
          this.setState({
            printer: <Printer dados={this.state.dados} />,
            tables: (
              <VisualizarTables
                dados={this.state.dados}
                onChange={this.handleTableChange}
              />
            ),
          }, () => resolve());
        });
      });
    });
  })

  render() {
    return (
      <MovimentoStore>
        <div>
          <VisualizarForm
            onSubmit={this.handleSubmit}
            printer={this.state.printer}
          />
        </div>
        <div style={{ marginTop: '30px' }}>
          <VisualizarTables />
        </div>
      </MovimentoStore>
    );
  }
}

export default VisualizarMovimento;
