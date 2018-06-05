import React from 'react';
import axios from 'axios';

import { VisualizarForm, VisualizarTables } from '.';
import { api } from '../services';

import './VisualizarMovimento.css';

class VisualizarMovimento extends React.Component {
  state = {
    tables: '',
    dados: {},
  };

  handleTableChange = (dados) => {
    this.setState({
      dados,
    }, () => {
      this.setState({
        tables: (<VisualizarTables
          show
          dados={this.state.dados}
          onChange={this.handleTableChange}
        />),
      });
    });
  }

  handleSubmit = ({ cnpj, mes, ano }) => {
    axios.get(`${api}/trimestre`, {
      params: {
        cnpj,
        mes,
        ano,
      },
    }).then((res) => {
      this.setState({
        dados: res.data,
      }, () => {
        console.log(res);
        this.setState({
          tables: (
            <VisualizarTables
              dados={this.state.dados}
              onChange={this.handleTableChange}
            />
          ),
        });
      });
    });
  }

  render() {
    return (
      <div>
        <div>
          <VisualizarForm
            onSubmit={this.handleSubmit}
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
