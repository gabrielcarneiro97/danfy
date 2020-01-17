import React, { useState } from 'react';
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

import { useStore } from '../store/Connect';
import { ProdutoEstoqueLite, EstoqueStore } from '../types';


function EstoqueTable() : JSX.Element {
  const store = useStore<EstoqueStore>();

  const { estoqueArray, modificadosId } = store;

  const [filtros, setFiltros] = useState({ ativo: [true], dataSaida: ['null'] });

  const handleChange = (pag : any, filters : any) : void => setFiltros(filters);

  const temEstoque = estoqueArray.length > 0;

  const columns = [
    {
      title: 'Editar',
      dataIndex: 'id',
      key: 'id',
      render: (id : string | number) : JSX.Element => <EstoqueTabelaButtonUpload id={id} />,
    },
    {
      title: 'Data Entrada',
      dataIndex: 'dataEntrada',
      key: 'dataEntrada',
      sorter: (a : ProdutoEstoqueLite, b : ProdutoEstoqueLite) : number => {
        const dataA = a.dataEntrada ? new Date(a.dataEntrada).getTime() : 0;
        const dataB = b.dataEntrada ? new Date(b.dataEntrada).getTime() : 0;
        return dataA - dataB;
      },
      defaultSortOrder: 'ascend' as 'ascend',
      render: (v : string, e : ProdutoEstoqueLite) : JSX.Element => (
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
      onFilter: (value : string,
        record : ProdutoEstoqueLite) : boolean => {
        if (value === 'null') {
          return record.dataSaida === null || modificadosId.includes(record.id || 0);
        }
        return true;
      },
      render: (v : string, e : ProdutoEstoqueLite) : JSX.Element => (
        <EstoqueTabelaDatePicker
          value={v}
          name="dataSaida"
          id={e.id}
        />
      ),
    },
    {
      title: 'NF Entrada Número',
      render: (v : string, e : ProdutoEstoqueLite) : string | number => {
        if (e.notaInicialChave && e.notaInicialChave.length >= 34) {
          return parseInt(e.notaInicialChave.slice(25, 34), 10);
        }
        return '';
      },
    },
    {
      title: 'Valor Entrada',
      dataIndex: 'valorEntrada',
      key: 'valorEntrada',
      render: (v : string, e : ProdutoEstoqueLite) : JSX.Element => (
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
      render: (v : string, e : ProdutoEstoqueLite) : JSX.Element => (
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
      render: (v : string, e : ProdutoEstoqueLite) : JSX.Element => (
        <EstoqueTabelaInput
          value={v}
          name="descricao"
          id={e.id}
        />
      ),
    },
    {
      title: 'NF Entrada Chave',
      dataIndex: 'notaInicialChave',
      key: 'notaInicialChave',
      render: (v : string, e : ProdutoEstoqueLite) : JSX.Element => (
        <EstoqueTabelaInput
          value={v}
          name="notaInicialChave"
          id={e.id}
        />
      ),
    },
    {
      title: 'NF Saída Chave',
      dataIndex: 'notaFinalChave',
      key: 'notaFinalChave',
      render: (v : string, e : ProdutoEstoqueLite) : JSX.Element => (
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
      filters: [{ text: 'Apenas Ativos', value: 'true' }],
      filteredValue: filtros.ativo || null,
      onFilter: (value : string,
        record : ProdutoEstoqueLite) : boolean => record.ativo?.toString() === value,
      render: (v : boolean, e : ProdutoEstoqueLite) : JSX.Element => (
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
          {
            temEstoque
            && (
              <Table
                rowKey="id"
                bordered
                columns={columns}
                dataSource={estoqueArray}
                onChange={handleChange}
              />
            )
          }
        </Col>
      </Row>
    </>
  );
}

export default EstoqueTable;
