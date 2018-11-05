import React from 'react';
import axios from 'axios';

import { VisualizarForm, VisualizarTables, Printer, Loader } from '.';
import { api } from '../services';

import './VisualizarMovimento.css';

class VisualizarMovimento extends React.Component {
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
          dados={this.state.dados}
          onChange={this.handleTableChange}
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
      <div>
        <div>
          <VisualizarForm
            onSubmit={this.handleSubmit}
            printer={this.state.printer}
          />
        </div>
        <div style={{ marginTop: '30px' }}>
          {this.state.tables}
        </div>
      </div>
    );
  }
}

export default VisualizarMovimento;
