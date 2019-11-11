import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Table,
  Row,
  Col,
} from 'antd';

import EstoqueTabelaInput from './EstoqueTabelaInput';
import EstoqueTabelaDatePicker from './EstoqueTabelaDatePicker';
import EstoqueTabelaButtonUpload from './EstoqueTabelaButtonUpload';
import EstoqueTabelaCheckbox from './EstoqueTabelaCheckbox';
import EstoqueAddButton from './EstoqueAddButton';

import Connect from '../store/Connect';

function EstoqueTable(props) {
  const { store } = props;
  const { estoqueArray, modificadosId } = store;

  const [filtros, setFiltros] = useState({ ativo: [true], dataSaida: ['null'] });

  const handleChange = (pag, filters) => setFiltros(filters);

  const columns = [
    {
      title: 'Editar',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <EstoqueTabelaButtonUpload id={id} />,
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
          return record.dataSaida === null || modificadosId.includes(record.id);
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
    <>
      <Row type="flex" justify="end" align="top">
        <EstoqueAddButton />
      </Row>
      <Row>
        <Col>
          <Table
            rowKey="id"
            bordered
            columns={columns}
            dataSource={estoqueArray}
            onChange={handleChange}
          />
        </Col>
      </Row>
    </>
  );
}

EstoqueTable.propTypes = {
  store: PropTypes.shape({
    estoqueArray: PropTypes.array,
    modificadosId: PropTypes.array,
  }).isRequired,
};

export default Connect(EstoqueTable);
