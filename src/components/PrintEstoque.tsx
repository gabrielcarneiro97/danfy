import React, { useRef } from 'react';
import moment from 'moment';
import ReactToPrint from 'react-to-print';
import {
  Button,
  Col,
  Row,
  Divider,
} from 'antd';

import TableToPrint from './TableToPrint';
import { R$, cnpjMask } from '../services/calculador.service';

import { useStore } from '../store/Connect';
import { EstoqueStore, ProdutoEstoqueLite } from '../types';


function PrintEstoque() : JSX.Element {
  const store = useStore<EstoqueStore>();

  const { estoqueArray, estoqueInfosGerais } = store;

  const { diaMesAno } = estoqueInfosGerais;

  const data = estoqueArray.length > 0 ? estoqueArray.reduce((res, prodParam) => {
    const produto = { ...prodParam };
    if (!produto.ativo) return [...res];
    if (moment(produto.dataSaida || 0).isAfter(diaMesAno || 0) || produto.dataSaida === null) {
      produto.nfEntradaNum = produto.notaInicialChave ? parseInt(produto.notaInicialChave.slice(25, 34), 10) : '';
      produto.valorEntrada = R$(produto.valorEntrada || 0);
      produto.dataEntradaFormatada = moment(produto.dataEntrada || 0).format('DD/MM/YYYY');
      return [...res, produto];
    }
    return [...res];
  }, new Array<ProdutoEstoqueLite>()) : [];

  data.sort(
    (a, b) => new Date(a.dataEntrada || 0).getTime() - new Date(b.dataEntrada || 0).getTime(),
  );

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

  const printRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <ReactToPrint
        trigger={() : JSX.Element => <Button disabled={estoqueArray.length === 0}>Imprimir</Button>}
        content={() : any => printRef.current}
        pageStyle="@page { size: auto;  margin: 13mm; margin-bottom: 10mm } @media print { body { -webkit-print-color-adjust: exact; } }"
      />
      <div style={{ display: 'none' }}>
        <div
          ref={printRef}
        >
          <h2
            style={{
              width: '100%',
              textAlign: 'center',
              marginTop: '2%',
            }}
          >
            {`(${estoqueInfosGerais.numeroSistema}) ${estoqueInfosGerais.nome} - ${cnpjMask(estoqueInfosGerais.cnpj || '')}`}
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

export default PrintEstoque;
