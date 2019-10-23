import React, { Component, Fragment } from 'react';
import {
  Table,
  Row,
  Col,
} from 'antd';

import {
  EstoqueTabelaInput,
  EstoqueTabelaDatePicker,
  EstoqueTabelaButtonUpload,
  EstoqueTabelaCheckbox,
  EstoqueAddButton,
} from '.';

import Connect from '../store/Connect';



class EstoqueTable extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filtros: {
        ativo: [true],
        dataSaida: ['null'],
      },
    };
  }

  handleChange = (pagination, filtros) => {
    this.setState({ filtros });
  }

  render() {
    const { filtros } = this.state;
    const dados = this.props.store.estoqueArray;

    const columns = [
      {
        title: 'Editar',
        dataIndex: 'id',
        key: 'id',
        render: id => (
          <EstoqueTabelaButtonUpload id={id} />
        ),
      },
      {
        title: 'Data Entrada',
        dataIndex: 'dataEntrada',
        key: 'dataEntrada',
        sorter: (a, b) => new Date(a.dataEntrada) - new Date(b.dataEntrada),
        defaultSortOrder: 'ascend',
        render: (v, e) => (
          <EstoqueTabelaDatePicker
            value={v}
            name="dataEntrada"
            id={e.id}
          />
        ),
      },
      {
        title: 'Data Saída',
        dataIndex: 'dataSaida',
        key: 'dataSaida',
        filters: [{ text: 'Apenas em Estoque', value: 'null' }],
        filteredValue: filtros.dataSaida || null,
        onFilter: (value, record) => {
          if (value === 'null') {
            return record.dataSaida === null;
          }
          return true;
        },
        render: (v, e) => (
          <EstoqueTabelaDatePicker
            value={v}
            name="dataSaida"
            id={e.id}
          />
        ),
      },
      {
        title: 'Valor Entrada',
        dataIndex: 'valorEntrada',
        key: 'valorEntrada',
        render: (v, e) => (
          <EstoqueTabelaInput
            value={v}
            name="valorEntrada"
            id={e.id}
          />
        ),
      },
      {
        title: 'Código Produto',
        dataIndex: 'produtoCodigo',
        key: 'produtoCodigo',
        render: (v, e) => (
          <EstoqueTabelaInput
            value={v}
            name="produtoCodigo"
            id={e.id}
          />
        ),
      },
      {
        title: 'Descrição',
        dataIndex: 'descricao',
        key: 'descricao',
        render: (v, e) => (
          <EstoqueTabelaInput
            value={v}
            name="descricao"
            id={e.id}
          />
        ),
      },
      {
        title: 'NF Entrada',
        dataIndex: 'notaInicialChave',
        key: 'notaInicialChave',
        render: (v, e) => (
          <EstoqueTabelaInput
            value={v}
            name="notaInicialChave"
            id={e.id}
          />
        ),
      },
      {
        title: 'NF Saída',
        dataIndex: 'notaFinalChave',
        key: 'notaFinalChave',
        render: (v, e) => (
          <EstoqueTabelaInput
            value={v}
            name="notaFinalChave"
            id={e.id}
          />
        ),
      },
      {
        title: 'Ativo',
        dataIndex: 'ativo',
        key: 'ativo',
        filters: [{ text: 'Apenas Ativos', value: true }],
        filteredValue: filtros.ativo || null,
        onFilter: (value, record) => record.ativo === value,
        render: (v, e) => (
          <EstoqueTabelaCheckbox
            ativo={v}
            id={e.id}
          />
        ),
      },
    ];

    return (
      <Fragment>
        <Row type="flex" justify="end" align="top">
          <EstoqueAddButton />
        </Row>
        <Row>
          <Col>
            <Table
              rowKey="id"
              bordered
              columns={columns}
              dataSource={dados}
              onChange={this.handleChange}
            />
          </Col>
        </Row>
      </Fragment>
    );
  }
}

export default Connect(EstoqueTable);
