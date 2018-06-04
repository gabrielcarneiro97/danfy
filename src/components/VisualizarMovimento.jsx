import React from 'react';
import axios from 'axios';
import { VisualizarForm, VisualizarTables } from '.';

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
    axios.get('https://us-central1-danfy-4d504.cloudfunctions.net/pegarTudoTrimestre', {
      params: {
        cnpj,
        mes,
        ano,
      },
    }).then((res) => {
      this.setState({
        dados: res.data,
      }, () => {
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
