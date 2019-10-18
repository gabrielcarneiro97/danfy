import React, { Component, Fragment } from 'react';
import { Table } from 'antd';
import moment from 'moment';

import {
  EstoqueTabelaInput,
  EstoqueTabelaDatePicker,
  EstoqueTabelaButtonUpload,
  EstoqueTabelaCheckbox,
} from '.';

import Connect from '../store/Connect';

function formataDados(dados) {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });


  return dados.map(each => ({
    ...each,
    dataEntrada: each.dataEntrada ? moment(new Date(each.dataEntrada)) : null,
    dataSaida: each.dataSaida ? moment(new Date(each.dataSaida)) : null,
    valorEntrada: formatter.format(each.valorEntrada),
  }));
}

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
        sorter: (a, b) => a.dataEntrada.unix() - b.dataEntrada.unix(),
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
            return !moment.isMoment(record.dataSaida);
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
        <Table
          rowKey="id"
          bordered
          columns={columns}
          dataSource={formataDados(dados)}
          onChange={this.handleChange}
        />
      </Fragment>
    );
  }
}

export default Connect(EstoqueTable);
