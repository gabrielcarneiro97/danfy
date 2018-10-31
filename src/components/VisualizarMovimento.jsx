import React from 'react';
import axios from 'axios';
import { Row, Col } from 'antd';

import { VisualizarForm, VisualizarTables, Printer } from '.';
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

  handleSubmit = (dados) => {
    const {
      cnpj,
      mes,
      ano,
    } = dados;

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
        }, () => console.log(this.state));
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
        <Row type="flex" justify="end" style={{ marginTop: '3px' }}>
          <Col span={23} style={{ textAlign: 'right' }}>
            {this.state.printer}
          </Col>
        </Row>
        <div style={{ marginTop: '30px' }}>
          {this.state.tables}
        </div>
      </div>
    );
  }
}

export default VisualizarMovimento;
