import React from 'react';
import { Table, Row, Col } from 'antd';

import TableToPrint from './TableToPrint';
import { pegaMes, R$ } from '../services/calculador.service';

import { useStore } from '../store/Connect';
import { MovimentoStore, TrimestreData } from '../types';

type propTypes = {
  printable : boolean;
};

function AcumuladosTable(props : propTypes) : JSX.Element {
  const store = useStore<MovimentoStore>();
  const { printable } = props;
  const { trimestreData } = store;

  const stg = (str : string) : JSX.Element => <strong>{str}</strong>;

  const dataSource : {
    key : string;
    mes : string | JSX.Element;
    csll : string | JSX.Element;
    irpj : string | JSX.Element;
    faturamento : string | JSX.Element;
  }[] = [];

  Object.keys(trimestreData).forEach((k) => {
    const key = k as keyof TrimestreData;
    if (key !== 'movimentosPool' && key !== 'servicosPool') {
      const mes = key === 'trim' ? stg('Trimestre') : pegaMes(key);

      const data = trimestreData[key];

      if (!data) return;

      const { totalSomaPool } = data;
      const { retencao, totalSoma } = totalSomaPool;
      const { imposto } = totalSomaPool.impostoPool;

      dataSource.push({
        key: `acumulado-${key}`,
        mes,
        csll: key === 'trim' ? stg(R$(imposto.csll - (retencao.csll || 0))) : R$(imposto.csll - (retencao.csll || 0)),
        irpj: key === 'trim' ? stg(R$(imposto.irpj - (retencao.irpj || 0))) : R$(imposto.irpj - (retencao.irpj || 0)),
        faturamento: key === 'trim' ? stg(R$(totalSoma.valorMovimento + totalSoma.valorServico)) : R$(totalSoma.valorMovimento + totalSoma.valorServico),
      });
    }
  });

  if (printable) {
    return (
      <TableToPrint
        dataSource={dataSource}
        columns={AcumuladosTable.columns}
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
          columns={AcumuladosTable.columns}
          dataSource={dataSource}
          pagination={{ position: undefined }}
          style={{ marginBottom: '20px' }}
        />
      </Col>
    </Row>
  );
}

AcumuladosTable.defaultProps = {
  printable: false,
};

AcumuladosTable.columns = [
  {
    title: 'Mês',
    dataIndex: 'mes',
    key: 'mes',
  }, {
    title: 'CSLL',
    dataIndex: 'csll',
    key: 'csll',
  }, {
    title: 'IRPJ',
    dataIndex: 'irpj',
    key: 'irpj',
  }, {
    title: 'Faturamento',
    dataIndex: 'faturamento',
    key: 'faturamento',
  },
];

export default AcumuladosTable;
