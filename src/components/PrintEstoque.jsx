import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactToPrint from 'react-to-print';
import {
  Button,
  Col,
  Row,
  Divider,
} from 'antd';

import TableToPrint from './TableToPrint';
import { R$, cnpjMask } from '../services';

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

  let printRef = React.createRef();

  return (
    <>
      <ReactToPrint
        trigger={() => <Button disabled={estoqueArray.length === 0}>Imprimir</Button>}
        content={() => printRef}
        pageStyle="@page { size: auto;  margin: 13mm; margin-bottom: 10mm } @media print { body { -webkit-print-color-adjust: exact; } }"
      />
      <div style={{ display: 'none' }}>
        <div
          ref={(el) => { printRef = el; }}
        >
          <h2
            style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '2%',
            }}
          >
            {`(${estoqueInfosGerais.numeroSistema}) ${estoqueInfosGerais.nome} - ${cnpjMask(estoqueInfosGerais.cnpj)}`}
          </h2>
          <Row type="flex" justify="center">
            <Divider orientation="left">{`Estoque - ${diaMesAno && diaMesAno.format('DD/MM/YYYY')}`}</Divider>
            <Col span={24}>
              <TableToPrint columns={columns} dataSource={data} />
            </Col>
          </Row>
        </div>
      </div>
    </>
  );
}

PrintEstoque.propTypes = {
  store: PropTypes.shape({
    estoqueArray: PropTypes.array,
    estoqueInfosGerais: PropTypes.shape({
      diaMesAno: PropTypes.string,
      numeroSistema: PropTypes.string,
      nome: PropTypes.string,
      cnpj: PropTypes.string,
    }),
  }).isRequired,
};

export default Connect(PrintEstoque);
