import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import TableToPrint from './TableToPrint';
import { R$ } from '../services';

import Connect from '../store/Connect';

function PrintEstoque(props) {
  const { store } = props;

  const { estoqueArray, estoqueInfosGerais } = store;

  const { diaMesAno } = estoqueInfosGerais;

  const data = estoqueArray.length > 0 ? estoqueArray.reduce((res, prodParam) => {
    const produto = { ...prodParam };
    if (!produto.ativo) return [...res];
    if (moment(produto.dataSaida).isAfter(diaMesAno) || produto.dataSaida === null) {
      produto.nfEntradaNum = parseInt(produto.notaInicialChave.slice(25, 34), 10);
      produto.valorEntrada = R$(produto.valorEntrada);
      produto.dataEntradaFormatada = moment(produto.dataEntrada).format('DD/MM/YYYY');
      return [...res, produto];
    }
    return [...res];
  }, []) : [];

  data.sort((a, b) => new Date(a.dataEntrada) - new Date(b.dataEntrada));

  const columns = [
    {
      title: 'Data Entrada',
      dataIndex: 'dataEntradaFormatada',
      key: 'dataEntradaFormatada',
    },
    {
      title: 'NF Entrada',
      dataIndex: 'nfEntradaNum',
      key: 'nfEntradaNum',
    },
    {
      title: 'Valor Entrada',
      dataIndex: 'valorEntrada',
      key: 'valorEntrada',
    },
    {
      title: 'Código Produto',
      dataIndex: 'produtoCodigo',
      key: 'produtoCodigo',
    },
    {
      title: 'Descrição',
      dataIndex: 'descricao',
      key: 'descricao',
    },
  ];

  return (
    <>
      <TableToPrint columns={columns} dataSource={data} />
    </>
  );
}

PrintEstoque.propTypes = {
  store: PropTypes.shape({
    estoqueArray: PropTypes.array,
    estoqueInfosGerais: PropTypes.shape({
      diaMesAno: PropTypes.string,
    }),
  }).isRequired,
};

export default Connect(PrintEstoque);
