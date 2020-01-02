import React from 'react';
import { Row, Col, Table } from 'antd';

import TableToPrint from './TableToPrint';
import { R$ } from '../services/calculador.service';

import Connect from '../store/Connect';
import { MovimentoStore, MesesNum } from '../types';

type propTypes = {
  printable : boolean;
  store : MovimentoStore;
}

function GuiasTable(props : propTypes) : JSX.Element {
  const { store, printable = false } = props;
  const { trimestreData, competencia, empresa } = store;
  const { movimentosPool, servicosPool } = trimestreData;
  const { mes } = competencia || { mes: '' };

  const temMovimentos = movimentosPool.length > 0;
  const temServicos = servicosPool.length > 0;

  const columns : any = [];
  const dataSource : any = [];
  const data : any = {};

  const mesNum = parseInt(mes, 10) as MesesNum;

  const mesData = trimestreData[mesNum];

  if (!mesData || !trimestreData || !trimestreData.trim || !empresa) {
    dataSource.push({});
  } else {
    const { acumulado, retencao, impostoPool } = mesData.totalSomaPool;
    const { imposto, icms } = impostoPool;
    const trimestre = trimestreData.trim.totalSomaPool;

    if (temMovimentos) {
      columns.push({
        title: 'ICMS',
        dataIndex: 'icms',
        key: 'icms',
      });
      data.icms = R$(icms.proprio + icms.difalOrigem);
    }

    if (temServicos) {
      columns.push({
        title: 'ISS',
        dataIndex: 'iss',
        key: 'iss',
      });
      data.iss = R$(imposto.iss - (retencao.iss || 0));
    }

    columns.push({
      title: 'PIS',
      dataIndex: 'pis',
      key: 'pis',
    });

    data.pis = R$((imposto.pis - (retencao.pis || 0)) + acumulado.pis);

    columns.push({
      title: 'COFINS',
      dataIndex: 'cofins',
      key: 'cofins',
    });

    data.cofins = R$((imposto.cofins - (retencao.cofins || 0)) + acumulado.cofins);

    if (parseInt(mes, 10) % 3 === 0
    && empresa.formaPagamento !== 'LUCRO PRESUMIDO - PAGAMENTO ANTECIPADO') {
      columns.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
      });
      data.csll = R$(trimestre.impostoPool.imposto.csll - (trimestre.retencao.csll || 0));

      columns.push({
        title: 'IRPJ + ADICIONAL',
        dataIndex: 'irpj',
        key: 'irpj',
      });
      data.irpj = R$((trimestre.impostoPool.imposto.irpj - (trimestre.retencao.irpj || 0))
      + trimestre.impostoPool.imposto.adicionalIr);
    } else if (parseInt(mes, 10) % 3 !== 0
      && empresa.formaPagamento === 'LUCRO PRESUMIDO - PAGAMENTO ANTECIPADO') {
      columns.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
      });

      data.csll = R$(imposto.csll - (retencao.csll || 0));

      columns.push({
        title: 'IRPJ',
        dataIndex: 'irpj',
        key: 'irpj',
      });
      data.irpj = R$(imposto.irpj - (retencao.irpj || 0));
    } else if (parseInt(mes, 10) % 3 === 0
      && empresa.formaPagamento === 'LUCRO PRESUMIDO - PAGAMENTO ANTECIPADO') {
      columns.push({
        title: 'CSLL',
        dataIndex: 'csll',
        key: 'csll',
      });
      data.csll = R$(imposto.csll - (retencao.csll || 0));

      columns.push({
        title: 'IRPJ + ADICIONAL',
        dataIndex: 'irpj',
        key: 'irpj',
      });
      data.irpj = R$((imposto.irpj - (retencao.irpj || 0))
      + trimestre.impostoPool.imposto.adicionalIr);
    }

    data.key = 'guias';
    dataSource.push(data);
  }

  if (printable) {
    return (
      <TableToPrint
        dataSource={dataSource}
        columns={columns}
      />
    );
  }

  return (
    <Row
      type="flex"
      justify="center"
    >
      <Col span={23}>
        <Table
          bordered
          size="small"
          columns={columns}
          dataSource={dataSource}
          pagination={{ position: undefined }}
          style={{
            marginBottom: '20px',
          }}
        />
      </Col>
    </Row>
  );
}

export default Connect(GuiasTable);
